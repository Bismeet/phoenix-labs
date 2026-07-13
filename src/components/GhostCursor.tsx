import { useEffect, useMemo, useRef } from "react";
import "./GhostCursor.css";

interface GhostCursorProps {
  className?: string;
  style?: React.CSSProperties;
  trailLength?: number;
  inertia?: number;
  grainIntensity?: number;
  bloomStrength?: number;
  bloomRadius?: number;
  bloomThreshold?: number;
  brightness?: number;
  color?: string;
  mixBlendMode?: string;
  edgeIntensity?: number;
  maxDevicePixelRatio?: number;
  targetPixels?: number;
  fadeDelayMs?: number;
  fadeDurationMs?: number;
  zIndex?: number;
}

interface TrailPoint {
  x: number;
  y: number;
}

const parseHex = (hex: string) => {
  const value = hex.replace("#", "");
  const normalized = value.length === 3 ? value.split("").map((part) => part + part).join("") : value;
  const number = Number.parseInt(normalized, 16);
  return Number.isFinite(number)
    ? { r: (number >> 16) & 255, g: (number >> 8) & 255, b: number & 255 }
    : { r: 249, g: 115, b: 22 };
};

/**
 * Lightweight, event-driven cursor glow. The former version rendered a
 * full-screen multi-pass WebGL shader on every active frame; this keeps the
 * same warm smoky accent with a single 2D canvas and sleeps when faded out.
 */
const GhostCursor = ({
  className,
  style,
  trailLength = 18,
  inertia = 0.5,
  brightness = 1,
  color = "#F97316",
  mixBlendMode = "screen",
  maxDevicePixelRatio = 1.15,
  fadeDelayMs = 260,
  fadeDurationMs = 620,
  zIndex = 10,
}: GhostCursorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mergedStyle = useMemo(() => ({ zIndex, ...style }), [zIndex, style]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) return;

    const rgb = parseHex(color);
    const maxPoints = Math.max(6, Math.min(18, Math.round(trailLength / 2)));
    const follow = Math.min(0.5, Math.max(0.18, 0.56 - inertia * 0.38));
    const points: TrailPoint[] = [];
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let lastMove = 0;
    let animationFrame = 0;
    let running = false;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, maxDevicePixelRatio, window.innerWidth < 820 ? 1 : 1.2);
      const width = Math.max(1, Math.round(window.innerWidth * dpr));
      const height = Math.max(1, Math.round(window.innerHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    const clear = () => {
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
    };

    const paint = (timestamp: number) => {
      const idleFor = timestamp - lastMove;
      const fade = idleFor <= fadeDelayMs ? 1 : Math.max(0, 1 - (idleFor - fadeDelayMs) / fadeDurationMs);

      currentX += (targetX - currentX) * follow;
      currentY += (targetY - currentY) * follow;
      points.unshift({ x: currentX, y: currentY });
      if (points.length > maxPoints) points.length = maxPoints;

      clear();
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.globalCompositeOperation = "screen";

      for (let index = points.length - 1; index >= 0; index -= 1) {
        const point = points[index];
        const life = 1 - index / Math.max(1, points.length);
        const radius = 22 + life * 34;
        const alpha = fade * life * life * Math.min(1.25, brightness) * 0.22;
        const gradient = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
        gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`);
        gradient.addColorStop(0.28, `rgba(255, 156, 71, ${alpha * 0.48})`);
        gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context.fill();
      }

      if (fade > 0.001 || Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > 0.5) {
        animationFrame = requestAnimationFrame(paint);
      } else {
        running = false;
        animationFrame = 0;
        points.length = 0;
        clear();
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      animationFrame = requestAnimationFrame(paint);
    };

    const onPointerMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!points.length) {
        currentX = targetX;
        currentY = targetY;
      }
      lastMove = performance.now();
      start();
    };

    const onVisibilityChange = () => {
      if (!document.hidden) return;
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      running = false;
      points.length = 0;
      clear();
    };

    resize();
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clear();
    };
  }, [brightness, color, fadeDelayMs, fadeDurationMs, inertia, maxDevicePixelRatio, trailLength]);

  return (
    <div className={`ghost-cursor ${className ?? ""}`} style={mergedStyle} aria-hidden="true">
      <canvas ref={canvasRef} style={{ mixBlendMode: mixBlendMode as React.CSSProperties["mixBlendMode"] }} />
    </div>
  );
};

export default GhostCursor;
