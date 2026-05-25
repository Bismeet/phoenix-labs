import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, Zap, Code, Users, ShieldCheck, Globe, Palette, Server, TrendingUp, CheckCircle2, Cpu, Puzzle, Brain, Layers, Search, Map, Code2, Rocket } from "lucide-react";
import "./App.css";

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
    image: "/founder_bismeet.png",
    bg: "#FF6B35", // Vibrant Orange
    bio: "Lead developer and main architect. Translates complex business needs into fast, highly optimized web applications.",
    quote: "We don't just write code; we design architectures that empower companies to scale without friction.",
  },
  {
    name: "Aditya",
    role: "Operations & Lead Management",
    shortRole: "Operations Lead",
    skills: ["Business Dev", "Client Strategy", "Product Mgmt"],
    image: "/founder_backend.png",
    bg: "#3B82F6", // Electric Blue
    bio: "Operations lead and client partner. Handles business development, client communications, and coordinates product strategy.",
    quote: "A great product is only as good as the execution behind it. We align strategy with relentless execution.",
  },
  {
    name: "Abhinav",
    role: "Co-Lead & Full Stack Engineer",
    shortRole: "Full Stack Dev",
    skills: ["Node.js", "APIs", "Cloud Scaling"],
    image: "/founder_abhinav.png",
    bg: "#8B5CF6", // Purple
    bio: "Co-lead Full Stack engineer assisting Bismeet. Builds robust API infrastructure, cloud architecture pipelines, and database schemas.",
    quote: "Every backend pipeline we build is designed for sub-100ms response times, securing near-zero downtime.",
  },
  {
    name: "Nikki",
    role: "UI/UX Designer & Frontend",
    shortRole: "UI/UX Designer",
    skills: ["Figma", "UI Design", "Tailwind CSS"],
    image: "/founder_fullstack.png",
    bg: "#10B981", // Green
    bio: "Visual Designer & Frontend developer. Bridges the gap between creative visual systems and pixel-perfect layouts.",
    quote: "Interface design is visual storytelling. We bridge aesthetics and utility to create memorable products.",
  },
];

// Utility function to process images: keys out solid black backgrounds cleanly
const processFounderImage = (src: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(src);
        return;
      }
      ctx.drawImage(img, 0, 0);
      
      const width = canvas.width;
      const height = canvas.height;
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      // Key out the black background with soft feathering
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const maxVal = Math.max(r, g, b);

        if (maxVal < 15) {
          data[i + 3] = 0;
        } else if (maxVal < 35) {
          const alpha = ((maxVal - 15) / (35 - 15)) * 255;
          data[i + 3] = Math.min(data[i + 3], Math.round(alpha));
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      resolve(src);
    };
  });
};

export default function App() {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 640);
  const [processedImages, setProcessedImages] = useState<string[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tracking state for ambient glow effect
  const [mousePos, setMousePos] = useState({ x: "50%", y: "50%" });

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Preload and process images on mount
  useEffect(() => {
    const preloadImages = async () => {
      const processed = await Promise.all(
        FOUNDERS.map((founder) => processFounderImage(founder.image))
      );
      setProcessedImages(processed);
      setImagesLoaded(true);
    };
    preloadImages();
  }, []);

  // Tracks cursor location for CSS-based background reflection
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x: `${x}%`, y: `${y}%` });
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

    switch (role) {
      case "center":
        return {
          left: "50%",
          height: baseHeight,
          bottom: baseBottom,
          opacity: 1,
          filter: "blur(0px)",
          zIndex: 20,
        };
      case "left":
        return {
          left: isMobile ? "18%" : "30%",
          height: baseHeight,
          bottom: baseBottom,
          opacity: 0.85,
          filter: "blur(1.5px)",
          zIndex: 10,
        };
      case "right":
        return {
          left: isMobile ? "82%" : "70%",
          height: baseHeight,
          bottom: baseBottom,
          opacity: 0.85,
          filter: "blur(1.5px)",
          zIndex: 10,
        };
      case "back":
        return {
          left: "50%",
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
    <div className="w-full min-h-screen bg-[#0A0A0A] text-white">
      {/* Hero Section Container (Exactly 100vh) */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative w-full h-screen overflow-hidden select-none"
        style={{
          backgroundColor: activeFounder.bg,
          backgroundImage: "radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, 0.5) 100%)",
          transition: "background-color 650ms cubic-bezier(0.4, 0, 0.2, 1)",
          // Pass mouse position variables to CSS
          // @ts-expect-error Custom CSS variables
          "--mouse-x": mousePos.x,
          "--mouse-y": mousePos.y,
        }}
      >
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

        {/* Top Left Branding */}
        <div className="absolute top-6 left-6 z-30 flex items-center gap-2">
          <span className="text-white text-xs font-semibold tracking-[0.18em] uppercase font-sans">
            Phoenix Labs
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        </div>

        {/* Top Right "Edition" Tag to feel like a collectible */}
        <div className="absolute top-6 right-6 z-30 hidden sm:flex flex-col items-end opacity-60">
          <span className="text-[10px] text-white/80 font-mono tracking-widest uppercase">
            FOUNDERS EDITION
          </span>
          <span className="text-[9px] text-white/50 font-mono">
            SERIES 01 // 2026
          </span>
        </div>

        {/* Giant Background Typography */}
        <div
          className="absolute w-full text-center z-1 pointer-events-none select-none overflow-hidden whitespace-nowrap uppercase font-display text-white/[0.08] tracking-[-0.02em] leading-none"
          style={{
            fontSize: "clamp(80px, 20vw, 310px)",
            top: "11%",
          }}
        >
          Phoenix Labs
        </div>

        {/* Founder Carousel Container */}
        <div className="absolute inset-0 w-full h-full z-10 flex items-end justify-center pointer-events-none">
          {imagesLoaded &&
            FOUNDERS.map((founder, i) => {
              const role = getRole(i);
              const style = getRoleStyles(role);
              const imgSrc = processedImages[i] || founder.image;

              return (
                <div
                  key={founder.name}
                  className="absolute carousel-transition flex flex-col items-center justify-end pointer-events-auto"
                  style={{
                    left: style.left,
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
                      src={imgSrc}
                      alt={founder.name}
                      draggable={false}
                      className="w-full h-full object-contain object-bottom pointer-events-none"
                      style={{
                        filter: role === "center" ? "drop-shadow(0 20px 40px rgba(0, 0, 0, 0.45))" : "none",
                      }}
                    />
                  </div>
                  
                  {/* Floating Nameplate System */}
                  <div
                    className="flex flex-col items-center justify-center text-center w-[280px] h-[20%] pointer-events-none select-none transition-opacity duration-500 ease-out mt-3"
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
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6 pointer-events-auto">
          {FOUNDERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (isAnimating || idx === activeIndex) return;
                setIsAnimating(true);
                setActiveIndex(idx);
                setTimeout(() => setIsAnimating(false), 650);
              }}
              className="flex items-center gap-2 focus:outline-none group cursor-pointer"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeIndex
                    ? "bg-[#FF6B35] scale-125"
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

        {/* LEFT = Founder Story (Positioned at lower-left, aligning with pedestal floor) */}
        <div 
          className="absolute left-6 sm:left-12 md:left-16 lg:left-20 z-30 pointer-events-none flex flex-col justify-end w-full max-w-[420px]"
          style={{ bottom: getPanelBottom() }}
        >
          <div className="pointer-events-auto flex flex-col">
            {/* Animate change by keying on activeIndex */}
            <div key={activeIndex} className="animate-fade-in-up flex flex-col">
              <span className="text-white/40 text-[9px] font-mono tracking-widest uppercase flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                FEATURED TALENT // 0{activeIndex + 1}
              </span>
              
              {/* Reduced founder name size to clamp(3rem, 4vw, 5rem) */}
              <h2 
                className="text-white font-display uppercase tracking-tighter leading-none mt-2 select-none"
                style={{ fontSize: "clamp(3rem, 4vw, 5rem)" }}
              >
                {activeFounder.name}
              </h2>
              
              {/* Tightened role spacing and role label size */}
              <p className="text-white/95 font-sans font-semibold tracking-wide uppercase mt-1.5 text-xs sm:text-[14px]">
                {activeFounder.role}
              </p>
              
              {/* Core Skills Badges */}
              <div className="flex flex-wrap gap-2 mt-2.5">
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
              <div className="hidden sm:flex items-stretch gap-3 mt-3.5 pl-3 border-l-2 border-[#FF6B35] max-w-[390px]">
                <p className="text-white/60 italic text-[11px] sm:text-[12px] leading-relaxed font-sans py-0.5">
                  "{activeFounder.quote}"
                </p>
              </div>
            </div>

            {/* Navigation (Circular Buttons - aligned at bottom) */}
            <div className="flex items-center gap-3 mt-5">
              <button
                onClick={() => navigate("prev")}
                disabled={isAnimating}
                className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white transition-all duration-150 active:scale-95 hover:scale-108 hover:bg-white/12 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous Founder"
              >
                <ArrowLeft size={16} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => navigate("next")}
                disabled={isAnimating}
                className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white transition-all duration-150 active:scale-95 hover:scale-108 hover:bg-white/12 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next Founder"
              >
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT = Primary CTA (Vertically centered right panel) */}
        <div className="absolute right-6 sm:right-12 md:right-16 lg:right-20 top-1/2 -translate-y-1/2 z-30 pointer-events-auto">
          <a
            href="#about"
            className="group inline-flex items-center gap-3 text-white opacity-95 hover:opacity-100 transition-opacity duration-200"
          >
            <span className="font-display text-2xl sm:text-3xl tracking-wide uppercase select-none">
              View Our Work
            </span>
            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/5 group-hover:bg-white/10 group-hover:border-white/40 transition-colors duration-200">
              <ArrowRight size={18} className="text-white group-hover:translate-x-0.5 transition-transform duration-200" />
            </div>
          </a>
        </div>
      </div>

      {/* Value Pillars Grid (Transition Block - positioned completely below the hero) */}
      <div className="w-full bg-[#0A0A0A] py-16 border-t border-white/5 relative z-30">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-24">
          <div className="bg-[#111111]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 shadow-[0_24px_48px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#FF6B35]">
                <Zap size={16} />
              </div>
              <h4 className="text-white font-sans text-xs font-bold tracking-wider uppercase">Fast & Reliable</h4>
              <p className="text-white/50 text-[11px] leading-relaxed">High performance solutions built for scale.</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#FF6B35]">
                <Code size={16} />
              </div>
              <h4 className="text-white font-sans text-xs font-bold tracking-wider uppercase">Modern Technology</h4>
              <p className="text-white/50 text-[11px] leading-relaxed">We use the latest tools to build future-ready products.</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#FF6B35]">
                <Users size={16} />
              </div>
              <h4 className="text-white font-sans text-xs font-bold tracking-wider uppercase">Collaborative</h4>
              <p className="text-white/50 text-[11px] leading-relaxed">We work closely with you from idea to launch.</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#FF6B35]">
                <ShieldCheck size={16} />
              </div>
              <h4 className="text-white font-sans text-xs font-bold tracking-wider uppercase">Quality Focused</h4>
              <p className="text-white/50 text-[11px] leading-relaxed">Clean code, tested thoroughly, and built to last.</p>
            </div>
          </div>
        </div>
      </div>

      {/* About/Transition Section */}
      <AboutSection />

      {/* Services Section (Premium Symmetrical Grid) */}
      <ServicesSection />

      {/* Featured Work Case Studies Section */}
      <FeaturedWorkSection />

      {/* Why Phoenix Labs Section */}
      <WhyPhoenixLabsSection />

      {/* Our Process Section */}
      <OurProcessSection />

      {/* Project Estimator Section */}
      <ProjectEstimatorSection />

      {/* Final Cinematic Section & Footer */}
      <FinalSection />
    </div>
  );
}

// Who We Are / About Section Component
function AboutSection() {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
        }
      },
      {
        threshold: 0.20, // Start animation when 20% of section enters viewport
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const statementLines = [
    "Phoenix Labs builds modern websites,",
    "web applications, and SaaS products",
    "for startups, creators, and businesses.",
  ];

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative min-h-[75vh] bg-[#0A0A0A] px-6 py-20 sm:py-28 sm:px-12 md:px-24 flex flex-col md:flex-row gap-12 md:gap-24 border-t border-white/5 z-30"
    >
      {/* Left Column - Sticky Section Label */}
      <div className="md:w-1/4 flex-shrink-0">
        <div className="md:sticky md:top-12">
          <span className="text-white/40 text-xs font-mono tracking-[0.25em] font-semibold uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#FF6B35] rounded-full animate-pulse" />
            01 / Who We Are
          </span>
        </div>
      </div>

      {/* Right Column - Main Text Content */}
      <div className="md:w-3/4 flex flex-col gap-8">
        <h3 className="text-white font-sans text-3xl sm:text-5xl font-bold tracking-tight leading-[1.15] max-w-4xl">
          {statementLines.map((line, idx) => (
            <span key={idx} className="block overflow-hidden py-1">
              <span
                className={`block transition-all duration-750 ease-out transform ${
                  isIntersecting
                    ? "translate-y-0 opacity-100"
                    : "translate-y-12 opacity-0"
                }`}
                style={{ transitionDelay: `${idx * 180}ms` }}
              >
                {line}
              </span>
            </span>
          ))}
        </h3>

        {/* Supporting Paragraph & Metrics */}
        <div
          className={`flex flex-col gap-10 max-w-2xl transition-all duration-1000 ease-out transform ${
            isIntersecting
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "700ms" }}
        >
          <p className="text-white/60 text-base sm:text-lg leading-relaxed font-sans font-normal">
            We partner with ambitious founders and forward-thinking companies to craft products that define industries. By combining high-end motion design, rigorous engineering, and scalable cloud architectures, we turn bold concepts into market-defining digital products.
          </p>

          {/* Stat Pillars */}
          <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-10 mt-2">
            <div>
              <h4 className="text-white font-display text-4xl sm:text-5xl leading-none">99+</h4>
              <p className="text-white/40 text-[10px] font-mono tracking-wider mt-3 uppercase">
                Lighthouse Performance
              </p>
            </div>
            <div>
              <h4 className="text-white font-display text-4xl sm:text-5xl leading-none">&lt;100ms</h4>
              <p className="text-white/40 text-[10px] font-mono tracking-wider mt-3 uppercase">
                Global Edge Latency
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Services Section Component (Premium Symmetrical 2x2 Grid)
function ServicesSection() {
  const [glows, setGlows] = useState<Record<string, { x: string; y: string }>>({});
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
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  const handleMouseMove = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = `${e.clientX - rect.left}px`;
    const y = `${e.clientY - rect.top}px`;
    setGlows((prev) => ({ ...prev, [id]: { x, y } }));
  };

  const services = [
    {
      id: "web-dev",
      title: "Web Development",
      description: "We craft ultra-fast, visually stunning React & Next.js websites. Engineered for sub-second loads, robust SEO, and fluid responsive layouts.",
      icon: <Globe size={24} className="text-[#FF6B35]" />,
      bullets: ["Headless Architectures", "Next.js & Vite Builds", "Performant Motion Design"],
      graphic: (
        <div className="absolute right-4 bottom-4 w-[35%] h-[50%] opacity-20 group-hover:opacity-30 transition-opacity duration-500 overflow-hidden pointer-events-none hidden md:block">
          <svg className="w-full h-full text-white" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="10" y1="20" x2="190" y2="20" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
            <line x1="10" y1="60" x2="190" y2="60" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
            <line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
            <line x1="10" y1="140" x2="190" y2="140" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
            <circle cx="100" cy="100" r="40" stroke="#FF6B35" strokeWidth="1" />
            <circle cx="100" cy="100" r="55" stroke="#FF6B35" strokeWidth="0.5" strokeDasharray="2 2" />
            <path d="M70,100 L130,100 M100,70 L100,130" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>
      )
    },
    {
      id: "design",
      title: "UI/UX Design",
      description: "Memorable design systems built in Figma. We balance creative graphics with strict usability guidelines to construct interfaces clients love.",
      icon: <Palette size={24} className="text-[#FF6B35]" />,
      bullets: ["Interactive Prototypes", "Premium Brand Systems", "Micro-Animations"],
      graphic: (
        <div className="absolute right-4 bottom-4 w-[38%] h-[40%] opacity-20 group-hover:opacity-30 transition-opacity duration-500 overflow-hidden pointer-events-none hidden md:block">
          <svg className="w-full h-full text-white" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="30" width="60" height="40" rx="4" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="140" cy="50" r="25" stroke="#FF6B35" strokeWidth="1" />
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
      icon: <Server size={24} className="text-[#FF6B35]" />,
      bullets: ["Node.js & Serverless", "PostgreSQL & Redis", "Stripe Integrations"],
      graphic: (
        <div className="absolute right-4 bottom-4 w-[38%] h-[40%] opacity-20 group-hover:opacity-30 transition-opacity duration-500 overflow-hidden pointer-events-none hidden md:block">
          <svg className="w-full h-full text-white" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="40" y="10" width="120" height="20" rx="3" stroke="currentColor" strokeWidth="0.5" />
            <rect x="40" y="40" width="120" height="20" rx="3" stroke="#FF6B35" strokeWidth="1" />
            <rect x="40" y="70" width="120" height="20" rx="3" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="50" cy="20" r="2" fill="currentColor" />
            <circle cx="50" cy="50" r="2" fill="#FF6B35" />
            <circle cx="50" cy="80" r="2" fill="currentColor" />
          </svg>
        </div>
      )
    },
    {
      id: "growth",
      title: "Growth & Optimization",
      description: "Turn traffic into revenue. We optimize Lighthouse performance, configure advanced analytics, and boost conversion rates through quantitative engineering.",
      icon: <TrendingUp size={24} className="text-[#FF6B35]" />,
      bullets: ["Lighthouse Optimization (99+)", "Conversion Strategy", "Custom Marketing Analytics"],
      graphic: (
        <div className="absolute right-4 bottom-4 w-[35%] h-[55%] opacity-20 group-hover:opacity-30 transition-opacity duration-500 overflow-hidden pointer-events-none hidden md:block">
          <svg className="w-full h-full text-white" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20,160 L60,120 L100,130 L140,70 L180,50" stroke="#FF6B35" strokeWidth="1.5" />
            <path d="M20,160 L60,120 L100,130 L140,70 L180,50 L180,160 L20,160 Z" fill="url(#chartGrad)" opacity="0.1" />
            <line x1="20" y1="160" x2="180" y2="160" stroke="currentColor" strokeWidth="0.5" />
            <line x1="20" y1="40" x2="20" y2="160" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="180" cy="50" r="3" fill="#FF6B35" />
            <defs>
              <linearGradient id="chartGrad" x1="100" y1="50" x2="100" y2="160" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FF6B35" />
                <stop offset="1" stopColor="#FF6B35" stopOpacity="0" />
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
      className="relative min-h-screen bg-[#0A0A0A] px-6 py-28 sm:py-36 sm:px-12 md:px-24 border-t border-white/5 z-30"
    >
      {/* Title block */}
      <div className={`flex flex-col md:flex-row gap-12 md:gap-24 mb-16 transition-all duration-1000 ease-out transform ${
        isIntersecting ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}>
        {/* Left Column Label */}
        <div className="md:w-1/4 flex-shrink-0">
          <span className="text-white/40 text-xs font-mono tracking-[0.25em] font-semibold uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#FF6B35] rounded-full animate-pulse" />
            02 / Capabilities
          </span>
        </div>
        {/* Right Column Statement */}
        <div className="md:w-3/4">
          <h3 className="text-white font-sans text-3xl sm:text-5xl font-bold tracking-tight leading-[1.15] max-w-4xl uppercase">
            Services that scale with your ambitions.
          </h3>
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
          const glow = glows[svc.id] || { x: "50%", y: "50%" };
          return (
            <div
              key={svc.id}
              onMouseMove={(e) => handleMouseMove(svc.id, e)}
              className="bento-card group p-6 sm:p-8 flex flex-col justify-between relative z-10 min-h-[300px] sm:min-h-[320px]"
              style={{
                // @ts-expect-error Custom CSS variables
                "--mouse-x": glow.x,
                "--mouse-y": glow.y,
              }}
            >
              {svc.graphic}

              {/* Text content & tag pills wrapped inside a single container that is restricted to max 58% width on desktop to guarantee zero overlap */}
              <div className="relative z-10 flex-1 flex flex-col justify-between h-full w-full md:max-w-[58%]">
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#FF6B35]/30 transition-colors duration-300">
                    {svc.icon}
                  </div>
                  <h4 className="text-white font-sans text-xl sm:text-2xl font-bold tracking-tight mt-2 uppercase">
                    {svc.title}
                  </h4>
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
    </section>
  );
}

// ==========================================
// FEATURED WORK MOCKUPS (SVG & CSS DETAILED SCHEMATICS)
// ==========================================

function BmwMockup() {
  return (
    <div className="relative w-full h-full bg-[#151515] rounded-xl overflow-hidden border border-white/5 flex flex-col justify-between p-4 group-hover:border-[#FF6B35]/25 transition-colors duration-500 animate-fade-in-up">
      <div className="flex justify-between items-center border-b border-white/5 pb-2 text-[9px] font-mono text-white/40">
        <span>PHX-SIMULATOR // M5_PROTOTYPE</span>
        <span className="flex items-center gap-1 text-[#FF6B35]">
          <span className="w-1.5 h-1.5 bg-[#FF6B35] rounded-full animate-ping" />
          SPORT_MODE
        </span>
      </div>
      
      <div className="flex-grow relative flex items-center justify-center py-4">
        {/* Speedometer gauge background */}
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border border-dashed border-white/10 flex items-center justify-center relative">
          <div className="absolute inset-1.5 rounded-full border border-[#FF6B35]/25 border-t-[#FF6B35] animate-spin" style={{ animationDuration: "12s" }} />
          <div className="absolute inset-3 rounded-full border border-dashed border-white/5" />
          <div className="text-center relative z-10 flex flex-col">
            <span className="text-2xl sm:text-3xl font-display tracking-tight text-white group-hover:text-[#FF6B35] transition-colors duration-300">284</span>
            <span className="text-[7px] font-mono text-white/30 uppercase tracking-widest mt-0.5">KM/H</span>
          </div>
        </div>

        {/* Chassis wire outline lines */}
        <svg className="absolute inset-0 w-full h-full text-white/5 pointer-events-none" viewBox="0 0 300 150">
          <path d="M 40,75 L 110,75 L 130,55 L 190,55 L 200,75 L 260,75" stroke="rgba(255,107,53,0.15)" strokeWidth="1" fill="none" strokeDasharray="4 2" />
          <path d="M 110,75 L 120,95 L 185,95 L 195,75" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />
          <circle cx="110" cy="75" r="2.5" fill="#FF6B35" />
          <circle cx="200" cy="75" r="2.5" fill="#FF6B35" />
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-2 text-[8px] font-mono text-white/40">
        <div className="flex flex-col">
          <span>ENGINE</span>
          <span className="text-white/80 font-bold mt-0.5">4.4L V8 BI-T</span>
        </div>
        <div className="flex flex-col">
          <span>POWER</span>
          <span className="text-[#FF6B35] font-bold mt-0.5">727 HP</span>
        </div>
        <div className="flex flex-col">
          <span>TORQUE</span>
          <span className="text-white/80 font-bold mt-0.5">1000 NM</span>
        </div>
      </div>
    </div>
  );
}

function OnePieceMockup() {
  return (
    <div className="relative w-full h-full bg-[#151515] rounded-xl overflow-hidden border border-white/5 flex flex-col justify-between p-4 group-hover:border-[#FF6B35]/25 transition-colors duration-500 animate-fade-in-up">
      <div className="flex justify-between items-center border-b border-white/5 pb-2 text-[9px] font-mono text-white/40">
        <span>CREATIVE CANVAS // GRAND_LINE_EXP</span>
        <span className="text-white/70">SYSTEM_OK</span>
      </div>

      <div className="flex-grow relative flex items-center justify-between gap-4 py-2">
        {/* Left: Compass */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-white/10 flex items-center justify-center relative flex-shrink-0">
          <div className="absolute inset-1 rounded-full border border-dashed border-white/5" />
          <div className="w-1.5 h-16 bg-gradient-to-b from-[#FF6B35] to-white/10 rotate-[45deg] group-hover:rotate-[225deg] transition-transform duration-1000 ease-in-out" />
          <span className="absolute top-1 text-[7px] font-mono text-white/30">N</span>
          <span className="absolute bottom-1 text-[7px] font-mono text-white/30">S</span>
        </div>

        {/* Right: Adventure map grid paths */}
        <div className="flex-grow h-full border border-dashed border-white/5 rounded-lg p-2 bg-[#101010]/60 relative overflow-hidden flex flex-col justify-between">
          <div className="text-[7px] font-mono text-white/20">CANVAS_MAP_COORDS</div>
          
          <svg className="absolute inset-0 w-full h-full text-[#FF6B35]/20" viewBox="0 0 150 80">
            <path d="M 0,20 L 150,20 M 0,40 L 150,40 M 0,60 L 150,60 M 30,0 L 30,80 M 60,0 L 60,80 M 90,0 L 90,80 M 120,0 L 120,80" stroke="rgba(255,255,255,0.015)" strokeWidth="0.5" />
            <path d="M 20,60 Q 40,20 80,55 T 130,25" fill="none" stroke="#FF6B35" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="20" cy="60" r="3.5" fill="#FF6B35" className="animate-pulse" />
            <circle cx="20" cy="60" r="1.5" fill="#FF6B35" />
            <circle cx="130" cy="25" r="2" fill="#FF6B35" />
          </svg>

          <div className="text-[8px] font-mono text-[#FF6B35] font-bold self-end tracking-wider mt-auto">
            [AUDIO_ENGINE_ACTIVE]
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 pt-2 flex items-center justify-between text-[8px] font-mono text-white/40">
        <span>SPATIALIZATION: 3D ON</span>
        <span className="text-white/80">RENDER: 60FPS</span>
      </div>
    </div>
  );
}

function NQueenMockup() {
  return (
    <div className="relative w-full h-full bg-[#151515] rounded-xl overflow-hidden border border-white/5 flex flex-col justify-between p-4 group-hover:border-[#FF6B35]/25 transition-colors duration-500 animate-fade-in-up">
      <div className="flex justify-between items-center border-b border-white/5 pb-2 text-[9px] font-mono text-white/40">
        <span>ALGORITHM ENGINE // VISUALIZER</span>
        <span className="text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[7px] font-bold">SOLVED_RUN</span>
      </div>

      <div className="flex-grow flex items-center justify-center py-2.5">
        <div className="grid grid-cols-8 gap-0.5 border border-white/10 p-0.5 bg-[#101010] rounded-md">
          {Array.from({ length: 64 }).map((_, i) => {
            const row = Math.floor(i / 8);
            const col = i % 8;
            const isDark = (row + col) % 2 === 1;
            
            const solution = [0, 4, 7, 5, 2, 6, 1, 3];
            const hasQueen = solution[row] === col;
            const isConflictPath = (row === 2 && col === 2) || (row === 2 && col === 5);

            return (
              <div 
                key={i} 
                className={`w-5 h-5 sm:w-6.5 sm:h-6.5 flex items-center justify-center text-[10px] transition-all duration-300 ${
                  hasQueen 
                    ? "bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/30 shadow-[0_0_8px_rgba(255,107,53,0.15)]" 
                    : isConflictPath 
                    ? "bg-red-500/10"
                    : isDark 
                    ? "bg-white/5" 
                    : "bg-white/0"
                }`}
              >
                {hasQueen && (
                  <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3 6 6-1-4 5 3 6-8-3-8 3 3-6-4-5 6 1z"/>
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-white/5 pt-2 grid grid-cols-2 gap-2 text-[8px] font-mono text-white/40">
        <div>ITERATIONS: <span className="text-white/80 font-bold">1.4K</span></div>
        <div className="text-right">CALC: <span className="text-[#FF6B35] font-bold">0.82ms</span></div>
      </div>
    </div>
  );
}

function DesertAiMockup() {
  return (
    <div className="relative w-full h-full bg-[#151515] rounded-xl overflow-hidden border border-white/5 flex flex-col justify-between p-4 group-hover:border-[#FF6B35]/25 transition-colors duration-500 animate-fade-in-up">
      <div className="flex justify-between items-center border-b border-white/5 pb-2 text-[9px] font-mono text-white/40">
        <span>NEURAL_NET_MODEL // INFERENCE</span>
        <span className="text-[#FF6B35] font-bold">98.4% CONF</span>
      </div>

      <div className="flex-grow relative border border-white/5 rounded-lg my-2 bg-[#101010] overflow-hidden">
        {/* Left half: Satellite grid drawing */}
        <div className="absolute inset-y-0 left-0 w-1/2 border-r border-dashed border-white/25 flex flex-col justify-between p-2">
          <span className="text-[6px] font-mono text-white/30 uppercase">SAT_RGB_INPUT</span>
          
          <svg className="w-full h-2/3 text-white/10" viewBox="0 0 100 50">
            <path d="M 0,35 Q 25,10 55,25 T 100,5" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <path d="M 0,25 Q 35,20 65,10 T 100,2" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Right half: Neural segmentation mask */}
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[#FF6B35]/5 flex flex-col justify-between p-2">
          <span className="text-[6px] font-mono text-[#FF6B35]/70 uppercase text-right">SEGMENT_MASK</span>
          
          <svg className="w-full h-2/3 text-[#FF6B35]/30" viewBox="0 0 100 50">
            <path d="M 0,35 Q 25,10 55,25 T 100,5" fill="rgba(255,107,53,0.1)" stroke="#FF6B35" strokeWidth="1" />
            <circle cx="45" cy="18" r="6" fill="rgba(255,107,53,0.15)" stroke="#FF6B35" strokeWidth="0.5" strokeDasharray="1.5 1" />
          </svg>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#151515] border border-[#FF6B35]/30 rounded-full px-2 py-0.5 text-[7px] font-mono text-[#FF6B35] shadow-[0_0_8px_rgba(255,107,53,0.1)]">
          ONNX_IN_BROWSER
        </div>
      </div>

      <div className="border-t border-white/5 pt-2 flex items-center justify-between text-[8px] font-mono text-white/40">
        <span>MODEL: UNET-RGB</span>
        <span className="text-white/80">LATENCY: &lt; 12ms</span>
      </div>
    </div>
  );
}

function CampusAiMockup() {
  return (
    <div className="relative w-full h-full bg-[#151515] rounded-xl overflow-hidden border border-white/5 flex flex-col justify-between p-4 group-hover:border-[#FF6B35]/25 transition-colors duration-500 animate-fade-in-up">
      <div className="flex justify-between items-center border-b border-white/5 pb-2 text-[9px] font-mono text-white/40">
        <span>RAG_ORCHESTRATOR // PLATFORM</span>
        <span className="text-emerald-400 bg-emerald-500/10 px-1 rounded text-[7px]">AGENT_ONLINE</span>
      </div>

      <div className="flex-grow flex flex-col gap-1.5 my-2 overflow-hidden">
        {/* User bubble */}
        <div className="self-end bg-white/5 border border-white/5 rounded-lg rounded-tr-none px-2 py-1 max-w-[80%] flex flex-col">
          <span className="text-[6px] font-mono text-white/30 uppercase">STUDENT</span>
          <p className="text-[8px] text-white/80 leading-normal">Find a free study room in the main library.</p>
        </div>

        {/* Assistant bubble */}
        <div className="self-start bg-[#FF6B35]/10 border border-[#FF6B35]/20 rounded-lg rounded-tl-none px-2 py-1 max-w-[85%] flex flex-col">
          <span className="text-[6px] font-mono text-[#FF6B35] uppercase">CAMPUS_AI // RAG</span>
          <p className="text-[8px] text-white/80 leading-normal">Found Room 304 on Floor 3 available until 4:00 PM.</p>
        </div>
      </div>

      <div className="border-t border-white/5 pt-2 flex items-center justify-between text-[8px] font-mono text-white/40">
        <span>STORE: PINECODE VECTOR</span>
        <span className="text-white/80">RESPONSE: 240ms</span>
      </div>
    </div>
  );
}

// Projects Dataset
const PROJECTS = [
  {
    id: "bmw-m5",
    title: "BMW M5 Experience",
    category: "Landing Page",
    description: "An interactive, ultra-fast 3D landing page showcasing the BMW M5. Features a high-fidelity WebGL configurator allowing real-time color and rim changes, combined with fluid sports performance dashboards.",
    tech: ["React", "Three.js", "Tailwind CSS", "Vite"],
    highlights: [
      "Custom WebGL car chassis configurator",
      "Dynamic camera animation tracking sport modes",
      "Sub-2s page load with fully optimized asset compression"
    ],
    mockup: <BmwMockup />,
    gallery: ["/gallery/bmw-m5-1.png", "/gallery/bmw-m5-2.png", "/gallery/bmw-m5-3.png", "/gallery/bmw-m5-4.png", "/gallery/bmw-m5-5.png", "/gallery/bmw-m5-6.png", "/gallery/bmw-m5-7.png", "/gallery/bmw-m5-8.png", "/gallery/bmw-m5-9.png", "/gallery/bmw-m5-10.png"],
  },
  {
    id: "one-piece",
    title: "One Piece Experience",
    category: "Creative Website",
    description: "An immersive, cinematic story experience exploring the world of One Piece. Implements high-end motion design, spatialized HTML5 audio, canvas-based mapping paths, and rich GSAP timelines.",
    tech: ["Next.js", "Web Audio", "Canvas API", "GSAP"],
    highlights: [
      "Dynamic spatialized 3D background audio engine",
      "Interactive adventure paths plotted across canvas grids",
      "Complex custom image silhouette shader filters"
    ],
    mockup: <OnePieceMockup />,
    gallery: ["/gallery/one-piece-1.png", "/gallery/one-piece-2.png", "/gallery/one-piece-3.png", "/gallery/one-piece-4.png", "/gallery/one-piece-5.png"],
  },
  {
    id: "n-queen",
    title: "N-Queen Solver",
    category: "Algorithm Visualizer",
    description: "A highly visual algorithm workbench showcasing recursive backtracking for the classic N-Queens chess puzzle. Users can customize grid size, adjust backtracking speed, and analyze search path heatmaps.",
    tech: ["TypeScript", "HTML5 Canvas", "Tailwind CSS"],
    highlights: [
      "Step-by-step recursive search animation loops",
      "Live backtracking coordinate conflict highlighting",
      "Real-time speed throttling controls (1ms to 2s delay)"
    ],
    mockup: <NQueenMockup />,
    gallery: ["/gallery/n-queen-1.png", "/gallery/n-queen-2.png", "/gallery/n-queen-3.png", "/gallery/n-queen-4.png", "/gallery/n-queen-5.png"],
  },
  {
    id: "desert-ai",
    title: "Desert Image Segmentation AI",
    category: "Artificial Intelligence",
    description: "A client-side neural network application performing satellite terrain classification. Integrates a lightweight UNet model in ONNX runtime to classify sand, rock, and vegetation contours instantly in-browser.",
    tech: ["Python", "PyTorch", "ONNX Runtime", "React"],
    highlights: [
      "In-browser AI execution model with zero server costs",
      "Interactive split-slider comparing RGB input vs masks",
      "High efficiency inference with latency under 12ms"
    ],
    mockup: <DesertAiMockup />,
    gallery: ["/gallery/desert-ai-1.png", "/gallery/desert-ai-2.png", "/gallery/desert-ai-3.png"],
  },
  {
    id: "campus-assistant",
    title: "AI Campus Assistant",
    category: "AI Platform",
    description: "A comprehensive SaaS platform powering campus automation. Connects student requests to multi-agent orchestrations, querying Vector databases (RAG) to locate real-time resource availability.",
    tech: ["Next.js", "FastAPI", "VectorDB", "OpenAI API"],
    highlights: [
      "Intelligent multi-agent routing for campus API tools",
      "Vector search indexing library inventory & room bookings",
      "Streaming RAG completions with chat logs"
    ],
    mockup: <CampusAiMockup />,
    gallery: ["/gallery/campus-ai-1.png", "/gallery/campus-ai-2.png", "/gallery/campus-ai-3.png", "/gallery/campus-ai-4.png", "/gallery/campus-ai-5.png", "/gallery/campus-ai-6.png", "/gallery/campus-ai-7.png", "/gallery/campus-ai-8.png", "/gallery/campus-ai-9.png", "/gallery/campus-ai-10.png"],
  }
];

// Featured Work Section Component
function FeaturedWorkSection() {
  const [visibleProjects, setVisibleProjects] = useState<Record<string, boolean>>({});
  const projectRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Gallery modal state
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryIndex, setGalleryIndex] = useState(0);

  const openGallery = (images: string[], title: string) => {
    setGalleryImages(images);
    setGalleryTitle(title);
    setGalleryIndex(0);
    setGalleryOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeGallery = () => {
    setGalleryOpen(false);
    document.body.style.overflow = "";
  };

  const galleryPrev = () => setGalleryIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  const galleryNext = () => setGalleryIndex((prev) => (prev + 1) % galleryImages.length);

  // Keyboard navigation for gallery
  useEffect(() => {
    if (!galleryOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeGallery();
      if (e.key === "ArrowLeft") galleryPrev();
      if (e.key === "ArrowRight") galleryNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [galleryOpen, galleryImages.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-project-id");
            if (id) {
              setVisibleProjects((prev) => ({ ...prev, [id]: true }));
            }
          }
        });
      },
      { threshold: 0.10 }
    );

    Object.values(projectRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      Object.values(projectRefs.current).forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  return (
    <section
      id="work"
      className="relative min-h-screen bg-[#0A0A0A] px-6 py-28 sm:py-36 sm:px-12 md:px-24 border-t border-white/5 z-30"
    >
      {/* Title block */}
      <div className="flex flex-col md:flex-row gap-12 md:gap-24 mb-24">
        <div className="md:w-1/4 flex-shrink-0">
          <span className="text-white/40 text-xs font-mono tracking-[0.25em] font-semibold uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#FF6B35] rounded-full animate-pulse" />
            03 / Featured Work
          </span>
        </div>
        <div className="md:w-3/4">
          <h3 className="text-white font-sans text-3xl sm:text-5xl font-bold tracking-tight leading-[1.15] max-w-4xl uppercase">
            Things We've Built.
          </h3>
          <p className="text-white/50 text-sm sm:text-base leading-relaxed mt-4 max-w-2xl font-sans font-normal">
            A collection of websites, software solutions, and AI projects developed by the Phoenix Labs team to showcase our technical capabilities, design standards, and creative execution.
          </p>
        </div>
      </div>

      {/* Case studies list */}
      <div className="flex flex-col gap-24 md:gap-36 max-w-7xl mx-auto">
        {PROJECTS.map((proj, i) => {
          const isVisible = visibleProjects[proj.id];
          return (
            <div
              key={proj.id}
              ref={(el) => {
                projectRefs.current[proj.id] = el;
              }}
              data-project-id={proj.id}
              className={`flex flex-col ${
                i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"
              } gap-10 lg:gap-16 items-center transition-all duration-[1000ms] cubic-bezier(0.16, 1, 0.3, 1) transform ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
              }`}
            >
              {/* Visual Preview Container */}
              <div className="w-full lg:w-1/2 aspect-[16/10] bg-[#111111] border border-white/5 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden group shadow-[0_16px_36px_rgba(0,0,0,0.4)] hover:-translate-y-1.5 hover:border-[#FF6B35]/25 hover:shadow-[0_20px_48px_rgba(255,107,53,0.06)] transition-all duration-500">
                <div className="w-full h-full transform group-hover:scale-[1.02] transition-transform duration-700 ease-out">
                  {proj.mockup}
                </div>
              </div>

              {/* Content Area */}
              <div className="w-full lg:w-1/2 flex flex-col gap-5">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center">
                    <span className="px-2.5 py-0.5 text-[9px] tracking-wider font-mono font-bold uppercase border border-[#FF6B35]/30 bg-[#FF6B35]/10 text-[#FF6B35] rounded-md">
                      {proj.category}
                    </span>
                  </div>
                  <h4 className="text-white font-sans text-2xl sm:text-3xl font-bold tracking-tight uppercase leading-none mt-1">
                    {proj.title}
                  </h4>
                  <p className="text-white/60 text-xs sm:text-sm leading-relaxed font-sans mt-1">
                    {proj.description}
                  </p>
                </div>

                {/* Tech stack badges */}
                <div className="flex flex-wrap gap-1.5">
                  {proj.tech.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 text-[9px] font-mono border border-white/10 bg-white/5 rounded text-white/50 uppercase tracking-wider font-bold"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Key highlights */}
                <ul className="flex flex-col gap-2.5 border-t border-white/5 pt-5 mt-1">
                  {proj.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-start gap-2.5 text-xs text-white/55 font-sans leading-normal"
                    >
                      <span className="w-4 h-4 rounded-full bg-[#FF6B35]/10 border border-[#FF6B35]/30 flex items-center justify-center flex-shrink-0 text-[#FF6B35] mt-0.5">
                        <CheckCircle2 size={10} strokeWidth={3} />
                      </span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>

                {/* Single View Project CTA */}
                <div className="flex items-center gap-4 mt-3">
                  <button
                    onClick={() => openGallery(proj.gallery, proj.title)}
                    className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-[#FF6B35] hover:bg-[#ff804d] text-white text-[10px] font-sans font-bold uppercase rounded-md tracking-wider transition-all duration-200 active:scale-95 shadow-[0_4px_12px_rgba(255,107,53,0.15)] cursor-pointer"
                  >
                    View Project
                    <Search size={11} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========== GALLERY LIGHTBOX MODAL ========== */}
      {galleryOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={closeGallery}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

          {/* Modal Content */}
          <div
            className="relative z-10 flex flex-col items-center w-full max-w-5xl mx-4 sm:mx-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Title + Close */}
            <div className="w-full flex items-center justify-between mb-5">
              <div className="flex flex-col gap-1">
                <span className="text-[#FF6B35] text-[9px] font-mono tracking-widest uppercase font-bold">Project Gallery</span>
                <h4 className="text-white font-sans text-lg sm:text-xl font-bold tracking-tight uppercase leading-none">{galleryTitle}</h4>
              </div>
              <button
                onClick={closeGallery}
                className="w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 flex items-center justify-center text-white/60 hover:text-white transition-all duration-200 cursor-pointer"
                aria-label="Close gallery"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Main Image Display */}
            <div className="relative w-full aspect-[16/9] bg-[#111111]/80 border border-white/10 rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
              <img
                src={galleryImages[galleryIndex]}
                alt={`${galleryTitle} screenshot ${galleryIndex + 1}`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.classList.add('gallery-placeholder-active');
                }}
              />
              {/* Placeholder fallback shown when image fails to load */}
              <div className="gallery-placeholder absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/30 pointer-events-none">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white/15">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
                <span className="text-[10px] font-mono tracking-wider uppercase">Screenshot Coming Soon</span>
              </div>

              {/* Navigation Arrows */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={galleryPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-white/10 hover:bg-black/80 hover:border-white/25 flex items-center justify-center text-white/70 hover:text-white transition-all duration-200 backdrop-blur-sm cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    onClick={galleryNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-white/10 hover:bg-black/80 hover:border-white/25 flex items-center justify-center text-white/70 hover:text-white transition-all duration-200 backdrop-blur-sm cursor-pointer"
                    aria-label="Next image"
                  >
                    <ArrowRight size={16} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip + Counter */}
            <div className="w-full flex items-center justify-between mt-5">
              {/* Dot indicators */}
              <div className="flex items-center gap-2">
                {galleryImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setGalleryIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === galleryIndex
                        ? "bg-[#FF6B35] scale-125"
                        : "bg-white/20 hover:bg-white/40"
                    }`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Counter */}
              <span className="text-white/40 text-[10px] font-mono tracking-wider">
                {String(galleryIndex + 1).padStart(2, "0")} / {String(galleryImages.length).padStart(2, "0")}
              </span>

              {/* Keyboard hint */}
              <span className="text-white/20 text-[9px] font-mono tracking-wider uppercase hidden sm:block">
                ← → Navigate · ESC Close
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Gallery placeholder CSS */}
      <style>{`
        .gallery-placeholder { display: none; }
        .gallery-placeholder-active .gallery-placeholder { display: flex; }
      `}</style>
    </section>
  );
}

// ==========================================
// WHY PHOENIX LABS SECTION
// ==========================================

const FEATURES = [
  {
    id: "tech",
    title: "Modern Technology",
    description: "We use modern tools, frameworks, and best practices to create scalable digital products.",
    icon: <Cpu size={24} className="text-[#FF6B35]" />
  },
  {
    id: "perf",
    title: "Performance Focused",
    description: "Fast-loading, responsive experiences optimized for usability and growth.",
    icon: <Zap size={24} className="text-[#FF6B35]" />
  },
  {
    id: "custom",
    title: "Custom Built",
    description: "Every project is designed around client goals rather than relying on generic templates.",
    icon: <Layers size={24} className="text-[#FF6B35]" />
  },
  {
    id: "solvers",
    title: "Problem Solvers",
    description: "We approach projects as challenges to solve, not simply websites to build.",
    icon: <Puzzle size={24} className="text-[#FF6B35]" />
  },
  {
    id: "ai",
    title: "AI & Automation",
    description: "Experience working with machine learning, automation, and intelligent systems.",
    icon: <Brain size={24} className="text-[#FF6B35]" />
  },
  {
    id: "collab",
    title: "Collaborative Process",
    description: "Clients stay involved throughout planning, design, development, and launch.",
    icon: <Users size={24} className="text-[#FF6B35]" />
  }
];

function WhyPhoenixLabsSection() {
  const [glows, setGlows] = useState<Record<string, { x: string; y: string }>>({});
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
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  const handleMouseMove = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = `${e.clientX - rect.left}px`;
    const y = `${e.clientY - rect.top}px`;
    setGlows((prev) => ({ ...prev, [id]: { x, y } }));
  };

  return (
    <section
      ref={sectionRef}
      id="why-us"
      className="relative min-h-screen bg-[#0A0A0A] px-6 py-28 sm:py-36 sm:px-12 md:px-24 border-t border-white/5 z-30 flex flex-col justify-between"
    >
      {/* Header */}
      <div className={`flex flex-col md:flex-row gap-12 md:gap-24 mb-20 transition-all duration-1000 ease-out transform ${
        isIntersecting ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}>
        <div className="md:w-1/4 flex-shrink-0">
          <span className="text-white/40 text-xs font-mono tracking-[0.25em] font-semibold uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#FF6B35] rounded-full animate-pulse" />
            04 / Why Phoenix Labs
          </span>
        </div>
        <div className="md:w-3/4">
          <h3 className="text-white font-sans text-3xl sm:text-5xl font-bold tracking-tight leading-[1.15] max-w-4xl uppercase">
            Built by builders.
          </h3>
          <p className="text-white/50 text-sm sm:text-base leading-relaxed mt-4 max-w-2xl font-sans font-normal">
            We're not just designers or developers. We're a team that combines engineering, product thinking, creativity, and problem solving to build digital experiences that deliver real value.
          </p>
        </div>
      </div>

      {/* 3x2 Grid */}
      <div 
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full transition-all duration-1000 delay-200 ease-out transform ${
          isIntersecting ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        }`}
      >
        {FEATURES.map((feat) => {
          const glow = glows[feat.id] || { x: "50%", y: "50%" };
          return (
            <div
              key={feat.id}
              onMouseMove={(e) => handleMouseMove(feat.id, e)}
              className="bento-card group p-6 sm:p-8 flex flex-col justify-start gap-5 relative z-10 min-h-[220px]"
              style={{
                // @ts-expect-error Custom CSS variables
                "--mouse-x": glow.x,
                "--mouse-y": glow.y,
              }}
            >
              {/* Icon Container */}
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#FF6B35]/30 transition-colors duration-300">
                {feat.icon}
              </div>

              {/* Title & Description */}
              <div className="flex flex-col gap-2 relative z-10">
                <h4 className="text-white font-sans text-lg font-bold tracking-tight uppercase">
                  {feat.title}
                </h4>
                <p className="text-white/50 text-xs sm:text-sm leading-relaxed font-sans font-normal">
                  {feat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Statement */}
      <div 
        className={`w-full text-center mt-28 mb-4 max-w-4xl mx-auto transition-all duration-1000 delay-500 ease-out transform ${
          isIntersecting ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <p className="text-2xl sm:text-4xl md:text-5xl font-display uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#FF6B35]/80 select-none">
          "We build products we'd be proud to use ourselves."
        </p>
      </div>
    </section>
  );
}

// ==========================================
// OUR PROCESS SECTION
// ==========================================

const STEPS = [
  {
    title: "Discovery",
    description: "We learn about the project, business goals, target audience, and requirements.",
    deliverables: ["Project Scope", "Goals & Requirements", "Planning Session"],
    icon: <Search size={20} />
  },
  {
    title: "Strategy",
    description: "We define the structure, user flow, and technical approach before any development begins.",
    deliverables: ["Wireframes", "Technical Planning", "Roadmap"],
    icon: <Map size={20} />
  },
  {
    title: "Design",
    description: "We create polished interfaces focused on usability, clarity, and visual impact.",
    deliverables: ["UI Design", "Design System", "Interactive Prototypes"],
    icon: <Palette size={20} />
  },
  {
    title: "Development",
    description: "The product is built using modern technologies with performance and scalability in mind.",
    deliverables: ["Frontend Dev", "Backend Dev", "QA Testing"],
    icon: <Code2 size={20} />
  },
  {
    title: "Launch",
    description: "After testing and optimization, the project is deployed and made available to users.",
    deliverables: ["Deployment", "Optimization", "Documentation"],
    icon: <Rocket size={20} />
  }
];

function OurProcessSection() {
  const [glows, setGlows] = useState<Record<number, { x: string; y: string }>>({});
  const [yPositions, setYPositions] = useState<number[]>([]);
  const [pathD, setPathD] = useState("");
  const [centerX, setCenterX] = useState(0);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [isIntersecting, setIsIntersecting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const fillPathRef = useRef<SVGPathElement>(null);
  const phoenixRef = useRef<SVGGElement>(null);
  const bgPhoenixRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const updateTimelineLayout = () => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const width = containerRect.width;
    const isMobileView = window.innerWidth < 768; // md breakpoint is 768px
    const cX = isMobileView ? 16 : width / 2;
    const sway = isMobileView ? 0 : 50;

    setCenterX(cX);

    const positions = STEPS.map((_, idx) => {
      const el = stepRefs.current[idx];
      if (!el) return 0;
      const elRect = el.getBoundingClientRect();
      return elRect.top - containerRect.top + elRect.height / 2;
    });

    setYPositions(positions);

    if (positions.length > 0) {
      const d = `M ${cX} 0 L ${cX} ${positions[0]} ` +
        positions.slice(0, -1).map((y, idx) => {
          const nextY = positions[idx + 1];
          const dy = nextY - y;
          const peakX = cX + (idx % 2 === 0 ? -sway : sway);
          return `C ${peakX} ${y + dy/3}, ${peakX} ${nextY - dy/3}, ${cX} ${nextY}`;
        }).join(" ") + ` L ${cX} ${containerRect.height}`;
      setPathD(d);
    }
  };

  useEffect(() => {
    updateTimelineLayout();
    
    // Multiple delayed updates to ensure layout settles after images/fonts finish rendering
    const t1 = setTimeout(updateTimelineLayout, 100);
    const t2 = setTimeout(updateTimelineLayout, 500);

    const handleResize = () => {
      updateTimelineLayout();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    const sectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) sectionObserver.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) sectionObserver.unobserve(sectionRef.current);
    };
  }, []);

  useEffect(() => {
    if (yPositions.length === 0 || !pathD) return;

    const handleScroll = () => {
      const container = containerRef.current;
      const path = pathRef.current;
      const fillPath = fillPathRef.current;
      const phoenix = phoenixRef.current;
      const bgPhoenix = bgPhoenixRef.current;
      if (!container || !path || !fillPath || !phoenix) return;

      const containerRect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Animation triggers when top of timeline crosses center of the screen
      const threshold = windowHeight / 2;
      const totalHeight = containerRect.height;
      const progressStart = threshold - containerRect.top;
      let progress = progressStart / totalHeight;
      progress = Math.max(0, Math.min(1, progress));

      const pathLength = path.getTotalLength();
      if (pathLength === 0) return;

      // Update active stroke glow progression
      const fillOffset = pathLength - progress * pathLength;
      fillPath.style.strokeDasharray = `${pathLength}`;
      fillPath.style.strokeDashoffset = `${fillOffset}`;
      // Move Phoenix marker along the Bezier SVG curve
      const point = path.getPointAtLength(progress * pathLength);
      phoenix.style.transform = `translate(${point.x}px, ${point.y}px)`;

      // Update background phoenix position to track straight down the timeline path axis (no horizontal side drift)
      if (bgPhoenix) {
        const scrollY = point.y;

        // Set high-performance 3D translate keeping X locked to center
        bgPhoenix.style.transform = `translate3d(-50%, ${scrollY}px, 0)`;

        // Gradually fade in at start, fade out near the launch step
        let opacity = 0.12;
        if (progress < 0.15) {
          opacity = (progress / 0.15) * 0.12;
        } else if (progress > 0.85) {
          opacity = ((1.0 - progress) / 0.15) * 0.12;
        }
        bgPhoenix.style.opacity = `${opacity}`;

        // Linear-gradient reveal mask bound to current traveling phoenix position + buffer
        const revealY = point.y + 120;
        bgPhoenix.style.setProperty("--reveal-y", `${revealY}px`);
      }

      // Determine the currently active step (closest step reached by phoenix)
      let newActiveStep = -1;
      yPositions.forEach((y, idx) => {
        if (point.y >= y - 15) {
          newActiveStep = idx;
        }
      });

      setActiveStep(newActiveStep);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [yPositions, pathD]);

  const handleMouseMove = (idx: number, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = `${e.clientX - rect.left}px`;
    const y = `${e.clientY - rect.top}px`;
    setGlows((prev) => ({ ...prev, [idx]: { x, y } }));
  };

  return (
    <section
      ref={sectionRef}
      id="process"
      className="relative min-h-screen bg-[#0A0A0A] px-6 py-28 sm:py-36 sm:px-12 md:px-24 border-t border-white/5 z-30 overflow-hidden"
    >
      {/* Self-contained styling keyframes for wing sway and float parallax */}
      <style>{`
        @keyframes bgFloat {
          0% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(-1deg); }
        }
        @keyframes leftPlumeFlap {
          0% { transform: rotate(-2deg); }
          100% { transform: rotate(2deg); }
        }
        @keyframes rightPlumeFlap {
          0% { transform: rotate(2deg); }
          100% { transform: rotate(-2deg); }
        }
        @keyframes radialBreathe {
          0% { transform: scale(0.75); opacity: 0.03; }
          50% { transform: scale(0.95); opacity: 0.07; }
          100% { transform: scale(0.75); opacity: 0.03; }
        }
        @keyframes emberDrift1 {
          0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
          20% { opacity: 0.25; }
          100% { transform: translate(-30px, -150px) scale(1); opacity: 0; }
        }
        @keyframes emberDrift2 {
          0% { transform: translate(0, 0) scale(0.8); opacity: 0; }
          15% { opacity: 0.3; }
          100% { transform: translate(40px, -180px) scale(0.5); opacity: 0; }
        }
        @keyframes emberDrift3 {
          0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
          30% { opacity: 0.2; }
          100% { transform: translate(-20px, -160px) scale(1.2); opacity: 0; }
        }
        @keyframes emberDrift4 {
          0% { transform: translate(0, 0) scale(0.7); opacity: 0; }
          25% { opacity: 0.25; }
          100% { transform: translate(25px, -170px) scale(0.4); opacity: 0; }
        }
      `}</style>

      {/* Header */}
      <div className={`flex flex-col md:flex-row gap-12 md:gap-24 mb-24 transition-all duration-1000 ease-out transform ${
        isIntersecting ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}>
        <div className="md:w-1/4 flex-shrink-0">
          <span className="text-white/40 text-xs font-mono tracking-[0.25em] font-semibold uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#FF6B35] rounded-full animate-pulse" />
            05 / Our Process
          </span>
        </div>
        <div className="md:w-3/4">
          <h3 className="text-white font-sans text-3xl sm:text-5xl font-bold tracking-tight leading-[1.15] max-w-4xl uppercase">
            From idea to launch.
          </h3>
          <p className="text-white/50 text-sm sm:text-base leading-relaxed mt-4 max-w-2xl font-sans font-normal">
            A clear and collaborative process designed to turn ideas into high-quality digital products.
          </p>
        </div>
      </div>

      {/* Timeline wrapper */}
      <div ref={containerRef} className="relative max-w-5xl mx-auto mt-20">

        {/* Background Phoenix Silhouette (Moved inside timeline wrapper for accurate scroll-tracking and flying illusion) */}
        <div
          ref={bgPhoenixRef}
          className="absolute left-1/2 -translate-x-1/2 w-full max-w-[580px] pointer-events-none z-0 hidden sm:block"
          style={{
            aspectRatio: "1/1",
            top: "-290px", // Align center vertically to path start (where y=0 is)
            willChange: "transform",
            opacity: 0,
            maskImage: "linear-gradient(to bottom, black 0px, black var(--reveal-y, 0px), transparent var(--reveal-y, 100px))",
            WebkitMaskImage: "linear-gradient(to bottom, black 0px, black var(--reveal-y, 0px), transparent var(--reveal-y, 100px))",
          }}
        >
          {/* Soft Background Ambient Radial Glow */}
          <div
            className="absolute inset-0 bg-[#FF6B35] rounded-full blur-[80px] pointer-events-none"
            style={{
              animation: "radialBreathe 4.5s ease-in-out infinite",
            }}
          />

          {/* Flying/Floating SVG container */}
          <div className="w-full h-full relative z-10" style={{ animation: "bgFloat 10s ease-in-out infinite" }}>
            <svg className="w-full h-full text-[#FF6B35]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="phoenix-bg-grad" x1="100" y1="20" x2="100" y2="190" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FF6B35" />
                  <stop offset="1" stopColor="#FF8A4C" stopOpacity="0.4" />
                </linearGradient>
                <filter id="bg-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="6" result="blur">
                    <animate attributeName="stdDeviation" values="4;8;4" dur="4.5s" repeatCount="indefinite" />
                  </feGaussianBlur>
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g filter="url(#bg-glow)" fill="url(#phoenix-bg-grad)" transform="rotate(180, 100, 100)">
                <animate attributeName="opacity" values="0.75;1;0.75" dur="4.5s" repeatCount="indefinite" />
                
                {/* Torso / Body */}
                <polygon points="100,60 110,85 100,140 90,85" />

                {/* Head Crest */}
                <polygon points="100,30 106,45 100,55 94,45" />
                <polygon points="100,18 103,28 100,33 97,28" />

                {/* Left Plumes (Grouped for animated flap rotation) */}
                <g style={{ transformOrigin: "90px 85px", animation: "leftPlumeFlap 5s ease-in-out infinite alternate" }}>
                  <polygon points="90,85 25,50 60,95" />
                  <polygon points="90,75 35,40 65,70" />
                  <polygon points="90,95 40,75 70,105" />
                </g>

                {/* Right Plumes (Grouped for animated flap rotation) */}
                <g style={{ transformOrigin: "110px 85px", animation: "rightPlumeFlap 5s ease-in-out infinite alternate" }}>
                  <polygon points="110,85 175,50 140,95" />
                  <polygon points="110,75 165,40 135,70" />
                  <polygon points="110,95 160,75 130,105" />
                </g>

                {/* Tail Shards */}
                <polygon points="100,140 103,185 100,200 97,185" />
                <polygon points="95,135 90,175 95,165" />
                <polygon points="105,135 110,175 105,165" />
              </g>
            </svg>
 
            {/* Ember Particles drifting in the wake */}
            {[
              { x: "-10px", y: "120px", size: "4px", anim: "emberDrift1", dur: "5.2s", delay: "0s" },
              { x: "15px", y: "140px", size: "3px", anim: "emberDrift2", dur: "6.1s", delay: "1.5s" },
              { x: "-5px", y: "100px", size: "5px", anim: "emberDrift3", dur: "7.0s", delay: "3.2s" },
              { x: "20px", y: "110px", size: "4px", anim: "emberDrift4", dur: "5.5s", delay: "0.8s" },
              { x: "-18px", y: "130px", size: "3px", anim: "emberDrift1", dur: "6.7s", delay: "2.4s" },
              { x: "8px", y: "150px", size: "4.5px", anim: "emberDrift2", dur: "4.9s", delay: "4.1s" },
            ].map((p, pIdx) => (
              <div
                key={pIdx}
                className="absolute rounded-full bg-[#FF6B35] blur-[1px] pointer-events-none"
                style={{
                  left: `calc(50% + ${p.x})`,
                  top: p.y,
                  width: p.size,
                  height: p.size,
                  animation: `${p.anim} ${p.dur} infinite linear`,
                  animationDelay: p.delay,
                }}
              />
            ))}
          </div>
        </div>

        {/* SVG Curved Timeline Path Layer */}
        {pathD && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ minHeight: "100%" }}>
            <defs>
              <filter id="phoenix-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background path (Dim guide) */}
            <path
              ref={pathRef}
              d={pathD}
              fill="none"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="2"
            />

            {/* Foreground path (Glowing filled orange timeline) */}
            <path
              ref={fillPathRef}
              d={pathD}
              fill="none"
              stroke="#FF6B35"
              strokeWidth="2"
              strokeLinecap="round"
              style={{
                transition: "stroke-dashoffset 80ms linear",
              }}
            />

            {/* SVG circle nodes situated exactly on path coordinates */}
            {yPositions.map((y, idx) => {
              const isActivated = activeStep >= idx;
              const isCurrent = activeStep === idx;
              return (
                <g key={idx}>
                  {/* Energy ripple burst on active node */}
                  {isCurrent && (
                    <circle
                      cx={centerX}
                      cy={y}
                      r={18}
                      className="fill-[#FF6B35]/15 stroke-none animate-ping pointer-events-none"
                      style={{
                        animationDuration: "1.6s",
                        transformOrigin: `${centerX}px ${y}px`,
                      }}
                    />
                  )}
                  {/* Base Circle */}
                  <circle
                    cx={centerX}
                    cy={y}
                    r={isCurrent ? 6 : isActivated ? 4.5 : 4.5}
                    className="transition-all duration-[400ms] ease-out"
                    style={{
                      fill: isCurrent ? "#FF6B35" : isActivated ? "#FF6B35" : "#1c1c1c",
                      stroke: isCurrent ? "rgba(255, 107, 53, 0.4)" : isActivated ? "rgba(255, 107, 53, 0.2)" : "rgba(255, 255, 255, 0.1)",
                      strokeWidth: isCurrent ? "6px" : isActivated ? "4px" : "2px",
                    }}
                  />
                </g>
              );
            })}

            {/* Traveling Phoenix Geometric Symbol */}
            <g
              ref={phoenixRef}
              filter="url(#phoenix-glow)"
              style={{
                willChange: "transform",
                transition: "transform 100ms cubic-bezier(0.1, 0.8, 0.2, 1)",
              }}
            >
              <path
                d="M 0,-8 L 3,-1 L 10,-5 L 5,2 L 0,6 L -5,2 L -10,-5 L -3,-1 Z"
                fill="#FF6B35"
              />
            </g>
          </svg>
        )}

        {/* Steps mapping */}
        {STEPS.map((step, idx) => {
          const isLeft = idx % 2 === 0;
          const isActivated = activeStep >= idx;
          const isCurrent = activeStep === idx;
          const glow = glows[idx] || { x: "50%", y: "50%" };

          return (
            <div
              key={step.title}
              ref={(el) => {
                stepRefs.current[idx] = el;
              }}
              data-step-idx={idx}
              className={`relative flex flex-col md:flex-row ${
                isLeft ? "md:justify-start" : "md:justify-end"
              } items-start md:items-center w-full mb-16 md:mb-24 transition-all duration-[600ms] cubic-bezier(0.16, 1, 0.3, 1) transform ${
                isCurrent 
                  ? "scale-[1.015] opacity-100" 
                  : isActivated 
                  ? "scale-100 opacity-90"
                  : "scale-[0.98] opacity-40"
              }`}
            >
              {/* Card Container */}
              <div className="w-full md:w-[44%] pl-12 md:pl-0 z-20">
                <div
                  onMouseMove={(e) => handleMouseMove(idx, e)}
                  className={`bento-card group p-6 sm:p-8 flex flex-col gap-5 relative transition-all duration-[500ms] cursor-default ${
                    isCurrent 
                      ? "border-[#FF6B35]/40 shadow-[0_0_24px_rgba(255,107,53,0.08)] bg-[#111111]/90" 
                      : isActivated 
                      ? "border-white/10 bg-[#111111]/80"
                      : "border-white/5 bg-[#111111]/30"
                  }`}
                  style={{
                    // @ts-expect-error Custom CSS variables
                    "--mouse-x": glow.x,
                    "--mouse-y": glow.y,
                  }}
                >
                  {/* Card Header (Icon & Step title) */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#FF6B35] group-hover:border-[#FF6B35]/30 transition-colors duration-300">
                      {step.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#FF6B35] text-[9px] font-mono tracking-widest uppercase font-bold">
                        STEP 0{idx + 1}
                      </span>
                      <h4 className="text-white font-sans text-lg font-bold tracking-tight uppercase leading-none mt-1">
                        {step.title}
                      </h4>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-white/50 text-xs sm:text-sm leading-relaxed font-sans font-normal">
                    {step.description}
                  </p>

                  {/* Deliverables List */}
                  <div className="flex flex-col gap-2.5 border-t border-white/5 pt-4 mt-1">
                    <span className="text-white/35 text-[9px] font-mono tracking-wider uppercase font-bold">
                      DELIVERABLES // KEY_OUTPUTS
                    </span>
                    <ul className="flex flex-col gap-2">
                      {step.deliverables.map((del) => (
                        <li key={del} className="flex items-center gap-2 text-[10px] text-white/70 font-sans font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]/60 flex-shrink-0" />
                          {del}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA Block */}
      <div 
        className={`w-full text-center mt-28 mb-4 max-w-2xl mx-auto flex flex-col items-center gap-6 transition-all duration-1000 delay-500 ease-out transform ${
          isIntersecting ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <p className="text-xl sm:text-3xl font-display uppercase tracking-tight text-white select-none">
          "Every great product starts with a conversation."
        </p>
        <a 
          href="#contact" 
          className="group inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#FF6B35] to-[#ff804d] hover:brightness-110 text-white text-xs font-sans font-bold uppercase rounded-md tracking-widest transition-all duration-200 active:scale-95 shadow-[0_4px_20px_rgba(255,107,53,0.2)]"
        >
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
        </a>
      </div>
    </section>
  );
}

// ==========================================
// ANIMATED COUNTER COMPONENT
// ==========================================
function AnimatedCounter({ value, formatter }: { value: number; formatter: (val: number) => string }) {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;
    
    const duration = 400; // ms
    const startTime = performance.now();
    
    let animationFrameId: number;
    
    const updateNumber = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress * (2 - progress); // easeOutQuad
      const current = Math.round(start + (end - start) * easeProgress);
      setDisplayValue(current);
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateNumber);
      }
    };
    
    animationFrameId = requestAnimationFrame(updateNumber);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);
  
  return <span>{formatter(displayValue)}</span>;
}

// ==========================================
// PROJECT ESTIMATOR SECTION
// ==========================================
function ProjectEstimatorSection() {
  const [projectType, setProjectType] = useState<"landing" | "website" | "app" | "saas">("website");
  const [pages, setPages] = useState(5);
  const [timeline, setTimeline] = useState<"flexible" | "standard" | "priority">("standard");
  const [features, setFeatures] = useState<string[]>([]);
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  const sectionRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  const toggleFeature = (featId: string) => {
    setFeatures((prev) =>
      prev.includes(featId) ? prev.filter((id) => id !== featId) : [...prev, featId]
    );
  };

  const getEstimation = () => {
    let basePrice = 35000;
    let baseWeeks = 2.5;
    let baseComplexity = "Medium";
    let pageCost = 3500;
    let basePagesIncluded = 5;

    switch (projectType) {
      case "landing":
        basePrice = 15000;
        baseWeeks = 1.5;
        baseComplexity = "Low";
        pageCost = 2000;
        basePagesIncluded = 1;
        break;
      case "website":
        basePrice = 35000;
        baseWeeks = 2.5;
        baseComplexity = "Medium";
        pageCost = 3500;
        basePagesIncluded = 5;
        break;
      case "app":
        basePrice = 75000;
        baseWeeks = 5;
        baseComplexity = "High";
        pageCost = 5000;
        basePagesIncluded = 5;
        break;
      case "saas":
        basePrice = 120000;
        baseWeeks = 8;
        baseComplexity = "Premium";
        pageCost = 8000;
        basePagesIncluded = 5;
        break;
    }

    const extraPages = Math.max(0, pages - basePagesIncluded);
    const pagesCostTotal = extraPages * pageCost;

    let featuresCostTotal = 0;
    let featuresWeeksTotal = 0;

    if (features.includes("auth")) {
      featuresCostTotal += 10000;
      featuresWeeksTotal += 0.5;
    }
    if (features.includes("payment")) {
      featuresCostTotal += 12000;
      featuresWeeksTotal += 0.5;
    }
    if (features.includes("admin")) {
      featuresCostTotal += 20000;
      featuresWeeksTotal += 1.0;
    }
    if (features.includes("ai")) {
      featuresCostTotal += 30000;
      featuresWeeksTotal += 1.5;
    }
    if (features.includes("animations")) {
      featuresCostTotal += 10000;
      featuresWeeksTotal += 0.5;
    }
    if (features.includes("api")) {
      featuresCostTotal += 15000;
      featuresWeeksTotal += 1.0;
    }

    let priceMultiplier = 1.0;
    let weeksMultiplier = 1.0;

    if (timeline === "flexible") {
      priceMultiplier = 0.9;
      weeksMultiplier = 1.35;
    } else if (timeline === "priority") {
      priceMultiplier = 1.25;
      weeksMultiplier = 0.7;
    }

    const totalPrice = (basePrice + pagesCostTotal + featuresCostTotal) * priceMultiplier;
    const totalWeeks = (baseWeeks + featuresWeeksTotal) * weeksMultiplier;

    let complexity = baseComplexity;
    if (totalPrice >= 180000) {
      complexity = "Premium";
    } else if (totalPrice >= 95000) {
      complexity = "High";
    } else if (totalPrice >= 45000) {
      complexity = "Medium";
    } else {
      complexity = "Low";
    }

    const minPrice = Math.round((totalPrice * 0.85) / 1000) * 1000;
    const maxPrice = Math.round((totalPrice * 1.15) / 1000) * 1000;

    const minWeeks = Math.max(1, Math.round(totalWeeks * 0.8));
    const maxWeeks = Math.round(totalWeeks * 1.2);

    return {
      complexity,
      minPrice,
      maxPrice,
      minWeeks,
      maxWeeks,
    };
  };

  const { complexity, minPrice, maxPrice, minWeeks, maxWeeks } = getEstimation();
  const formatCurrency = (val: number) => "₹" + val.toLocaleString("en-IN");

  const projectTypes = [
    { id: "landing", label: "Landing Page", desc: "A high-converting single-page experience.", icon: <Globe size={18} /> },
    { id: "website", label: "Business Website", desc: "Multi-page custom brand showcase website.", icon: <Layers size={18} /> },
    { id: "app", label: "Web Application", desc: "Dynamic, interactive dashboard-driven product.", icon: <Code2 size={18} /> },
    { id: "saas", label: "SaaS Platform", desc: "Multi-tenant cloud app with database & billing.", icon: <Server size={18} /> },
  ] as const;

  const featureOptions = [
    { id: "auth", label: "Authentication", desc: "Secure email & social logins with user roles", icon: <ShieldCheck size={16} /> },
    { id: "payment", label: "Payment Gateway", desc: "Stripe subscription billing & checkouts", icon: <Zap size={16} /> },
    { id: "admin", label: "Admin Dashboard", desc: "Data insights, user controls & metrics", icon: <TrendingUp size={16} /> },
    { id: "ai", label: "AI Integration", desc: "OpenAI pipelines, smart chat & vectors", icon: <Brain size={16} /> },
    { id: "animations", label: "Animations", desc: "Premium transitions, scroll motion & WebGL", icon: <Palette size={16} /> },
    { id: "api", label: "API & Sync", desc: "Custom webhooks, third-party integrations", icon: <Puzzle size={16} /> },
  ] as const;

  const complexityPill = (comp: string) => {
    switch (comp) {
      case "Low":
        return <span className="px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Low</span>;
      case "Medium":
        return <span className="px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Medium</span>;
      case "High":
        return <span className="px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase font-bold rounded-full bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/20">High</span>;
      case "Premium":
        return <span className="px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase font-bold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">Premium</span>;
      default:
        return null;
    }
  };

  return (
    <section
      ref={sectionRef}
      id="estimator"
      className="relative min-h-screen bg-[#0A0A0A] px-6 py-28 sm:py-36 sm:px-12 md:px-24 border-t border-white/5 z-30"
    >
      {/* Header */}
      <div className={`flex flex-col md:flex-row gap-12 md:gap-24 mb-20 transition-all duration-1000 ease-out transform ${
        isIntersecting ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}>
        <div className="md:w-1/4 flex-shrink-0">
          <span className="text-white/40 text-xs font-mono tracking-[0.25em] font-semibold uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#FF6B35] rounded-full animate-pulse" />
            06 / Project Estimator
          </span>
        </div>
        <div className="md:w-3/4">
          <h3 className="text-white font-sans text-3xl sm:text-5xl font-bold tracking-tight leading-[1.15] max-w-4xl uppercase">
            Estimate your project.
          </h3>
          <p className="text-white/50 text-sm sm:text-base leading-relaxed mt-4 max-w-2xl font-sans font-normal">
            Get a rough estimate for your website, web app, or SaaS project in seconds.
          </p>
        </div>
      </div>

      {/* Main Grid Wrapper */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 mt-12 transition-all duration-1000 delay-200 ease-out transform ${
        isIntersecting ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}>
        {/* Left Column: Configuration Controls (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          
          {/* Step 1: Project Type */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[#FF6B35]">
              <span className="text-[10px] font-mono border border-[#FF6B35]/30 px-2 py-0.5 rounded-md uppercase font-bold tracking-wider">Step 1</span>
              <h4 className="text-white font-sans text-sm font-bold uppercase tracking-wider">Select Project Type</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projectTypes.map((type) => {
                const isActive = projectType === type.id;
                return (
                  <div
                    key={type.id}
                    onClick={() => {
                      setProjectType(type.id);
                      // Reset page counts to sensible defaults
                      if (type.id === "landing") setPages(1);
                      else setPages(5);
                    }}
                    className={`p-5 rounded-xl border flex flex-col gap-3 transition-all duration-[400ms] cursor-pointer relative overflow-hidden group ${
                      isActive
                        ? "border-[#FF6B35] bg-[#111111]/90 shadow-[0_0_24px_rgba(255,107,53,0.06)]"
                        : "border-white/5 bg-[#111111]/30 hover:border-white/10 hover:bg-[#111111]/50"
                    }`}
                  >
                    {/* Glowing highlight reflection */}
                    <div className={`absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FF6B35] to-transparent transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0"}`} />
                    
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 ${
                        isActive ? "bg-[#FF6B35]/15 border-[#FF6B35]/40 text-[#FF6B35]" : "bg-white/5 border-white/10 text-white/50"
                      }`}>
                        {type.icon}
                      </div>
                      <span className={`text-sm font-sans font-bold transition-colors duration-300 ${isActive ? "text-white" : "text-white/80 group-hover:text-white"}`}>
                        {type.label}
                      </span>
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed font-sans font-normal pr-4">
                      {type.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Screen Count Slider */}
          <div className="flex flex-col gap-4 border-t border-white/5 pt-8">
            <div className="flex items-center gap-2 text-[#FF6B35]">
              <span className="text-[10px] font-mono border border-[#FF6B35]/30 px-2 py-0.5 rounded-md uppercase font-bold tracking-wider">Step 2</span>
              <h4 className="text-white font-sans text-sm font-bold uppercase tracking-wider">Estimated Number of Pages / Screens</h4>
            </div>
            
            <div className="bg-[#111111]/30 border border-white/5 p-6 rounded-xl flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-xs font-mono uppercase tracking-wider">Pages / Screens count</span>
                <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/30 px-3 py-1 rounded-lg">
                  <span className="text-[#FF6B35] text-sm font-mono font-bold">{pages}</span>
                </div>
              </div>
              
              <div className="relative flex items-center py-2">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={pages}
                  onChange={(e) => setPages(parseInt(e.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-white/5 outline-none accent-[#FF6B35] transition-all duration-200"
                  style={{
                    background: `linear-gradient(to right, #FF6B35 0%, #FF6B35 ${(pages - 1) / 19 * 100}%, rgba(255, 255, 255, 0.05) ${(pages - 1) / 19 * 100}%, rgba(255, 255, 255, 0.05) 100%)`
                  }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-white/30 font-mono uppercase">
                <span>01 (Simple/Single Page)</span>
                <span>20 (Complex Application)</span>
              </div>
            </div>
          </div>

          {/* Step 3: Project Timeline Urgency */}
          <div className="flex flex-col gap-4 border-t border-white/5 pt-8">
            <div className="flex items-center gap-2 text-[#FF6B35]">
              <span className="text-[10px] font-mono border border-[#FF6B35]/30 px-2 py-0.5 rounded-md uppercase font-bold tracking-wider">Step 3</span>
              <h4 className="text-white font-sans text-sm font-bold uppercase tracking-wider">Timeline Flexibility</h4>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-[#111111]/30 p-2 rounded-xl border border-white/5">
              {[
                { id: "flexible", label: "Flexible", desc: "Discounted rate, longer window", labelSm: "Relaxed" },
                { id: "standard", label: "Standard", desc: "Balanced timing & price", labelSm: "Normal" },
                { id: "priority", label: "Priority", desc: "Fast-tracked rush delivery (+25%)", labelSm: "Expedited" }
              ].map((t) => {
                const isActive = timeline === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTimeline(t.id as any)}
                    className={`py-3.5 px-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-all duration-[350ms] border outline-none ${
                      isActive
                        ? "bg-[#FF6B35] border-[#FF6B35] text-white shadow-[0_4px_16px_rgba(255,107,53,0.15)] scale-[1.01]"
                        : "bg-transparent border-transparent text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className="text-[11px] font-bold font-sans uppercase tracking-wider leading-none">{t.label}</span>
                    <span className={`text-[8px] sm:text-[9px] text-center font-medium leading-none hidden sm:inline mt-0.5 ${isActive ? "text-white/80" : "text-white/40"}`}>{t.desc}</span>
                    <span className={`text-[8px] font-medium leading-none sm:hidden mt-0.5 ${isActive ? "text-white/80" : "text-white/40"}`}>{t.labelSm}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Toggle Features */}
          <div className="flex flex-col gap-4 border-t border-white/5 pt-8">
            <div className="flex items-center gap-2 text-[#FF6B35]">
              <span className="text-[10px] font-mono border border-[#FF6B35]/30 px-2 py-0.5 rounded-md uppercase font-bold tracking-wider">Step 4</span>
              <h4 className="text-white font-sans text-sm font-bold uppercase tracking-wider">Select Add-on Features</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {featureOptions.map((feat) => {
                const isActive = features.includes(feat.id);
                return (
                  <div
                    key={feat.id}
                    onClick={() => toggleFeature(feat.id)}
                    className={`p-4 rounded-xl border flex flex-col gap-3.5 transition-all duration-[400ms] cursor-pointer relative overflow-hidden group select-none ${
                      isActive
                        ? "border-[#FF6B35] bg-[#111111]/90 shadow-[0_0_20px_rgba(255,107,53,0.06)]"
                        : "border-white/5 bg-[#111111]/30 hover:border-white/10 hover:bg-[#111111]/50"
                    }`}
                  >
                    {/* Top Glow bar */}
                    <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF6B35] to-transparent transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0"}`} />

                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 ${
                        isActive ? "bg-[#FF6B35]/15 border-[#FF6B35]/40 text-[#FF6B35]" : "bg-white/5 border-white/10 text-white/50"
                      }`}>
                        {feat.icon}
                      </div>
                      <span className={`text-[13px] font-sans font-bold transition-colors duration-300 ${isActive ? "text-white" : "text-white/80 group-hover:text-white"}`}>
                        {feat.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/40 leading-relaxed font-sans font-normal">
                      {feat.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Estimate Panel (4 cols) */}
        <div className="lg:col-span-4 lg:relative">
          <div className="lg:sticky lg:top-32 flex flex-col gap-6">
            
            {/* Live Output Panel Card */}
            <div className="w-full bg-[#111111]/80 border border-white/10 p-6 sm:p-8 rounded-2xl flex flex-col gap-7 backdrop-blur-md relative overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
              {/* Stripe-style Top Glow line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF6B35] to-transparent" />
              
              <div className="flex flex-col gap-1.5">
                <span className="text-[#FF6B35] text-[9px] font-mono tracking-widest uppercase font-bold">Live Estimate</span>
                <h4 className="text-white font-sans text-xl font-bold tracking-tight uppercase leading-none">Project Summary</h4>
              </div>

              {/* Configurations Summary list */}
              <div className="flex flex-col gap-3.5 border-b border-white/5 pb-6">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40 font-sans">Type:</span>
                  <span className="text-white/95 font-sans font-bold capitalize">{projectType}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40 font-sans">Screens:</span>
                  <span className="text-white/95 font-sans font-bold">{pages} {pages === 1 ? "Page" : "Pages"}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40 font-sans">Delivery:</span>
                  <span className="text-white/95 font-sans font-bold capitalize">{timeline}</span>
                </div>
                <div className="flex justify-between items-start text-xs">
                  <span className="text-white/40 font-sans mt-0.5">Features:</span>
                  <span className="text-white/95 font-sans font-bold text-right max-w-[70%] truncate block">
                    {features.length === 0 ? "None Selected" : `${features.length} Add-on${features.length === 1 ? "" : "s"}`}
                  </span>
                </div>
              </div>

              {/* Estimation displays */}
              <div className="flex flex-col gap-6">
                
                {/* Complexity display */}
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-xs font-mono uppercase tracking-wider">Complexity</span>
                  {complexityPill(complexity)}
                </div>

                {/* Timeline display */}
                <div className="flex justify-between items-center border-t border-white/5 pt-4">
                  <span className="text-white/50 text-xs font-mono uppercase tracking-wider">Timeline</span>
                  <span className="text-white font-sans text-sm font-bold tracking-tight">
                    <AnimatedCounter value={minWeeks} formatter={(v) => String(v)} />–<AnimatedCounter value={maxWeeks} formatter={(v) => String(v)} /> Weeks
                  </span>
                </div>

                {/* Budget display */}
                <div className="flex flex-col gap-2 border-t border-white/5 pt-5">
                  <span className="text-white/40 text-[9px] font-mono tracking-wider uppercase font-bold">Estimated Budget Range</span>
                  <div className="text-white font-sans text-xl sm:text-2xl font-bold tracking-tight leading-none text-[#FF6B35] flex flex-wrap items-center gap-1.5">
                    <AnimatedCounter value={minPrice} formatter={formatCurrency} />
                    <span className="text-white/40 text-sm font-medium">—</span>
                    <AnimatedCounter value={maxPrice} formatter={formatCurrency} />
                  </div>
                </div>
              </div>

              {/* Book session CTA */}
              <div className="flex flex-col gap-3 mt-4">
                <a
                  href="#contact"
                  className="w-full py-4 bg-gradient-to-r from-[#FF6B35] to-[#ff804d] hover:brightness-110 active:scale-[0.98] text-white text-xs font-mono font-bold tracking-widest uppercase rounded-lg text-center transition-all duration-200 shadow-[0_4px_24px_rgba(255,107,53,0.18)] flex items-center justify-center gap-2"
                >
                  Book Scope Session
                  <ArrowRight size={13} />
                </a>
                <p className="text-[10px] text-white/30 font-sans text-center leading-relaxed px-4">
                  * Final pricing depends on project scope and requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// CUSTOM SVG ICONS FOR SOCIALS
// ==========================================
const GithubIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const MailIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

// ==========================================
// FINAL CINEMATIC SECTION & FOOTER
// ==========================================
function FinalSection() {
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
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  const footerLinks = [
    { label: "GitHub", url: "https://github.com/Bismeet" },
    { label: "Instagram", url: "https://www.instagram.com/thelazydeveloper_" },
    { label: "Email", url: "mailto:labsphoenix1@gmail.com" },
  ] as const;

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative min-h-screen bg-[#0A0A0A] px-6 pt-24 pb-8 sm:px-12 md:px-24 flex flex-col justify-between border-t border-white/5 overflow-hidden z-30"
    >
      {/* Self-contained styling keyframes for final background float and link hover underline */}
      <style>{`
        @keyframes finalPhoenixFloat {
          0% { transform: translate(-50%, -50%) scale(0.95) rotate(0deg); }
          50% { transform: translate(-50%, -48%) scale(1.03) rotate(2deg); }
          100% { transform: translate(-50%, -50%) scale(0.95) rotate(0deg); }
        }
        @keyframes ambientLightPulse {
          0% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.04; }
          50% { transform: translate(-50%, -50%) scale(1.05); opacity: 0.08; }
          100% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.04; }
        }
        .contact-link {
          position: relative;
          transition: color 300ms ease, text-shadow 300ms ease;
        }
        .contact-link:hover {
          color: #FF6B35;
          text-shadow: 0 0 8px rgba(255, 107, 53, 0.4);
        }
        .contact-link::after {
          content: '';
          position: absolute;
          width: 100%;
          transform: scaleX(0);
          height: 1px;
          bottom: -4px;
          left: 0;
          background-color: #FF6B35;
          transform-origin: bottom right;
          transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .contact-link:hover::after {
          transform: scaleX(1);
          transform-origin: bottom left;
        }
      `}</style>

      {/* Ambient background light pulse */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#FF6B35] rounded-full blur-[140px] pointer-events-none z-0"
        style={{
          animation: "ambientLightPulse 10s ease-in-out infinite",
        }}
      />

      {/* Massive Glowing Phoenix Outline Background */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] pointer-events-none z-0 select-none transition-opacity duration-1000"
        style={{
          aspectRatio: "1/1",
          opacity: isIntersecting ? 0.06 : 0,
          animation: "finalPhoenixFloat 14s ease-in-out infinite",
        }}
      >
        <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="final-bg-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g stroke="#FF6B35" strokeWidth="1.2" fill="none" filter="url(#final-bg-glow)" transform="rotate(180, 100, 100)">
            {/* Torso / Body */}
            <polygon points="100,60 110,85 100,140 90,85" />

            {/* Head Crest */}
            <polygon points="100,30 106,45 100,55 94,45" />
            <polygon points="100,18 103,28 100,33 97,28" />

            {/* Left Plumes */}
            <polygon points="90,85 25,50 60,95" />
            <polygon points="90,75 35,40 65,70" />
            <polygon points="90,95 40,75 70,105" />

            {/* Right Plumes */}
            <polygon points="110,85 175,50 140,95" />
            <polygon points="110,75 165,40 135,70" />
            <polygon points="110,95 160,75 130,105" />

            {/* Tail Shards */}
            <polygon points="100,140 103,185 100,200 97,185" />
            <polygon points="95,135 90,175 95,165" />
            <polygon points="105,135 110,175 105,165" />
          </g>
        </svg>
      </div>

      {/* Main Content — Centered Full-Width */}
      <div className="flex-grow flex flex-col items-center justify-center max-w-5xl mx-auto z-10 w-full mt-10 text-center">
        
        {/* Massive Typography */}
        <h2 className="text-white font-display text-[11vw] sm:text-[9vw] md:text-[7vw] lg:text-[6vw] leading-[0.92] uppercase tracking-tighter select-none">
          {["LET'S BUILD", "SOMETHING", "UNFORGETTABLE"].map((line, idx) => (
            <span key={idx} className="block overflow-hidden py-1">
              <span
                className={`block bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent transition-all duration-[800ms] ease-out transform ${
                  isIntersecting ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                }`}
                style={{ transitionDelay: `${idx * 150}ms` }}
              >
                {line}
              </span>
            </span>
          ))}
        </h2>

        {/* Supporting text */}
        <p
          className={`text-white/60 text-xs sm:text-sm md:text-base leading-relaxed mt-8 max-w-xl font-sans font-normal transition-all duration-[800ms] delay-[450ms] ease-out transform ${
            isIntersecting ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          Whether you're launching a startup, building a SaaS product, or creating a modern digital experience, Phoenix Labs is ready to help bring your vision to life.
        </p>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row items-center gap-4 mt-8 transition-all duration-[800ms] delay-[550ms] ease-out transform ${
            isIntersecting ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <a
            href="mailto:labsphoenix1@gmail.com"
            className="px-8 py-3.5 bg-gradient-to-r from-[#FF6B35] to-[#ff804d] hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(255,107,53,0.25)] text-white text-xs font-mono font-bold uppercase rounded-lg tracking-widest transition-all duration-300 active:scale-95 text-center"
          >
            Start Your Project →
          </a>

        </div>

        {/* Premium Contact Cards Grid */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 w-full mt-16 transition-all duration-[1000ms] delay-[650ms] ease-out transform ${
            isIntersecting ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {/* GitHub Card */}
          <a
            href="https://github.com/Bismeet"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col items-center gap-5 p-8 sm:p-10 bg-[#111111]/70 border border-white/5 rounded-2xl backdrop-blur-md overflow-hidden transition-all duration-[400ms] hover:border-[#FF6B35]/30 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(255,107,53,0.08)]"
          >
            {/* Top glow line */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FF6B35] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Icon container */}
            <div className="w-16 h-16 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-white/50 group-hover:text-[#FF6B35] group-hover:border-[#FF6B35]/30 group-hover:bg-[#FF6B35]/10 group-hover:shadow-[0_0_20px_rgba(255,107,53,0.12)] transition-all duration-[400ms]">
              <GithubIcon size={28} />
            </div>
            
            {/* Label */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-white font-sans text-sm font-bold uppercase tracking-wider">GitHub</span>
              <span className="text-white/40 text-[11px] font-mono tracking-wide">@Bismeet</span>
            </div>
            
            {/* Subtle arrow indicator */}
            <span className="text-white/20 text-[10px] font-mono tracking-wider uppercase group-hover:text-[#FF6B35]/60 transition-colors duration-300">View Profile →</span>
          </a>

          {/* Instagram Card */}
          <a
            href="https://www.instagram.com/thelazydeveloper_"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col items-center gap-5 p-8 sm:p-10 bg-[#111111]/70 border border-white/5 rounded-2xl backdrop-blur-md overflow-hidden transition-all duration-[400ms] hover:border-[#FF6B35]/30 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(255,107,53,0.08)]"
          >
            {/* Top glow line */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FF6B35] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Icon container */}
            <div className="w-16 h-16 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-white/50 group-hover:text-[#FF6B35] group-hover:border-[#FF6B35]/30 group-hover:bg-[#FF6B35]/10 group-hover:shadow-[0_0_20px_rgba(255,107,53,0.12)] transition-all duration-[400ms]">
              <InstagramIcon size={28} />
            </div>
            
            {/* Label */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-white font-sans text-sm font-bold uppercase tracking-wider">Instagram</span>
              <span className="text-white/40 text-[11px] font-mono tracking-wide">@thelazydeveloper_</span>
            </div>
            
            {/* Subtle arrow indicator */}
            <span className="text-white/20 text-[10px] font-mono tracking-wider uppercase group-hover:text-[#FF6B35]/60 transition-colors duration-300">Follow Us →</span>
          </a>

          {/* Email Card */}
          <a
            href="mailto:labsphoenix1@gmail.com"
            className="group relative flex flex-col items-center gap-5 p-8 sm:p-10 bg-[#111111]/70 border border-white/5 rounded-2xl backdrop-blur-md overflow-hidden transition-all duration-[400ms] hover:border-[#FF6B35]/30 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(255,107,53,0.08)]"
          >
            {/* Top glow line */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FF6B35] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Icon container */}
            <div className="w-16 h-16 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-white/50 group-hover:text-[#FF6B35] group-hover:border-[#FF6B35]/30 group-hover:bg-[#FF6B35]/10 group-hover:shadow-[0_0_20px_rgba(255,107,53,0.12)] transition-all duration-[400ms]">
              <MailIcon size={28} />
            </div>
            
            {/* Label */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-white font-sans text-sm font-bold uppercase tracking-wider">Email</span>
              <span className="text-white/40 text-[11px] font-mono tracking-wide">labsphoenix1@gmail.com</span>
            </div>
            
            {/* Subtle arrow indicator */}
            <span className="text-white/20 text-[10px] font-mono tracking-wider uppercase group-hover:text-[#FF6B35]/60 transition-colors duration-300">Send Email →</span>
          </a>
        </div>
      </div>

      {/* Minimal Footer */}
      <footer
        className={`w-full max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center border-t border-white/5 pt-8 pb-4 text-[10px] text-white/30 font-sans tracking-wide mt-24 gap-6 z-10 transition-all duration-1000 delay-[800ms] ease-out transform ${
          isIntersecting ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <div className="flex items-center gap-1.5 order-2 sm:order-1">
          <span>© 2026 Phoenix Labs</span>
        </div>
        
        {/* Footer social links (Only GitHub, Instagram, Email) */}
        <div className="flex items-center gap-6 order-1 sm:order-2">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target={link.url.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="contact-link text-white/40 hover:text-white transition-colors py-1 font-mono tracking-wider uppercase text-[9px]"
            >
              {link.label}
            </a>
          ))}
        </div>

        <span className="order-3 text-center sm:text-right">Building Websites, Web Apps & SaaS Products That Scale</span>
      </footer>
    </section>
  );
}
