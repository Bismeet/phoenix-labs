import React, { useEffect, useRef, useCallback } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { getPerformanceTier } from '../utils/performanceProfile';
import './ElectricBorder.css';

function hexToRgba(hex: string, alpha: number = 1): string {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h
      .split('')
      .map(c => c + c)
      .join('');
  }
  const int = parseInt(h, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface ElectricBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  color?: string;
  speed?: number;
  chaos?: number;
  borderRadius?: number;
}

const ElectricBorder: React.FC<ElectricBorderProps> = ({
  children,
  color = '#FF6B35',
  speed = 0.3,
  chaos = 0.08,
  borderRadius = 16,
  className,
  style,
  ...rest
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const lastPaintTimeRef = useRef(0);

  const random = useCallback((x: number): number => {
    return (Math.sin(x * 12.9898) * 43758.5453) % 1;
  }, []);

  const noise2D = useCallback(
    (x: number, y: number): number => {
      const i = Math.floor(x);
      const j = Math.floor(y);
      const fx = x - i;
      const fy = y - j;

      const a = random(i + j * 57);
      const b = random(i + 1 + j * 57);
      const c = random(i + (j + 1) * 57);
      const d = random(i + 1 + (j + 1) * 57);

      const ux = fx * fx * (3.0 - 2.0 * fx);
      const uy = fy * fy * (3.0 - 2.0 * fy);

      return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
    },
    [random]
  );

  const octavedNoise = useCallback(
    (
      x: number,
      octaves: number,
      lacunarity: number,
      gain: number,
      baseFlatness: number
    ): number => {
      let y = 0;
      let amplitude = chaos;
      let frequency = 10;
      const seed = 0;

      for (let i = 0; i < octaves; i++) {
        let octaveAmplitude = amplitude;
        if (i === 0) {
          octaveAmplitude *= baseFlatness;
        }
        y += octaveAmplitude * noise2D(frequency * x + seed * 100, timeRef.current * frequency * 0.3);
        frequency *= lacunarity;
        amplitude *= gain;
      }

      return y;
    },
    [noise2D, chaos]
  );

  const getCornerPoint = useCallback(
    (
      centerX: number,
      centerY: number,
      radius: number,
      startAngle: number,
      arcLength: number,
      progress: number
    ): { x: number; y: number } => {
      const angle = startAngle + progress * arcLength;
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    },
    []
  );

  const getRoundedRectPoint = useCallback(
    (t: number, left: number, top: number, width: number, height: number, radius: number): { x: number; y: number } => {
      const straightWidth = width - 2 * radius;
      const straightHeight = height - 2 * radius;
      const cornerArc = (Math.PI * radius) / 2;
      const totalPerimeter = 2 * straightWidth + 2 * straightHeight + 4 * cornerArc;
      const distance = t * totalPerimeter;

      let accumulated = 0;

      if (distance <= accumulated + straightWidth) {
        const progress = (distance - accumulated) / straightWidth;
        return { x: left + radius + progress * straightWidth, y: top };
      }
      accumulated += straightWidth;

      if (distance <= accumulated + cornerArc) {
        const progress = (distance - accumulated) / cornerArc;
        return getCornerPoint(left + width - radius, top + radius, radius, -Math.PI / 2, Math.PI / 2, progress);
      }
      accumulated += cornerArc;

      if (distance <= accumulated + straightHeight) {
        const progress = (distance - accumulated) / straightHeight;
        return { x: left + width, y: top + radius + progress * straightHeight };
      }
      accumulated += straightHeight;

      if (distance <= accumulated + cornerArc) {
        const progress = (distance - accumulated) / cornerArc;
        return getCornerPoint(left + width - radius, top + height - radius, radius, 0, Math.PI / 2, progress);
      }
      accumulated += cornerArc;

      if (distance <= accumulated + straightWidth) {
        const progress = (distance - accumulated) / straightWidth;
        return { x: left + width - radius - progress * straightWidth, y: top + height };
      }
      accumulated += straightWidth;

      if (distance <= accumulated + cornerArc) {
        const progress = (distance - accumulated) / cornerArc;
        return getCornerPoint(left + radius, top + height - radius, radius, Math.PI / 2, Math.PI / 2, progress);
      }
      accumulated += cornerArc;

      if (distance <= accumulated + straightHeight) {
        const progress = (distance - accumulated) / straightHeight;
        return { x: left, y: top + height - radius - progress * straightHeight };
      }
      accumulated += straightHeight;

      const progress = (distance - accumulated) / cornerArc;
      return getCornerPoint(left + radius, top + radius, radius, Math.PI, Math.PI / 2, progress);
    },
    [getCornerPoint]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const desktopOctaves = 4;
    const lacunarity = 1.6;
    const gain = 0.7;
    const baseFlatness = 0;

    let isVisible = false;
    let isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowPowerDevice = getPerformanceTier() === 'low';
    let borderOffset = window.innerWidth < 768 ? 32 : 52;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const getDpr = () => Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.15 : 1.5);

    const stopAnimation = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };

    const updateSize = () => {
      borderOffset = window.innerWidth < 768 ? 32 : 52;
      container.style.setProperty('--electric-border-offset', `${borderOffset}px`);

      const w = container.clientWidth;
      const h = container.clientHeight;
      const width = w + borderOffset * 2;
      const height = h + borderOffset * 2;

      if (!isVisible || lowPowerDevice || window.innerWidth < 768) {
        canvas.width = 1;
        canvas.height = 1;
        return { width, height };
      }

      const dpr = getDpr();
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));

      return { width, height };
    };

    let { width, height } = updateSize();
    let lastDpr = getDpr();

    const drawElectricBorder = (currentTime: number) => {
      if (!canvas || !ctx) return;
      if (!isVisible || isReducedMotion || lowPowerDevice || window.innerWidth < 768) {
        animationRef.current = null;
        return;
      }

      const isMobileView = window.innerWidth < 768;
      const frameInterval = 42;
      if (currentTime - lastPaintTimeRef.current < frameInterval) {
        animationRef.current = requestAnimationFrame(drawElectricBorder);
        return;
      }
      lastPaintTimeRef.current = currentTime;

      const dpr = getDpr();
      if (dpr !== lastDpr) {
        lastDpr = dpr;
        const newSize = updateSize();
        width = newSize.width;
        height = newSize.height;
      }

      const deltaTime = Math.min((currentTime - lastFrameTimeRef.current) / 1000, 0.05);
      timeRef.current += deltaTime * speed;
      lastFrameTimeRef.current = currentTime;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = color;
      ctx.lineWidth = isMobileView ? 1 : 1.25;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const scale = isMobileView ? 30 : 42;
      const octaves = desktopOctaves;
      const left = borderOffset;
      const top = borderOffset;
      const borderWidth = width - 2 * borderOffset;
      const borderHeight = height - 2 * borderOffset;
      const maxRadius = Math.min(borderWidth, borderHeight) / 2;
      const radius = Math.min(borderRadius, maxRadius);

      const approximatePerimeter = 2 * (borderWidth + borderHeight) + 2 * Math.PI * radius;
      const sampleCount = Math.max(32, Math.min(150, Math.floor(approximatePerimeter / 6)));

      ctx.beginPath();

      for (let i = 0; i <= sampleCount; i++) {
        const progress = i / sampleCount;

        const point = getRoundedRectPoint(progress, left, top, borderWidth, borderHeight, radius);

        const xNoise = octavedNoise(
          progress * 8,
          octaves,
          lacunarity,
          gain,
          baseFlatness
        );
        const yNoise = octavedNoise(
          progress * 8 + 100,
          octaves,
          lacunarity,
          gain,
          baseFlatness
        );

        const displacedX = point.x + xNoise * scale;
        const displacedY = point.y + yNoise * scale;

        if (i === 0) {
          ctx.moveTo(displacedX, displacedY);
        } else {
          ctx.lineTo(displacedX, displacedY);
        }
      }

      ctx.closePath();
      ctx.stroke();

      animationRef.current = requestAnimationFrame(drawElectricBorder);
    };

    const startAnimation = () => {
      if (animationRef.current || isReducedMotion || lowPowerDevice || window.innerWidth < 768 || !isVisible) return;
      lastFrameTimeRef.current = performance.now();
      lastPaintTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(drawElectricBorder);
    };

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        if (isVisible && !wasVisible) {
          const newSize = updateSize();
          width = newSize.width;
          height = newSize.height;
          startAnimation();
        } else if (!isVisible) {
          stopAnimation();
          canvas.width = 1;
          canvas.height = 1;
        }
      },
      { rootMargin: '120px 0px', threshold: 0.01 }
    );
    visibilityObserver.observe(container);

    const resizeObserver = new ResizeObserver(() => {
      const newSize = updateSize();
      width = newSize.width;
      height = newSize.height;
    });
    resizeObserver.observe(container);

    const handleMotionChange = (event: MediaQueryListEvent) => {
      isReducedMotion = event.matches;
      if (isReducedMotion) {
        stopAnimation();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else {
        startAnimation();
      }
    };
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      stopAnimation();
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, [color, speed, chaos, borderRadius, octavedNoise, getRoundedRectPoint]);

  return (
    <div
      ref={containerRef}
      className={`electric-border relative overflow-visible isolate ${className ?? ''}`}
      style={{ '--electric-border-color': color, '--electric-border-offset': '52px', borderRadius, ...style } as CSSProperties}
      {...rest}
    >
      <div className="eb-canvas-container">
        <canvas ref={canvasRef} className="block" />
      </div>
      <div className="absolute inset-0 rounded-[inherit] pointer-events-none z-0">
        <div
          className="eb-glow-1 absolute inset-0 rounded-[inherit] pointer-events-none"
          style={{ border: `2px solid ${hexToRgba(color, 0.32)}`, filter: 'blur(1px)' }}
        />
        <div
          className="eb-glow-2 absolute inset-0 rounded-[inherit] pointer-events-none"
          style={{ border: `2px solid ${color}`, filter: 'blur(2px)' }}
        />
        <div
          className="eb-background-glow absolute inset-0 rounded-[inherit] pointer-events-none -z-[1]"
          style={{
            filter: 'blur(18px)',
            background: `linear-gradient(-30deg, ${color}, transparent, ${color})`
          }}
        />
      </div>
      <div className="relative rounded-[inherit] z-[1] w-full h-full">{children}</div>
    </div>
  );
};

export default ElectricBorder;
