import { useEffect, useRef, type CSSProperties } from "react";
import { getPerformanceTier } from "../utils/performanceProfile";
import "./TechStackSolarSystem.css";

type OrbitId = "inner" | "middle" | "outer";

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  phase: number;
  shimmer: number;
  driftX: number;
  driftY: number;
  depth: number;
  warmth: number;
}

interface OrbitConfig {
  id: OrbitId;
  label: string;
  duration: number;
  offset: number;
  planeAngle: number;
  direction: 1 | -1;
  items: string[];
}

type OrbitObjectStyle = CSSProperties & {
  "--object-order": number;
};

const ORBITS: OrbitConfig[] = [
  {
    id: "inner",
    label: "Core frameworks",
    duration: 31,
    offset: -18,
    planeAngle: -8,
    direction: 1,
    items: ["React", "Next.js", "TypeScript"],
  },
  {
    id: "middle",
    label: "Application systems",
    duration: 47,
    offset: 24,
    planeAngle: 6,
    direction: -1,
    items: ["Vite", "Tailwind", "Node.js", "PostgreSQL"],
  },
  {
    id: "outer",
    label: "Platform technologies",
    duration: 71,
    offset: -6,
    planeAngle: -4,
    direction: 1,
    items: ["Express", "Supabase", "Firebase", "MongoDB", "Vercel", "AI APIs", "Framer Motion"],
  },
];

const ORBIT_LOOKUP = Object.fromEntries(ORBITS.map((orbit) => [orbit.id, orbit])) as Record<OrbitId, OrbitConfig>;

function getTechSlug(name: string) {
  return name.toLowerCase().replace(/\./g, "").replace(/\s+/g, "-");
}

function TechIcon({ name }: { name: string }) {
  const commonProps = {
    viewBox: "0 0 48 48",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
    focusable: "false" as const,
  };

  switch (name) {
    case "React":
      return (
        <svg {...commonProps}>
          <circle cx="24" cy="24" r="3.4" fill="currentColor" />
          <ellipse cx="24" cy="24" rx="18" ry="7.3" stroke="currentColor" strokeWidth="2.2" />
          <ellipse cx="24" cy="24" rx="18" ry="7.3" stroke="currentColor" strokeWidth="2.2" transform="rotate(60 24 24)" />
          <ellipse cx="24" cy="24" rx="18" ry="7.3" stroke="currentColor" strokeWidth="2.2" transform="rotate(120 24 24)" />
        </svg>
      );
    case "Next.js":
      return (
        <svg {...commonProps}>
          <path d="M11 34V14l21 21V14" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M30 14h7M33.5 10.5V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "TypeScript":
      return (
        <svg {...commonProps}>
          <rect x="8" y="8" width="32" height="32" rx="7" stroke="currentColor" strokeWidth="2.3" />
          <path d="M14 19h14M21 19v17M29 34c2.3 1.7 6.7 1.6 6.7-1.7 0-4-7-2.6-7-7 0-3.2 4.5-4.3 7.2-2.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "Vite":
      return (
        <svg {...commonProps}>
          <path d="M8 11l15 29L40 10 25 14 8 11Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="m27 6-10 19h8l-4 15 14-23h-9l1-11Z" fill="currentColor" />
        </svg>
      );
    case "Tailwind":
      return (
        <svg {...commonProps}>
          <path d="M7 22c4.5-7 10.2-9.3 17-7 3.4 1.1 5.8 4.4 9 4.3 3.1-.1 5.7-1.8 8-5.3-4.5 12-12.3 14-20 7.7C16.5 18 11.8 18.1 7 22Z" fill="currentColor" />
          <path d="M7 34c4.5-7 10.2-9.3 17-7 3.4 1.1 5.8 4.4 9 4.3 3.1-.1 5.7-1.8 8-5.3-4.5 12-12.3 14-20 7.7C16.5 30 11.8 30.1 7 34Z" fill="currentColor" opacity=".72" />
        </svg>
      );
    case "Node.js":
      return (
        <svg {...commonProps}>
          <path d="m24 5 17 9.5v19L24 43 7 33.5v-19L24 5Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M16 32V17l16 15V17" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "PostgreSQL":
      return (
        <svg {...commonProps}>
          <ellipse cx="24" cy="13" rx="14" ry="6" stroke="currentColor" strokeWidth="2.4" />
          <path d="M10 13v21c0 3.3 6.3 6 14 6s14-2.7 14-6V13M10 24c0 3.3 6.3 6 14 6s14-2.7 14-6" stroke="currentColor" strokeWidth="2.4" />
          <path d="M28 13c0 5-2 7-5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "Express":
      return (
        <svg {...commonProps}>
          <path d="M8 13h32M8 24h20M8 35h32" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path d="m29 18 11 12M40 18 29 30" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      );
    case "Supabase":
      return (
        <svg {...commonProps}>
          <path d="M26 5 9 28h15l-2 15 17-25H25l1-13Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="m26 5-2 23h15L26 5Z" fill="currentColor" opacity=".45" />
        </svg>
      );
    case "Firebase":
      return (
        <svg {...commonProps}>
          <path d="m9 37 5-31 10 9 5-7 10 29-15 7L9 37Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="m14 6 10 38 15-7M24 15l-15 22" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" opacity=".72" />
        </svg>
      );
    case "MongoDB":
      return (
        <svg {...commonProps}>
          <path d="M25 4c8 8.5 11.5 17 5.5 26.5-2 3-4.2 5.3-6.2 7.4C16 32.7 12.2 23.2 17.8 14 20 10.4 22.7 7.2 25 4Z" fill="currentColor" />
          <path d="M24.5 15v28" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case "Vercel":
      return (
        <svg {...commonProps}>
          <path d="m24 8 18 31H6L24 8Z" fill="currentColor" />
          <path d="m24 15 11 20H13l11-20Z" stroke="rgba(0,0,0,.28)" strokeWidth="1.5" />
        </svg>
      );
    case "AI APIs":
      return (
        <svg {...commonProps}>
          <path d="m13 16 11-7 11 7v16l-11 7-11-7V16Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="m13 16 11 8 11-8M24 24v15" stroke="currentColor" strokeWidth="2" />
          <circle cx="13" cy="16" r="3" fill="currentColor" /><circle cx="35" cy="16" r="3" fill="currentColor" /><circle cx="24" cy="39" r="3" fill="currentColor" /><circle cx="24" cy="24" r="3.4" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg {...commonProps}>
          <path d="M9 9h14v13H9V9Zm16 17h14v13H25V26ZM23 9h16L25 26V9h-2Z" fill="currentColor" />
          <path d="M9 22h16L9 39V22Z" fill="currentColor" opacity=".7" />
        </svg>
      );
  }
}

function TechStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !host || !context) return;

    const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const qualityTier = getPerformanceTier();
    const staticQuality = qualityTier === "low";
    let width = 1;
    let height = 1;
    let stars: Star[] = [];
    let frame = 0;
    let visible = false;
    let reducedMotion = reducedMotionMedia.matches;
    let lastDraw = 0;
    let previousDraw = 0;

    const createStars = () => {
      const count = qualityTier === "low" ? 44 : qualityTier === "balanced" ? 82 : 126;
      stars = Array.from({ length: count }, (_, index) => {
        const depth = 0.12 + Math.random() * 0.88;
        const bright = index % 23 === 0;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: bright ? 1.05 + depth * 0.7 : 0.25 + depth * 0.75,
          opacity: bright ? 0.54 + depth * 0.3 : 0.12 + depth * 0.42,
          phase: Math.random() * Math.PI * 2,
          shimmer: 0.00018 + Math.random() * 0.00024,
          driftX: (Math.random() - 0.48) * 0.008 * depth,
          driftY: (Math.random() - 0.54) * 0.005 * depth,
          depth,
          warmth: Math.random(),
        };
      });
    };

    const resize = () => {
      const bounds = host.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      const dprCap = qualityTier === "low" ? 1 : qualityTier === "balanced" ? 1.15 : 1.3;
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      createStars();
    };

    const draw = (time: number) => {
      const delta = previousDraw ? Math.min(50, time - previousDraw) : 16;
      previousDraw = time;
      context.clearRect(0, 0, width, height);

      for (const star of stars) {
        if (!reducedMotion && !staticQuality) {
          star.x += star.driftX * delta;
          star.y += star.driftY * delta;
          if (star.x < -3) star.x = width + 3;
          if (star.x > width + 3) star.x = -3;
          if (star.y < -3) star.y = height + 3;
          if (star.y > height + 3) star.y = -3;
        }

        const shimmer = reducedMotion || staticQuality ? 0.88 : 0.82 + Math.sin(time * star.shimmer + star.phase) * 0.18;
        const alpha = star.opacity * shimmer;
        const green = Math.round(211 + star.warmth * 34);
        const blue = Math.round(160 + star.warmth * 66);

        context.beginPath();
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(255, ${green}, ${blue}, ${alpha})`;
        context.fill();

        if (star.radius > 1.35 && qualityTier === "high") {
          context.strokeStyle = `rgba(255, 192, 122, ${alpha * 0.26})`;
          context.lineWidth = 0.5;
          context.beginPath();
          context.moveTo(star.x - 3.5, star.y);
          context.lineTo(star.x + 3.5, star.y);
          context.moveTo(star.x, star.y - 3.5);
          context.lineTo(star.x, star.y + 3.5);
          context.stroke();
        }
      }
    };

    const tick = (time: number) => {
      frame = 0;
      const frameInterval = qualityTier === "high" ? 40 : 50;
      if (time - lastDraw >= frameInterval) {
        lastDraw = time;
        draw(time);
      }
      if (visible && !reducedMotion && !staticQuality) frame = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previousDraw = 0;
      draw(performance.now());
      if (visible && !reducedMotion && !staticQuality) frame = requestAnimationFrame(tick);
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      start();
    });
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    }, { rootMargin: "12% 0px" });
    const handleMotionPreference = () => {
      reducedMotion = reducedMotionMedia.matches;
      start();
    };

    resizeObserver.observe(host);
    visibilityObserver.observe(host);
    reducedMotionMedia.addEventListener("change", handleMotionPreference);
    resize();
    draw(performance.now());

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      reducedMotionMedia.removeEventListener("change", handleMotionPreference);
    };
  }, []);

  return <canvas ref={canvasRef} className="tech-solar-stars" aria-hidden="true" />;
}

export default function TechStackSolarSystem() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const systemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const system = systemRef.current;
    if (!section || !stage || !system) return;

    const objects = Array.from(system.querySelectorAll<HTMLElement>(".tech-solar-object"));
    const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const precisePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const qualityTier = getPerformanceTier();
    let visible = false;
    let reducedMotion = reducedMotionMedia.matches;
    let animationFrame = 0;
    let pointerFrame = 0;
    let lastPaint = 0;
    let lastStageWidth = -1;
    let sectionBounds: DOMRect | null = null;
    const labelCloseTimers = new Map<HTMLElement, number>();
    const startedAt = performance.now();

    const clearLabelTimer = (object: HTMLElement) => {
      const timer = labelCloseTimers.get(object);
      if (timer) window.clearTimeout(timer);
      labelCloseTimers.delete(object);
    };

    const openObjectLabel = (object: HTMLElement) => {
      clearLabelTimer(object);
      objects.forEach((candidate) => {
        if (candidate !== object) candidate.removeAttribute("data-label-open");
      });
      object.dataset.labelOpen = "true";
    };

    const scheduleLabelClose = (object: HTMLElement, delay = 850) => {
      clearLabelTimer(object);
      const timer = window.setTimeout(() => {
        labelCloseTimers.delete(object);
        if (document.activeElement !== object && !object.matches(":hover")) {
          object.removeAttribute("data-label-open");
        }
      }, delay);
      labelCloseTimers.set(object, timer);
    };

    const handleObjectPointerEnter = (event: PointerEvent) => {
      openObjectLabel(event.currentTarget as HTMLElement);
    };

    const handleObjectPointerDown = (event: PointerEvent) => {
      const object = event.currentTarget as HTMLElement;
      object.focus({ preventScroll: true });
      openObjectLabel(object);
    };

    const handleObjectClick = (event: MouseEvent) => {
      const object = event.currentTarget as HTMLElement;
      object.focus({ preventScroll: true });
      openObjectLabel(object);
    };

    const handleObjectPointerLeave = (event: PointerEvent) => {
      scheduleLabelClose(event.currentTarget as HTMLElement);
    };

    const handleObjectFocus = (event: FocusEvent) => {
      openObjectLabel(event.currentTarget as HTMLElement);
    };

    const handleObjectBlur = (event: FocusEvent) => {
      scheduleLabelClose(event.currentTarget as HTMLElement, 180);
    };

    objects.forEach((object) => {
      object.addEventListener("pointerenter", handleObjectPointerEnter);
      object.addEventListener("pointerdown", handleObjectPointerDown);
      object.addEventListener("click", handleObjectClick);
      object.addEventListener("pointerleave", handleObjectPointerLeave);
      object.addEventListener("focus", handleObjectFocus);
      object.addEventListener("blur", handleObjectBlur);
    });

    const updateScene = (time: number, forceStatic = false) => {
      const width = stage.clientWidth;
      const mobile = width < 640;
      const tablet = width < 920;
      const staticScene = forceStatic || reducedMotion;
      const elapsed = staticScene ? 0 : Math.max(0, (time - startedAt) / 1000);

      const radii: Record<OrbitId, { x: number; y: number; depth: number }> = mobile
        ? {
            inner: { x: Math.min(112, width * 0.31), y: Math.min(82, width * 0.23), depth: 30 },
            middle: { x: Math.min(146, width * 0.4), y: Math.min(106, width * 0.29), depth: 44 },
            outer: { x: 0, y: 0, depth: 0 },
          }
        : tablet
          ? {
              inner: { x: Math.min(198, width * 0.28), y: Math.min(122, width * 0.18), depth: 62 },
              middle: { x: Math.min(302, width * 0.4), y: Math.min(178, width * 0.235), depth: 88 },
              outer: { x: Math.min(390, width * 0.46), y: Math.min(232, width * 0.29), depth: 112 },
            }
          : {
              inner: { x: Math.min(270, width * 0.19), y: Math.min(154, width * 0.11), depth: 78 },
              middle: { x: Math.min(450, width * 0.315), y: Math.min(242, width * 0.17), depth: 114 },
              outer: { x: Math.min(700, width * 0.455), y: Math.min(342, width * 0.225), depth: 148 },
            };

      if (Math.abs(width - lastStageWidth) > 0.5) {
        lastStageWidth = width;
        (Object.keys(radii) as OrbitId[]).forEach((id) => {
          section.style.setProperty(`--orbit-${id}-width`, `${radii[id].x * 2}px`);
          section.style.setProperty(`--orbit-${id}-height`, `${radii[id].y * 2}px`);
        });
      }

      objects.forEach((object) => {
        const orbitId = object.dataset.orbit as OrbitId;
        const orbit = ORBIT_LOOKUP[orbitId];
        const itemIndex = Number(object.dataset.index || 0);
        if (mobile && orbitId === "outer") {
          if (object.style.display !== "none") object.style.display = "none";
          return;
        }
        if (object.style.display) object.style.removeProperty("display");

        const baseAngle = orbit.offset + (360 / orbit.items.length) * itemIndex;
        const motionAngle = orbit.direction * (elapsed / orbit.duration) * Math.PI * 2;
        const angle = baseAngle * Math.PI / 180 + motionAngle;
        const planeAngle = orbit.planeAngle * Math.PI / 180;
        const radius = radii[orbitId];
        const rawX = Math.cos(angle) * radius.x;
        const rawY = Math.sin(angle) * radius.y;
        const x = rawX * Math.cos(planeAngle) - rawY * Math.sin(planeAngle);
        const y = rawX * Math.sin(planeAngle) + rawY * Math.cos(planeAngle);
        const depth = (Math.sin(angle) + 1) / 2;
        const scale = mobile ? 0.88 + depth * 0.12 : 0.78 + depth * 0.28;
        const opacity = mobile ? 0.82 + depth * 0.18 : 0.57 + depth * 0.43;

        object.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
        object.style.opacity = opacity.toFixed(3);
        const labelSide = y > radius.y * 0.16 ? "above" : "below";
        if (object.dataset.labelSide !== labelSide) object.dataset.labelSide = labelSide;
        const depthBand = depth >= 0.52 ? "front" : "back";
        if (object.dataset.depth !== depthBand) {
          object.dataset.depth = depthBand;
          object.style.zIndex = depthBand === "front" ? "18" : "6";
        }
      });
    };

    const tick = (time: number) => {
      animationFrame = 0;
      const frameInterval = qualityTier === "high" ? 22 : qualityTier === "balanced" ? 33 : 50;
      if (time - lastPaint >= frameInterval) {
        lastPaint = time;
        updateScene(time);
      }
      if (visible && !reducedMotion && !document.hidden) {
        animationFrame = requestAnimationFrame(tick);
      }
    };

    const start = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      updateScene(performance.now(), reducedMotion);
      if (visible && !reducedMotion && !document.hidden) {
        animationFrame = requestAnimationFrame(tick);
      }
    };

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      section.classList.toggle("is-solar-active", visible);
      start();
    }, { rootMargin: "12% 0px" });

    const resizeObserver = new ResizeObserver(() => {
      sectionBounds = null;
      updateScene(performance.now(), reducedMotion);
    });

    const handlePointerMove = (event: PointerEvent) => {
      if (!precisePointer || reducedMotion) return;
      const clientX = event.clientX;
      const clientY = event.clientY;
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        sectionBounds ??= section.getBoundingClientRect();
        const x = (clientX - sectionBounds.left) / sectionBounds.width - 0.5;
        const y = (clientY - sectionBounds.top) / sectionBounds.height - 0.5;
        section.style.setProperty("--solar-parallax-x", `${x * 12}px`);
        section.style.setProperty("--solar-parallax-y", `${y * 8}px`);
        section.style.setProperty("--star-parallax-x", `${x * -5}px`);
        section.style.setProperty("--star-parallax-y", `${y * -3}px`);
        section.style.setProperty("--solar-tilt-x", `${-y * 2.2}deg`);
        section.style.setProperty("--solar-tilt-y", `${x * 2.8}deg`);
      });
    };

    const resetParallax = () => {
      sectionBounds = null;
      section.style.setProperty("--solar-parallax-x", "0px");
      section.style.setProperty("--solar-parallax-y", "0px");
      section.style.setProperty("--star-parallax-x", "0px");
      section.style.setProperty("--star-parallax-y", "0px");
      section.style.setProperty("--solar-tilt-x", "0deg");
      section.style.setProperty("--solar-tilt-y", "0deg");
    };

    const handleMotionPreference = () => {
      reducedMotion = reducedMotionMedia.matches;
      resetParallax();
      start();
    };

    const handleDocumentVisibility = () => {
      if (document.hidden) cancelAnimationFrame(animationFrame);
      else start();
    };

    visibilityObserver.observe(section);
    resizeObserver.observe(stage);
    section.addEventListener("pointermove", handlePointerMove, { passive: true });
    section.addEventListener("pointerleave", resetParallax);
    reducedMotionMedia.addEventListener("change", handleMotionPreference);
    document.addEventListener("visibilitychange", handleDocumentVisibility);
    const initialBounds = section.getBoundingClientRect();
    visible = initialBounds.bottom >= -window.innerHeight * 0.12 && initialBounds.top <= window.innerHeight * 1.12;
    section.classList.toggle("is-solar-active", visible);
    start();

    return () => {
      cancelAnimationFrame(animationFrame);
      cancelAnimationFrame(pointerFrame);
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      section.removeEventListener("pointermove", handlePointerMove);
      section.removeEventListener("pointerleave", resetParallax);
      reducedMotionMedia.removeEventListener("change", handleMotionPreference);
      document.removeEventListener("visibilitychange", handleDocumentVisibility);
      objects.forEach((object) => {
        clearLabelTimer(object);
        object.removeEventListener("pointerenter", handleObjectPointerEnter);
        object.removeEventListener("pointerdown", handleObjectPointerDown);
        object.removeEventListener("click", handleObjectClick);
        object.removeEventListener("pointerleave", handleObjectPointerLeave);
        object.removeEventListener("focus", handleObjectFocus);
        object.removeEventListener("blur", handleObjectBlur);
        object.removeAttribute("data-label-open");
      });
      section.classList.remove("is-solar-active");
    };
  }, []);

  const orbitalObjects = ORBITS.flatMap((orbit) =>
    orbit.items.map((item, index) => ({ item, index, orbit }))
  );

  return (
    <section ref={sectionRef} id="tech-stack" className="tech-solar-section" aria-labelledby="tech-solar-title">
      <TechStarfield />
      <div className="tech-solar-void" aria-hidden="true" />
      <div className="tech-solar-haze" aria-hidden="true" />
      <div className="tech-solar-dust tech-solar-dust--one" aria-hidden="true" />
      <div className="tech-solar-dust tech-solar-dust--two" aria-hidden="true" />

      <div className="tech-solar-content">
        <header className="tech-solar-header">
          <p className="tech-solar-eyebrow">03 / TECH STACK</p>
          <h2 id="tech-solar-title">STACKS WE BUILD WITH.</h2>
          <p className="tech-solar-copy">
            Modern tools, scalable systems, and production-ready frameworks powering every Phoenix Labs project.
          </p>
        </header>

        <div ref={stageRef} className="tech-solar-stage">
          <span className="tech-solar-caption tech-solar-caption--top" aria-hidden="true">A MATERIAL SYSTEM OF MODERN TOOLS</span>
          <span className="tech-solar-caption tech-solar-caption--side" aria-hidden="true">PHOENIX LABS / DIGITAL SYSTEMS</span>

          <div ref={systemRef} className="tech-solar-system">
            <div className="tech-solar-ring-field" aria-hidden="true">
              {ORBITS.map((orbit) => (
                <div key={orbit.id} className={`tech-solar-ring tech-solar-ring--${orbit.id}`}>
                  <i />
                </div>
              ))}
            </div>

            <ul className="tech-solar-object-field" aria-label="Technologies orbiting the Phoenix Labs core">
              {orbitalObjects.map(({ item, index, orbit }, order) => (
                <li
                  key={item}
                  className={`tech-solar-object tech-solar-object--${orbit.id}`}
                  data-orbit={orbit.id}
                  data-index={index}
                  data-tech={getTechSlug(item)}
                  tabIndex={0}
                  aria-label={item}
                  style={{ "--object-order": order } as OrbitObjectStyle}
                >
                  <div className="tech-solar-object-shell">
                    <span className="tech-solar-clay" aria-hidden="true">
                      <span className="tech-solar-clay-mark"><TechIcon name={item} /></span>
                    </span>
                    <span className="tech-solar-object-name" aria-hidden="true">{item}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="tech-solar-core-shell" aria-label="Phoenix Labs core">
              <div className="tech-solar-corona" aria-hidden="true"><i /><i /></div>
              <div className="tech-solar-core-aura" aria-hidden="true" />
              <div className="tech-solar-core">
                <span className="tech-solar-core-current" aria-hidden="true" />
                <span className="tech-solar-core-grain" aria-hidden="true" />
                <div className="tech-solar-core-surface">
                  <strong>PL</strong>
                  <span>PHOENIX CORE</span>
                </div>
              </div>
              <span className="tech-solar-core-shadow" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
