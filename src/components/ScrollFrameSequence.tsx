import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { getPerformanceTier } from "../utils/performanceProfile";
import "./ScrollFrameSequence.css";

export interface ScrollFrameSequenceHandle {
  setProgress: (progress: number) => void;
}

interface MutableNumberRef {
  current: number;
}

interface ScrollFrameSequenceProps {
  frameCount: number;
  progressRef: MutableNumberRef;
  onFirstFrameReady?: () => void;
}

interface FrameAsset {
  source: CanvasImageSource;
  width: number;
  height: number;
  dispose: () => void;
}

const FRAME_ROOT = "/animations/what-we-build";

const ScrollFrameSequence = forwardRef<ScrollFrameSequenceHandle, ScrollFrameSequenceProps>(
  function ScrollFrameSequence({ frameCount, progressRef, onFirstFrameReady }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const loadingLabelRef = useRef<HTMLSpanElement>(null);
    const setProgressImplementationRef = useRef<(progress: number) => void>(() => undefined);

    useImperativeHandle(ref, () => ({
      setProgress: (progress: number) => setProgressImplementationRef.current(progress),
    }), []);

    useEffect(() => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      const loadingLabel = loadingLabelRef.current;
      if (!container || !canvas || !loadingLabel) return;

      const context = canvas.getContext("2d", { alpha: true });
      if (!context) return;

      const assets: Array<FrameAsset | null> = Array.from({ length: frameCount }, () => null);
      const controllers = new Map<number, AbortController>();
      const queued = new Set<number>();
      const failed = new Set<number>();
      const loadQueue: Array<{ index: number; highPriority: boolean }> = [];
      const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
      const mobileMedia = window.matchMedia("(max-width: 820px)");
      const lowQuality = getPerformanceTier() === "low";
      let requestedFrame = 0;
      let drawnFrame = -1;
      let isVisible = false;
      let disposed = false;
      let firstFrameReported = false;
      let activeLoads = 0;
      let resizeFrame = 0;

      const frameUrl = (index: number) =>
        `${FRAME_ROOT}/frame-${String(index + 1).padStart(4, "0")}.png`;

      const normalizedFrame = (index: number) => {
        if (!mobileMedia.matches || index === frameCount - 1) return index;
        return Math.min(frameCount - 1, Math.round(index / 2) * 2);
      };

      const resizeBackingStore = () => {
        const bounds = container.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, mobileMedia.matches || lowQuality ? 1 : 1.35);
        const width = Math.max(1, Math.round(bounds.width * dpr));
        const height = Math.max(1, Math.round(bounds.height * dpr));
        if (canvas.width === width && canvas.height === height) return false;
        canvas.width = width;
        canvas.height = height;
        return true;
      };

      const drawFrame = (index: number) => {
        if (!isVisible) return;
        const asset = assets[index];
        if (!asset) return;

        resizeBackingStore();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const imageRatio = asset.width / asset.height;
        const canvasRatio = canvasWidth / canvasHeight;
        const drawWidth = imageRatio > canvasRatio ? canvasWidth : canvasHeight * imageRatio;
        const drawHeight = imageRatio > canvasRatio ? canvasWidth / imageRatio : canvasHeight;

        context.clearRect(0, 0, canvasWidth, canvasHeight);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = mobileMedia.matches ? "medium" : "high";
        context.drawImage(asset.source, (canvasWidth - drawWidth) / 2, (canvasHeight - drawHeight) / 2, drawWidth, drawHeight);
        drawnFrame = index;
        canvas.dataset.frame = String(index + 1);

        if (!firstFrameReported) {
          firstFrameReported = true;
          loadingLabel.classList.add("is-ready");
          onFirstFrameReady?.();
        }
      };

      const nearestLoadedFrame = (target: number) => {
        if (assets[target]) return target;
        const stride = mobileMedia.matches ? 2 : 1;
        for (let distance = stride; distance < frameCount; distance += stride) {
          const before = target - distance;
          const after = target + distance;
          if (before >= 0 && assets[before]) return before;
          if (after < frameCount && assets[after]) return after;
        }
        return assets[0] ? 0 : -1;
      };

      const drawRequestedFrame = () => {
        const fallback = nearestLoadedFrame(requestedFrame);
        if (fallback >= 0 && fallback !== drawnFrame) drawFrame(fallback);
      };

      const decodeFrame = async (index: number, signal: AbortSignal): Promise<FrameAsset> => {
        const response = await fetch(frameUrl(index), { signal, cache: "force-cache" });
        if (!response.ok) throw new Error(`Frame ${index + 1} failed to load`);
        const blob = await response.blob();

        if ("createImageBitmap" in window) {
          const bitmap = await createImageBitmap(blob);
          return { source: bitmap, width: bitmap.width, height: bitmap.height, dispose: () => bitmap.close() };
        }

        return new Promise<FrameAsset>((resolve, reject) => {
          const image = new Image();
          const objectUrl = URL.createObjectURL(blob);
          const clean = () => URL.revokeObjectURL(objectUrl);
          const abort = () => {
            image.src = "";
            clean();
            reject(new DOMException("Aborted", "AbortError"));
          };
          signal.addEventListener("abort", abort, { once: true });
          image.onload = () => {
            signal.removeEventListener("abort", abort);
            clean();
            resolve({ source: image, width: image.naturalWidth, height: image.naturalHeight, dispose: () => { image.src = ""; } });
          };
          image.onerror = () => {
            signal.removeEventListener("abort", abort);
            clean();
            reject(new Error(`Frame ${index + 1} failed to decode`));
          };
          image.decoding = "async";
          image.src = objectUrl;
        });
      };

      const pumpLoadQueue = () => {
        const concurrentLimit = mobileMedia.matches || lowQuality ? 2 : 4;
        while (!disposed && activeLoads < concurrentLimit && loadQueue.length > 0) {
          const nextIndex = loadQueue.findIndex((request) => isVisible || request.highPriority);
          if (nextIndex < 0) return;
          const request = loadQueue.splice(nextIndex, 1)[0];
          queued.delete(request.index);
          if (assets[request.index] || controllers.has(request.index) || failed.has(request.index)) continue;

          const controller = new AbortController();
          controllers.set(request.index, controller);
          activeLoads += 1;
          decodeFrame(request.index, controller.signal)
            .then((asset) => {
              if (disposed) asset.dispose();
              else {
                assets[request.index] = asset;
                if (request.index === requestedFrame || drawnFrame < 0) drawRequestedFrame();
              }
            })
            .catch((error: unknown) => {
              if (!(error instanceof DOMException && error.name === "AbortError")) failed.add(request.index);
            })
            .finally(() => {
              activeLoads -= 1;
              controllers.delete(request.index);
              pumpLoadQueue();
            });
        }
      };

      const loadFrame = (rawIndex: number, highPriority = false) => {
        const index = normalizedFrame(rawIndex);
        if (index < 0 || index >= frameCount || assets[index] || controllers.has(index) || queued.has(index) || failed.has(index)) return;
        queued.add(index);
        const request = { index, highPriority };
        if (highPriority) loadQueue.unshift(request);
        else loadQueue.push(request);
        pumpLoadQueue();
      };

      const trimCache = (centre: number) => {
        const keepRadius = mobileMedia.matches || lowQuality ? 8 : 16;
        for (let index = loadQueue.length - 1; index >= 0; index -= 1) {
          const request = loadQueue[index];
          if (request.index !== 0 && request.index !== frameCount - 1 && Math.abs(request.index - centre) > keepRadius) {
            queued.delete(request.index);
            loadQueue.splice(index, 1);
          }
        }
        assets.forEach((asset, index) => {
          if (!asset || index === 0 || index === frameCount - 1 || Math.abs(index - centre) <= keepRadius) return;
          asset.dispose();
          assets[index] = null;
        });
      };

      const preloadAround = (centre: number) => {
        const radius = mobileMedia.matches || lowQuality ? 4 : 9;
        const stride = mobileMedia.matches ? 2 : 1;
        loadFrame(centre, true);
        if (isVisible) {
          for (let distance = stride; distance <= radius; distance += stride) {
            loadFrame(centre + distance, distance <= stride * 2);
            loadFrame(centre - distance, distance <= stride * 2);
          }
        }
        trimCache(centre);
      };

      const updateProgress = (progress: number) => {
        if (reducedMotionMedia.matches) return;
        const safeProgress = Math.min(1, Math.max(0, progress));
        const nextFrame = normalizedFrame(Math.round(safeProgress * (frameCount - 1)));
        if (nextFrame === requestedFrame && drawnFrame === nextFrame) return;
        requestedFrame = nextFrame;
        if (isVisible) {
          drawRequestedFrame();
          preloadAround(nextFrame);
        }
      };

      const handlePreferenceChange = () => {
        requestedFrame = reducedMotionMedia.matches
          ? frameCount - 1
          : normalizedFrame(Math.round(progressRef.current * (frameCount - 1)));
        preloadAround(requestedFrame);
        drawRequestedFrame();
      };

      setProgressImplementationRef.current = updateProgress;

      const resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
          if (!isVisible) return;
          if (resizeBackingStore()) drawRequestedFrame();
        });
      });
      resizeObserver.observe(container);

      const visibilityObserver = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        canvas.dataset.visible = String(isVisible);
        if (isVisible) {
          preloadAround(requestedFrame);
          drawRequestedFrame();
        } else {
          canvas.width = 1;
          canvas.height = 1;
          drawnFrame = -1;
          for (let index = loadQueue.length - 1; index >= 0; index -= 1) {
            if (!loadQueue[index].highPriority) {
              queued.delete(loadQueue[index].index);
              loadQueue.splice(index, 1);
            }
          }
          controllers.forEach((controller, index) => {
            if (index !== requestedFrame && index !== 0 && index !== frameCount - 1) controller.abort();
          });
          assets.forEach((asset, index) => {
            if (!asset || index === requestedFrame || index === 0 || index === frameCount - 1) return;
            asset.dispose();
            assets[index] = null;
          });
        }
      }, { rootMargin: "20% 0px" });
      visibilityObserver.observe(container);

      reducedMotionMedia.addEventListener("change", handlePreferenceChange);
      mobileMedia.addEventListener("change", handlePreferenceChange);

      requestedFrame = reducedMotionMedia.matches
        ? frameCount - 1
        : normalizedFrame(Math.round(Math.min(1, Math.max(0, progressRef.current)) * (frameCount - 1)));
      loadFrame(0, true);
      loadFrame(frameCount - 1, reducedMotionMedia.matches);
      preloadAround(requestedFrame);

      return () => {
        disposed = true;
        cancelAnimationFrame(resizeFrame);
        loadQueue.length = 0;
        queued.clear();
        controllers.forEach((controller) => controller.abort());
        controllers.clear();
        resizeObserver.disconnect();
        visibilityObserver.disconnect();
        reducedMotionMedia.removeEventListener("change", handlePreferenceChange);
        mobileMedia.removeEventListener("change", handlePreferenceChange);
        setProgressImplementationRef.current = () => undefined;
        assets.forEach((asset) => asset?.dispose());
      };
    }, [frameCount, onFirstFrameReady, progressRef]);

    return (
      <div ref={containerRef} className="scroll-frame-sequence" aria-hidden="true">
        <canvas ref={canvasRef} tabIndex={-1} />
        <span ref={loadingLabelRef} className="scroll-frame-loading">LOADING SEQUENCE</span>
      </div>
    );
  }
);

export default ScrollFrameSequence;
