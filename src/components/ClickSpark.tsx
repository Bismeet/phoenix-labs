import { useCallback, useEffect, useRef } from "react";
import type { MouseEvent, ReactNode } from "react";
import "./ClickSpark.css";

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
}

interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: "linear" | "ease-in" | "ease-in-out" | "ease-out" | string;
  extraScale?: number;
  children?: ReactNode;
}

const ClickSpark = ({
  sparkColor = "#fff",
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = "ease-out",
  extraScale = 1,
  children,
}: ClickSparkProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const animationIdRef = useRef<number | null>(null);
  const isVisibleRef = useRef(true);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    let resizeTimeout: number | undefined;

    const resizeCanvas = () => {
      const { width, height } = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const nextWidth = Math.max(1, Math.round(width * dpr));
      const nextHeight = Math.max(1, Math.round(height * dpr));

      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }
    };

    const handleResize = () => {
      window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(resizeCanvas, 100);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(parent);

    resizeCanvas();

    return () => {
      resizeObserver.disconnect();
      window.clearTimeout(resizeTimeout);
    };
  }, []);

  const easeFunc = useCallback(
    (t: number) => {
      switch (easing) {
        case "linear":
          return t;
        case "ease-in":
          return t * t;
        case "ease-in-out":
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        default:
          return t * (2 - t);
      }
    },
    [easing]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = motionQuery.matches;

    const stopAnimation = () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    };

    const draw = (timestamp: number) => {
      if (reducedMotionRef.current || !isVisibleRef.current || sparksRef.current.length === 0) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animationIdRef.current = null;
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) {
          return false;
        }

        const progress = elapsed / duration;
        const eased = easeFunc(progress);
        const distance = eased * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - eased);

        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        return true;
      });

      animationIdRef.current = sparksRef.current.length > 0 ? requestAnimationFrame(draw) : null;
    };

    const startAnimation = () => {
      if (animationIdRef.current || reducedMotionRef.current || !isVisibleRef.current) return;
      animationIdRef.current = requestAnimationFrame(draw);
    };

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (!isVisibleRef.current) {
          stopAnimation();
        } else if (sparksRef.current.length > 0) {
          startAnimation();
        }
      },
      { threshold: 0.01 }
    );
    visibilityObserver.observe(canvas);

    const handleMotionChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
      if (event.matches) {
        sparksRef.current = [];
        stopAnimation();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    motionQuery.addEventListener("change", handleMotionChange);

    (canvas as HTMLCanvasElement & { startClickSparkAnimation?: () => void }).startClickSparkAnimation = startAnimation;

    return () => {
      stopAnimation();
      visibilityObserver.disconnect();
      motionQuery.removeEventListener("change", handleMotionChange);
      delete (canvas as HTMLCanvasElement & { startClickSparkAnimation?: () => void }).startClickSparkAnimation;
    };
  }, [duration, easeFunc, extraScale, sparkColor, sparkRadius, sparkSize]);

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (reducedMotionRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const now = performance.now();

    const newSparks = Array.from({ length: sparkCount }, (_, i) => ({
      x,
      y,
      angle: (2 * Math.PI * i) / sparkCount,
      startTime: now,
    }));

    sparksRef.current.push(...newSparks);
    (canvas as HTMLCanvasElement & { startClickSparkAnimation?: () => void }).startClickSparkAnimation?.();
  };

  return (
    <div className="click-spark" onClick={handleClick}>
      <canvas ref={canvasRef} className="click-spark__canvas" />
      <div className="click-spark__content">{children}</div>
    </div>
  );
};

export default ClickSpark;
