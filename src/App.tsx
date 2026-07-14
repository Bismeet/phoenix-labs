import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, Zap, Code, Users, ShieldCheck, Globe, Palette, Server, TrendingUp } from "lucide-react";
import "./App.css";
import WhatWeBuildSection from "./components/WhatWeBuildSection";
import TechStackOrbitSection from "./components/TechStackSolarSystem";
import ServicesProductLab from "./components/ServicesProductLab";
import FeaturedWorkReel from "./components/FeaturedWorkReel";
import WhyPhoenixEditorial from "./components/WhyPhoenixEditorial";
import ProcessFlightPath from "./components/ProcessFlightPath";
import StartProjectSection from "./components/StartProjectSection";
import Navbar from "./components/Navbar";

// Interface for founder data
interface Founder {
  name: string;
  role: string;
  shortRole: string;
  skills: string[];
  image: string;
  bg: string;
  bio: string;
  quote: string;
}

const FOUNDERS: Founder[] = [
  {
    name: "Bismeet",
    role: "Lead Architect & Developer",
    shortRole: "Lead Developer",
    skills: ["Next.js", "React", "UI Engineering"],
    image: "/founder_bismeet-processed.webp",
    bg: "#FF6B35", // Vibrant Orange
    bio: "Lead developer and main architect. Translates complex business needs into fast, highly optimized web applications.",
    quote: "We don't just write code; we design architectures that empower companies to scale without friction.",
  },
  {
    name: "Aditya",
    role: "Operations & Lead Management",
    shortRole: "Operations Lead",
    skills: ["Business Dev", "Client Strategy", "Product Mgmt"],
    image: "/founder_backend-processed.webp",
    bg: "#3B82F6", // Electric Blue
    bio: "Operations lead and client partner. Handles business development, client communications, and coordinates product strategy.",
    quote: "A great product is only as good as the execution behind it. We align strategy with relentless execution.",
  },
  {
    name: "Abhinav",
    role: "Co-Lead & Full Stack Engineer",
    shortRole: "Full Stack Dev",
    skills: ["Node.js", "APIs", "Cloud Scaling"],
    image: "/founder_abhinav-processed.webp",
    bg: "#8B5CF6", // Purple
    bio: "Co-lead Full Stack engineer assisting Bismeet. Builds robust API infrastructure, cloud architecture pipelines, and database schemas.",
    quote: "Every backend pipeline we build is designed for sub-100ms response times, securing near-zero downtime.",
  },
  {
    name: "Nikki",
    role: "UI/UX Designer & Frontend",
    shortRole: "UI/UX Designer",
    skills: ["Figma", "UI Design", "Tailwind CSS"],
    image: "/founder_fullstack-processed.webp",
    bg: "#10B981", // Green
    bio: "Visual Designer & Frontend developer. Bridges the gap between creative visual systems and pixel-perfect layouts.",
    quote: "Interface design is visual storytelling. We bridge aesthetics and utility to create memorable products.",
  },
];

export default function App() {
  const [activeIndex, setActiveIndex] = useState<number>(() => {
    const params = new URLSearchParams(window.location.search);
    const idx = parseInt(params.get("founder") || "0", 10);
    return isNaN(idx) ? 0 : idx % 4;
  });
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 640);
  const containerRef = useRef<HTMLDivElement>(null);
  const heroBoundsRef = useRef<DOMRect | null>(null);
  const heroPointerFrameRef = useRef(0);
  const pendingPointerRef = useRef({ x: 50, y: 50 });
  const pointerEffectEnabledRef = useRef(false);
  const touchStartRef = useRef<number | null>(null);
  const touchEndRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.targetTouches[0]?.clientX ?? null;
    touchEndRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = e.targetTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = () => {
    const touchStart = touchStartRef.current;
    const touchEnd = touchEndRef.current;
    touchStartRef.current = null;
    touchEndRef.current = null;
    if (touchStart === null || touchEnd === null) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      navigate("next");
    } else if (isRightSwipe) {
      navigate("prev");
    }
  };

  const handleTouchCancel = () => {
    touchStartRef.current = null;
    touchEndRef.current = null;
  };

  // Handle window resizing
  useEffect(() => {
    const hero = containerRef.current;
    const finePointerMedia = window.matchMedia("(hover: hover) and (pointer: fine)");
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      if (hero) heroBoundsRef.current = hero.getBoundingClientRect();
    };
    const handlePointerCapability = () => {
      pointerEffectEnabledRef.current = finePointerMedia.matches;
      if (!finePointerMedia.matches && hero) {
        cancelAnimationFrame(heroPointerFrameRef.current);
        heroPointerFrameRef.current = 0;
        hero.style.setProperty("--mouse-x", "50%");
        hero.style.setProperty("--mouse-y", "50%");
      }
    };

    handleResize();
    handlePointerCapability();
    window.addEventListener("resize", handleResize, { passive: true });
    finePointerMedia.addEventListener("change", handlePointerCapability);

    return () => {
      window.removeEventListener("resize", handleResize);
      finePointerMedia.removeEventListener("change", handlePointerCapability);
      cancelAnimationFrame(heroPointerFrameRef.current);
    };
  }, []);

  const handleHeroPointerEnter = () => {
    if (!pointerEffectEnabledRef.current || !containerRef.current) return;
    heroBoundsRef.current = containerRef.current.getBoundingClientRect();
  };

  const handleHeroPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const hero = containerRef.current;
    const bounds = heroBoundsRef.current;
    if (!hero || !bounds || !pointerEffectEnabledRef.current || e.pointerType !== "mouse") return;

    pendingPointerRef.current = {
      x: Math.max(0, Math.min(100, ((e.clientX - bounds.left) / bounds.width) * 100)),
      y: Math.max(0, Math.min(100, ((e.clientY - bounds.top) / bounds.height) * 100)),
    };

    if (heroPointerFrameRef.current) return;
    heroPointerFrameRef.current = requestAnimationFrame(() => {
      heroPointerFrameRef.current = 0;
      const { x, y } = pendingPointerRef.current;
      hero.style.setProperty("--mouse-x", `${x}%`);
      hero.style.setProperty("--mouse-y", `${y}%`);
    });
  };

  // Navigates active slide
  const navigate = (direction: "next" | "prev") => {
    if (isAnimating) return;

    setIsAnimating(true);
    if (direction === "next") {
      setActiveIndex((prev) => (prev + 1) % 4);
    } else {
      setActiveIndex((prev) => (prev + 3) % 4);
    }

    setTimeout(() => {
      setIsAnimating(false);
    }, 650); // Match animation duration
  };

  // Calculate carousel roles
  const getRole = (index: number) => {
    if (index === activeIndex) return "center";
    if (index === (activeIndex + 3) % 4) return "left";
    if (index === (activeIndex + 1) % 4) return "right";
    return "back";
  };

  // Helper for applying position styles dynamically based on role & screen size
  const getRoleStyles = (role: "center" | "left" | "right" | "back") => {
    // Responsive Viewport-based Heights (Desktop: 70vh, Tablet: 60vh, Mobile: 50vh)
    let baseHeight = "70vh";
    let baseBottom = "12vh"; // Center aligned on same baseline
    
    if (isMobile) {
      baseHeight = "50vh";
      baseBottom = "10vh";
    } else if (window.innerWidth < 1024) {
      baseHeight = "60vh";
      baseBottom = "11vh";
    }

    if (isMobile) {
      const mobileHeight = "42vh";
      const mobileBottom = "46vh";
      switch (role) {
        case "center":
          return {
            left: "50%",
            transform: "translateX(-50%)",
            height: mobileHeight,
            bottom: mobileBottom,
            opacity: 1,
            filter: "blur(0px)",
            zIndex: 20,
          };
        case "left":
          return {
            left: "5%",
            transform: "translateX(-50%)",
            height: mobileHeight,
            bottom: mobileBottom,
            opacity: 0.35,
            filter: "blur(2.5px)",
            zIndex: 10,
          };
        case "right":
          return {
            left: "95%",
            transform: "translateX(-50%)",
            height: mobileHeight,
            bottom: mobileBottom,
            opacity: 0.35,
            filter: "blur(2.5px)",
            zIndex: 10,
          };
        case "back":
          return {
            left: "50%",
            transform: "translateX(-50%)",
            height: mobileHeight,
            bottom: mobileBottom,
            opacity: 0,
            filter: "blur(5px)",
            zIndex: 0,
          };
      }
    }

    switch (role) {
      case "center":
        return {
          left: "50%",
          transform: "translateX(-50%)",
          height: baseHeight,
          bottom: baseBottom,
          opacity: 1,
          filter: "blur(0px)",
          zIndex: 20,
        };
      case "left":
        return {
          left: "30%",
          transform: "translateX(-50%)",
          height: baseHeight,
          bottom: baseBottom,
          opacity: 0.85,
          filter: "blur(1.5px)",
          zIndex: 10,
        };
      case "right":
        return {
          left: "70%",
          transform: "translateX(-50%)",
          height: baseHeight,
          bottom: baseBottom,
          opacity: 0.85,
          filter: "blur(1.5px)",
          zIndex: 10,
        };
      case "back":
        return {
          left: "50%",
          transform: "translateX(-50%)",
          height: baseHeight,
          bottom: baseBottom,
          opacity: 0.9,
          filter: "blur(3px)",
          zIndex: 5,
        };
    }
  };

  const activeFounder = FOUNDERS[activeIndex];

  // Helper to determine vertical baseline for left panel based on responsive state
  const getPanelBottom = () => {
    if (isMobile) return "10vh";
    if (window.innerWidth < 1024) return "11vh";
    return "12vh";
  };

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] text-white relative">
      <Navbar />
      {/* Hero Section Container (Exactly 100vh) */}
      <section
        ref={containerRef}
        onPointerEnter={handleHeroPointerEnter}
        onPointerMove={handleHeroPointerMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        id="hero-section-container"
        className="relative w-full h-[100svh] min-h-[35.5rem] overflow-hidden select-none touch-pan-y"
        style={{
          backgroundColor: activeFounder.bg,
          backgroundImage: "radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, 0.5) 100%)",
          transition: "background-color 650ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <h1 className="sr-only">Phoenix Labs — Digital Product Studio</h1>
        {/* Dynamic Noise / Grain Overlay */}
        <div className="absolute inset-0 pointer-events-none z-40 opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <filter id="noiseFilter">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.65"
                numOctaves="3"
                stitchTiles="stitch"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>
        </div>

        {/* Subtle Studio Glow overlay */}
        <div className="absolute inset-0 ambient-glow z-30" />

        {/* View Our Work CTA — mobile placement below the global navbar */}
        <a
          href="#work"
          className="group absolute top-20 right-2 z-30 inline-flex min-h-11 sm:hidden items-center gap-2 px-2 text-white/90 hover:text-white transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <span className="font-mono text-[10px] uppercase tracking-wider select-none">
            View Our Work
          </span>
          <span className="phoenix-icon-3d w-6 h-6 rounded-full border border-white/20 flex items-center justify-center bg-white/5 group-hover:bg-white/10 group-hover:border-white/40 transition-colors duration-200">
            <ArrowRight size={10} className="text-white group-hover:translate-x-0.5 transition-transform duration-200" />
          </span>
        </a>

        {/* Top Right "Edition" Tag to feel like a collectible - Desktop only */}
        <div className="absolute top-20 right-6 z-30 hidden sm:flex flex-col items-end opacity-60">
          <span className="text-[10px] text-white/80 font-mono tracking-widest uppercase">
            FOUNDERS EDITION
          </span>
          <span className="text-[9px] text-white/50 font-mono">
            SERIES 01 // 2026
          </span>
        </div>

        {/* Giant Background Typography */}
        <div
          className="absolute w-full text-center z-1 pointer-events-none select-none overflow-hidden whitespace-nowrap uppercase font-display text-white/[0.04] sm:text-white/[0.08] tracking-[-0.02em] leading-none"
          style={{
            fontSize: isMobile ? "clamp(48px, 12vw, 80px)" : "clamp(80px, 20vw, 310px)",
            top: isMobile ? "14%" : "11%",
          }}
        >
          Phoenix Labs
        </div>

        {/* Founder Carousel Container */}
        <div className="absolute inset-0 w-full h-full z-10 flex items-end justify-center pointer-events-none">
          {FOUNDERS.map((founder, i) => {
              const role = getRole(i);
              const style = getRoleStyles(role);

              return (
                <div
                  key={founder.name}
                  className="absolute carousel-transition flex flex-col items-center justify-end pointer-events-auto"
                  style={{
                    left: style.left,
                    transform: style.transform,
                    height: style.height,
                    bottom: style.bottom,
                    opacity: style.opacity,
                    filter: style.filter,
                    zIndex: style.zIndex,
                    width: isMobile ? "240px" : "550px", // Keep character sizing consistent
                  }}
                >
                  {/* Aspect-square container holding character + pedestal stand */}
                  <div 
                    className="relative w-full h-[80%] flex items-end justify-center transition-transform duration-[650ms] ease-out"
                    style={{
                      transform: `scale(${role === "center" ? 1.0 : role === "back" ? 0.42 : 0.52})`,
                      transformOrigin: "bottom center",
                    }}
                  >
                    <img
                      src={founder.image}
                      alt={founder.name}
                      draggable={false}
                      className="w-full h-full object-contain object-bottom pointer-events-none"
                      style={{
                        filter: role === "center" ? "drop-shadow(0 20px 40px rgba(0, 0, 0, 0.45))" : "none",
                      }}
                    />
                  </div>
                  
                  {/* Floating Nameplate System - hidden on mobile to avoid overlap */}
                  <div
                    className="flex flex-col items-center justify-center text-center w-[280px] h-[20%] pointer-events-none select-none transition-opacity duration-500 ease-out mt-3 hidden sm:flex"
                    style={{
                      opacity: role === "center" ? 1 : role === "back" ? 0 : 0.4,
                    }}
                  >
                    <span className="text-[9px] sm:text-[10px] text-white/50 tracking-[0.25em] font-sans font-semibold uppercase leading-none">
                      {founder.role}
                    </span>
                    <span className="text-xs sm:text-sm font-sans font-bold text-white tracking-[0.15em] uppercase mt-2.5 leading-none">
                      {founder.name}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Dynamic Pagination Dots Selector (Centered at bottom) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 hidden sm:flex items-center gap-6 pointer-events-auto">
          {FOUNDERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (isAnimating || idx === activeIndex) return;
                setIsAnimating(true);
                setActiveIndex(idx);
                setTimeout(() => setIsAnimating(false), 650);
              }}
              className="flex min-w-11 min-h-11 items-center justify-center gap-2 group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label={`Show founder ${idx + 1}: ${FOUNDERS[idx].name}`}
              aria-current={idx === activeIndex ? "true" : undefined}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeIndex
                    ? "bg-accent scale-125"
                    : "bg-white/20 group-hover:bg-white/40"
                }`}
              />
              <span
                className={`text-[10px] font-mono transition-all duration-300 ${
                  idx === activeIndex
                    ? "text-white font-bold"
                    : "text-white/30 group-hover:text-white/50"
                }`}
              >
                0{idx + 1}
              </span>
            </button>
          ))}
        </div>

        {/* LEFT = Founder Story (Positioned at lower-left on desktop, stacked flex-column on mobile) */}
        <div 
          className="absolute left-6 right-6 sm:right-auto sm:left-12 md:left-16 lg:left-20 z-30 pointer-events-none flex flex-col justify-end max-w-[420px]"
          style={{ 
            bottom: isMobile ? "4vh" : getPanelBottom(),
            height: isMobile ? "38vh" : "auto"
          }}
        >
          <div className="pointer-events-auto flex flex-col h-full justify-between">
            {/* Animate change by keying on activeIndex */}
            <div key={activeIndex} className="animate-fade-in-up flex flex-col gap-2">
              <span className="text-white/40 text-[9px] font-mono tracking-widest uppercase flex items-center gap-1.5 justify-center sm:justify-start">
                <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                FEATURED TALENT // 0{activeIndex + 1}
              </span>
              
              {/* Reduced founder name size for mobile */}
              <h2 
                className="text-white font-display uppercase tracking-tighter leading-none mt-1 select-none text-center sm:text-left"
                style={{ fontSize: isMobile ? "2.5rem" : "clamp(3rem, 4vw, 5rem)" }}
              >
                {activeFounder.name}
              </h2>
              
              {/* Tightened role spacing and role label size */}
              <p className="text-white/95 font-sans font-semibold tracking-wide uppercase text-xs sm:text-[14px] text-center sm:text-left">
                {activeFounder.role}
              </p>
              
              {/* Core Skills Badges */}
              <div className="flex flex-wrap gap-2 mt-1 justify-center sm:justify-start">
                {activeFounder.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center justify-center h-6 px-3 border border-white/20 rounded-md text-[9px] tracking-wider uppercase font-mono font-bold bg-white/5 text-white/90"
                  >
                    [{skill}]
                  </span>
                ))}
              </div>

              {/* Founder Bio Description */}
              <p className="hidden sm:block text-white/70 text-xs leading-relaxed font-sans mt-3.5 border-t border-white/10 pt-3 max-w-[400px]">
                {activeFounder.bio}
              </p>

              {/* Inspirational Quote */}
              <div className="hidden sm:flex items-stretch gap-3 mt-3.5 pl-3 border-l-2 border-accent max-w-[390px]">
                <p className="text-white/60 italic text-[11px] sm:text-[12px] leading-relaxed font-sans py-0.5">
                  "{activeFounder.quote}"
                </p>
              </div>
            </div>

            {/* Navigation & Pagination stacked below on mobile */}
            <div className="flex flex-col items-center sm:items-start gap-4 mt-2">
              {/* Navigation (Circular Buttons) */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("prev")}
                  disabled={isAnimating}
                  className="w-11 h-11 sm:w-10 sm:h-10 rounded-full border-2 border-white flex items-center justify-center text-white transition-all duration-150 active:scale-95 hover:scale-108 hover:bg-white/12 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Previous Founder"
                >
                  <ArrowLeft size={18} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => navigate("next")}
                  disabled={isAnimating}
                  className="w-11 h-11 sm:w-10 sm:h-10 rounded-full border-2 border-white flex items-center justify-center text-white transition-all duration-150 active:scale-95 hover:scale-108 hover:bg-white/12 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Next Founder"
                >
                  <ArrowRight size={18} strokeWidth={2.5} />
                </button>
              </div>

              {/* Pagination Dots on Mobile */}
              <div className="flex sm:hidden items-center gap-4 mt-1">
                {FOUNDERS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (isAnimating || idx === activeIndex) return;
                      setIsAnimating(true);
                      setActiveIndex(idx);
                      setTimeout(() => setIsAnimating(false), 650);
                    }}
                    className="flex min-w-11 min-h-11 items-center justify-center gap-1.5 group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    aria-label={`Show founder ${idx + 1}: ${FOUNDERS[idx].name}`}
                    aria-current={idx === activeIndex ? "true" : undefined}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        idx === activeIndex
                          ? "bg-accent scale-125"
                          : "bg-white/20"
                      }`}
                    />
                    <span
                      className={`text-[10px] font-mono transition-all duration-300 ${
                        idx === activeIndex
                          ? "text-white font-bold"
                          : "text-white/30"
                      }`}
                    >
                      0{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT = Primary CTA (Vertically centered right panel) - desktop only */}
        <div className="absolute right-6 sm:right-12 md:right-16 lg:right-20 top-1/2 -translate-y-1/2 z-30 pointer-events-auto hidden sm:block">
          <a
            href="#work"
            className="group inline-flex items-center gap-3 text-white opacity-95 hover:opacity-100 transition-opacity duration-200"
          >
            <span className="font-display text-2xl sm:text-3xl tracking-wide uppercase select-none">
              View Our Work
            </span>
            <div className="phoenix-icon-3d w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/5 group-hover:bg-white/10 group-hover:border-white/40 transition-colors duration-200">
              <ArrowRight size={18} className="text-white group-hover:translate-x-0.5 transition-transform duration-200" />
            </div>
          </a>
        </div>
      </section>

      {/* Continuous Brand Gradient Container for all sections below Hero */}
      <main className="w-full relative overflow-x-clip z-30 bg-[#010101]">
        {/* ORIGINAL continuous Phoenix gradient background */}
        <div className="absolute inset-0 z-0 pointer-events-none phoenix-site-gradient" />

        <div className="relative z-10">
          {/* Value Pillars Grid (Transition Block - positioned completely below the hero) */}
          <div className="w-full py-16 border-t border-white/5 relative z-30">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-24">
            <div className="bg-[#111111]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 shadow-[0_24px_48px_rgba(0,0,0,0.5)]">
              <div className="flex flex-col gap-3">
                <div className="phoenix-icon-3d w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-accent">
                  <Zap size={16} />
                </div>
                <h4 className="text-white font-sans text-xs font-bold tracking-wider uppercase">Fast & Reliable</h4>
                <p className="text-white/50 text-[11px] leading-relaxed">High performance solutions built for scale.</p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="phoenix-icon-3d w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-accent">
                  <Code size={16} />
                </div>
                <h4 className="text-white font-sans text-xs font-bold tracking-wider uppercase">Modern Technology</h4>
                <p className="text-white/50 text-[11px] leading-relaxed">We use the latest tools to build future-ready products.</p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="phoenix-icon-3d w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-accent">
                  <Users size={16} />
                </div>
                <h4 className="text-white font-sans text-xs font-bold tracking-wider uppercase">Collaborative</h4>
                <p className="text-white/50 text-[11px] leading-relaxed">We work closely with you from idea to launch.</p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="phoenix-icon-3d w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-accent">
                  <ShieldCheck size={16} />
                </div>
                <h4 className="text-white font-sans text-xs font-bold tracking-wider uppercase">Quality Focused</h4>
                <p className="text-white/50 text-[11px] leading-relaxed">Clean code, tested thoroughly, and built to last.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll-driven What We Build story */}
        <WhatWeBuildSection />

        {/* Services Section (Premium Symmetrical Grid) */}
        <ServicesSection />

        {/* Tech Stack Orbit Section */}
        <TechStackOrbitSection />

        {/* Transforming services product lab */}
        <ServicesProductLab />

        {/* Featured Work Case-Study Reel */}
        <FeaturedWorkReel />

        {/* Why Phoenix Labs editorial bridge */}
        <WhyPhoenixEditorial />

        {/* Our Process Section */}
        <ProcessFlightPath />

        {/* Project enquiry and integrated footer */}
        <StartProjectSection />
        </div>
      </main>
    </div>
  );
}

// Services Section Component (Premium Symmetrical 2x2 Grid)
function ServicesSection() {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
        }
      },
      { threshold: 0.15 }
    );
    const section = sectionRef.current;
    if (section) observer.observe(section);
    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  const services = [
    {
      id: "web-dev",
      title: "Web Development",
      description: "We craft ultra-fast, visually stunning React & Next.js websites. Engineered for sub-second loads, robust SEO, and fluid responsive layouts.",
      icon: <Globe size={24} className="text-accent" />,
      bullets: ["Headless Architectures", "Next.js & Vite Builds", "Performant Motion Design"],
      graphic: (
        <div className="absolute right-4 bottom-4 w-[35%] h-[50%] opacity-20 group-hover:opacity-30 transition-opacity duration-500 overflow-hidden pointer-events-none hidden md:block">
          <svg className="w-full h-full text-white" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="10" y1="20" x2="190" y2="20" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
            <line x1="10" y1="60" x2="190" y2="60" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
            <line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
            <line x1="10" y1="140" x2="190" y2="140" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
            <circle cx="100" cy="100" r="40" stroke="var(--color-accent)" strokeWidth="1" />
            <circle cx="100" cy="100" r="55" stroke="var(--color-accent)" strokeWidth="0.5" strokeDasharray="2 2" />
            <path d="M70,100 L130,100 M100,70 L100,130" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>
      )
    },
    {
      id: "design",
      title: "UI/UX Design",
      description: "Memorable design systems built in Figma. We balance creative graphics with strict usability guidelines to construct interfaces clients love.",
      icon: <Palette size={24} className="text-accent" />,
      bullets: ["Interactive Prototypes", "Premium Brand Systems", "Micro-Animations"],
      graphic: (
        <div className="absolute right-4 bottom-4 w-[38%] h-[40%] opacity-20 group-hover:opacity-30 transition-opacity duration-500 overflow-hidden pointer-events-none hidden md:block">
          <svg className="w-full h-full text-white" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="30" width="60" height="40" rx="4" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="140" cy="50" r="25" stroke="var(--color-accent)" strokeWidth="1" />
            <path d="M70,50 L115,50" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
            <path d="M110,45 L115,50 L110,55" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>
      )
    },
    {
      id: "saas",
      title: "SaaS Development",
      description: "Full-stack cloud products built to scale. Secure API pipelines, resilient database layers, and serverless compute pipelines.",
      icon: <Server size={24} className="text-accent" />,
      bullets: ["Node.js & Serverless", "PostgreSQL & Redis", "Stripe Integrations"],
      graphic: (
        <div className="absolute right-4 bottom-4 w-[38%] h-[40%] opacity-20 group-hover:opacity-30 transition-opacity duration-500 overflow-hidden pointer-events-none hidden md:block">
          <svg className="w-full h-full text-white" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="40" y="10" width="120" height="20" rx="3" stroke="currentColor" strokeWidth="0.5" />
            <rect x="40" y="40" width="120" height="20" rx="3" stroke="var(--color-accent)" strokeWidth="1" />
            <rect x="40" y="70" width="120" height="20" rx="3" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="50" cy="20" r="2" fill="currentColor" />
            <circle cx="50" cy="50" r="2" fill="var(--color-accent)" />
            <circle cx="50" cy="80" r="2" fill="currentColor" />
          </svg>
        </div>
      )
    },
    {
      id: "growth",
      title: "Growth & Optimization",
      description: "Turn traffic into revenue. We optimize Lighthouse performance, configure advanced analytics, and boost conversion rates through quantitative engineering.",
      icon: <TrendingUp size={24} className="text-accent" />,
      bullets: ["Lighthouse Optimization (99+)", "Conversion Strategy", "Custom Marketing Analytics"],
      graphic: (
        <div className="absolute right-4 bottom-4 w-[35%] h-[55%] opacity-20 group-hover:opacity-30 transition-opacity duration-500 overflow-hidden pointer-events-none hidden md:block">
          <svg className="w-full h-full text-white" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20,160 L60,120 L100,130 L140,70 L180,50" stroke="var(--color-accent)" strokeWidth="1.5" />
            <path d="M20,160 L60,120 L100,130 L140,70 L180,50 L180,160 L20,160 Z" fill="url(#chartGrad)" opacity="0.1" />
            <line x1="20" y1="160" x2="180" y2="160" stroke="currentColor" strokeWidth="0.5" />
            <line x1="20" y1="40" x2="20" y2="160" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="180" cy="50" r="3" fill="var(--color-accent)" />
            <defs>
              <linearGradient id="chartGrad" x1="100" y1="50" x2="100" y2="160" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F32100" />
                <stop offset="1" stopColor="#F32100" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )
    }
  ];

  return (
    <section
      ref={sectionRef}
      id="services"
      aria-labelledby="services-heading"
      className="relative min-h-screen px-6 pt-32 pb-28 sm:pt-36 sm:pb-36 lg:pt-40 lg:px-24 md:px-24 border-t border-white/5 z-30 overflow-hidden"
    >
      {/* base background */}
      <div className="absolute inset-0 z-0 pointer-events-none services-base-bg" />

      {/* new atmospheric meeting room scene */}
      <div className="absolute inset-0 z-[1] pointer-events-none services-scene-bg" />

      {/* readability overlay */}
      <div className="absolute inset-0 z-[2] pointer-events-none services-scene-overlay" />

      {/* actual content */}
      <div className="relative z-20">
        {/* Title block */}
        <div className={`flex flex-col md:flex-row gap-12 md:gap-24 mb-16 transition-all duration-1000 ease-out transform ${
          isIntersecting ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}>
          {/* Left Column Label */}
          <div className="md:w-1/4 flex-shrink-0">
            <span className="text-white/40 text-xs font-mono tracking-[0.25em] font-semibold uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              02 / Capabilities
            </span>
          </div>
          {/* Right Column Statement */}
          <div className="md:w-3/4">
            <h2 id="services-heading" className="text-white font-sans text-3xl sm:text-5xl font-bold tracking-tight leading-[1.15] max-w-4xl uppercase">
              Services that scale with your ambitions.
            </h2>
            <p className="text-white/50 text-sm sm:text-base leading-relaxed mt-4 max-w-2xl font-sans">
              We operate as an elite studio, deploying micro-teams of high-end designers and engineers. No layers of management, just direct access to builders.
            </p>
          </div>
        </div>

        {/* Symmetrical Services Grid (2x2 equal width columns on desktop/tablet) */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto transition-all duration-1000 delay-300 ease-out transform ${
            isIntersecting ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
        >
          {services.map((svc) => {
            return (
              <div
                key={svc.id}
                className="bento-card phoenix-static-card group p-6 sm:p-8 flex flex-col justify-between relative z-10 min-h-[300px] sm:min-h-[320px]"
              >
                {svc.graphic}

                {/* Text content & tag pills wrapped inside a single container that is restricted to max 58% width on desktop to guarantee zero overlap */}
                <div className="relative z-10 flex-1 flex flex-col justify-between h-full w-full md:max-w-[58%]">
                  <div className="flex flex-col gap-4">
                    <div className="phoenix-icon-3d w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-accent/30 transition-colors duration-300">
                      {svc.icon}
                    </div>
                    <h3 className="text-white font-sans text-xl sm:text-2xl font-bold tracking-tight mt-2 uppercase">
                      {svc.title}
                    </h3>
                    <p className="text-white/50 text-xs sm:text-sm leading-relaxed">
                      {svc.description}
                    </p>
                  </div>

                  {/* Tag pill display */}
                  <div className="flex flex-wrap gap-2 mt-6">
                    {svc.bullets.map((bullet) => (
                      <span
                        key={bullet}
                        className="inline-block px-2.5 py-0.5 border border-white/10 rounded-md text-[9px] sm:text-[10px] tracking-wider uppercase font-mono bg-white/5 text-white/70 group-hover:border-white/20 transition-all duration-300"
                      >
                        {bullet}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
