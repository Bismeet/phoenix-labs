import { useEffect, useState, type ReactNode } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProps {
  children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(media.matches);
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const nativeScrollDevice = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    if (reducedMotion || nativeScrollDevice) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 0.88,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
      syncTouch: false,
      anchors: { offset: -96 },
      stopInertiaOnNavigate: true,
      prevent: (node) => node.closest("[data-lenis-prevent]") !== null,
    });

    const updateScrollTriggers = () => ScrollTrigger.update();
    const tickLenis = (time: number) => lenis.raf(time * 1000);
    const refresh = () => ScrollTrigger.refresh();
    let navigationFrame = 0;
    let initialHashTimer = 0;

    const scrollToLocation = (immediate: boolean) => {
      const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      const target = id ? document.getElementById(id) : null;
      lenis.scrollTo(target ?? 0, { immediate, offset: target ? -96 : 0 });
    };

    const handleHistoryNavigation = () => {
      window.cancelAnimationFrame(navigationFrame);
      navigationFrame = window.requestAnimationFrame(() => scrollToLocation(false));
    };

    lenis.on("scroll", updateScrollTriggers);
    gsap.ticker.add(tickLenis);
    gsap.ticker.lagSmoothing(0);
    window.addEventListener("popstate", handleHistoryNavigation);

    if (window.location.hash) {
      navigationFrame = window.requestAnimationFrame(() => {
        scrollToLocation(true);
        ScrollTrigger.refresh();
      });
      initialHashTimer = window.setTimeout(() => {
        scrollToLocation(true);
      }, 500);
    }

    if (document.readyState === "complete") {
      refresh();
    } else {
      window.addEventListener("load", refresh, { once: true });
    }

    return () => {
      window.removeEventListener("load", refresh);
      window.removeEventListener("popstate", handleHistoryNavigation);
      window.cancelAnimationFrame(navigationFrame);
      window.clearTimeout(initialHashTimer);
      lenis.off("scroll", updateScrollTriggers);
      gsap.ticker.remove(tickLenis);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, [reducedMotion]);

  return children;
}
