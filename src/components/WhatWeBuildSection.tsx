import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import WhatWeBuildVisual from "./WhatWeBuildVisual";
import "./WhatWeBuildSection.css";

gsap.registerPlugin(ScrollTrigger);

const PhoenixEnergyBackground = lazy(() => import("./PhoenixEnergyBackground"));

function ScrollProgress() {
  return (
    <div className="build-progress" aria-label="Three stage build process">
      <span className="build-progress-number" data-progress-number="1">01</span>
      <div className="build-progress-track"><i /></div>
      <span className="build-progress-number" data-progress-number="2">02</span>
      <div className="build-progress-track"><i /></div>
      <span className="build-progress-number" data-progress-number="3">03</span>
    </div>
  );
}

export default function WhatWeBuildSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const sectionProgressRef = useRef(0);
  const [backgroundReady, setBackgroundReady] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || backgroundReady) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setBackgroundReady(true);
      observer.disconnect();
    }, { rootMargin: "35% 0px" });
    observer.observe(section);
    return () => observer.disconnect();
  }, [backgroundReady]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      const intro = section.querySelector<HTMLElement>('[data-copy="intro"]');
      const stageOne = section.querySelector<HTMLElement>('[data-copy="one"]');
      const stageTwo = section.querySelector<HTMLElement>('[data-copy="two"]');
      const stageThree = section.querySelector<HTMLElement>('[data-copy="three"]');
      const visual = section.querySelector<HTMLElement>(".build-native-visual");
      const browser = section.querySelector<HTMLElement>(".build-native-browser");
      const fragments = section.querySelectorAll<HTMLElement>("[data-build-fragment]");
      const ideaLabels = section.querySelectorAll<HTMLElement>(".build-native-idea-label");
      const progressFills = section.querySelectorAll<HTMLElement>(".build-progress-track i");
      const progressNumbers = section.querySelectorAll<HTMLElement>(".build-progress-number");
      const grid = section.querySelector<SVGGElement>(".build-native-grid");
      const anchors = section.querySelectorAll<SVGCircleElement>(".build-native-anchor");
      const route = section.querySelector<SVGPathElement>(".build-native-route");
      const sketches = section.querySelectorAll<SVGPathElement>(".build-native-sketch");
      const measurements = section.querySelectorAll<SVGGElement>(".build-native-measure");
      const selection = section.querySelector<HTMLElement>(".build-native-selection");
      const cursor = section.querySelector<SVGSVGElement>(".build-native-cursor");
      const breakpoint = section.querySelector<HTMLElement>(".build-native-breakpoint");
      const artPaths = section.querySelectorAll<SVGPathElement>(".build-native-art-path");
      const cta = section.querySelector<HTMLElement>(".build-native-cta");
      const mobileFrame = section.querySelector<HTMLElement>(".build-native-mobile");
      const spark = section.querySelector<HTMLElement>(".build-native-spark");

      if (!intro || !stageOne || !stageTwo || !stageThree || !visual || !browser || !route || !selection || !cursor || !breakpoint || !cta || !mobileFrame || !spark) return;

      const setSectionProgress = (progress: number) => {
        sectionProgressRef.current = progress;
      };
      const spread = () => window.innerWidth <= 520 ? 0.34 : window.innerWidth <= 820 ? 0.5 : window.innerWidth <= 1100 ? 0.72 : 1;
      const fragmentValue = (element: HTMLElement, axis: "x" | "y", amount: number) => {
        const value = axis === "x" ? element.dataset.scatterX : element.dataset.scatterY;
        return Number(value ?? 0) * spread() * amount;
      };
      const fragmentRotation = (element: HTMLElement, amount: number) => Number(element.dataset.scatterRotation ?? 0) * amount;

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(intro, { autoAlpha: 1, yPercent: 0 });
        gsap.set([stageOne, stageTwo, stageThree], { autoAlpha: 0, yPercent: 16 });
        gsap.set(progressFills, { scaleX: 0, transformOrigin: "left center" });
        gsap.set(progressNumbers, { opacity: 0.28 });
        gsap.set(progressNumbers[0], { opacity: 1 });
        gsap.set(visual, { "--finish": 0, "--wire": 0, "--detail": 0 });
        gsap.set(browser, { autoAlpha: 0.12, scale: 0.985 });
        gsap.set(fragments, {
          autoAlpha: 0,
          x: (_index, element: HTMLElement) => fragmentValue(element, "x", 1),
          y: (_index, element: HTMLElement) => fragmentValue(element, "y", 1),
          rotation: (_index, element: HTMLElement) => fragmentRotation(element, 1),
        });
        gsap.set(ideaLabels, { autoAlpha: 0 });
        gsap.set(grid, { opacity: 0.16 });
        gsap.set(anchors, { opacity: 0.32, scale: 0.7, transformOrigin: "center" });
        gsap.set(route, { strokeDashoffset: 1, opacity: 0.72 });
        gsap.set(sketches, { strokeDashoffset: 1, opacity: 0 });
        gsap.set(measurements, { autoAlpha: 0 });
        gsap.set([selection, cursor, breakpoint], { autoAlpha: 0 });
        gsap.set(artPaths, { strokeDashoffset: 1 });

        const timelineClock = { value: 0 };
        const timeline = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });
        timeline
          // Opening question: 0.00-0.10
          .to(spark, { scale: 1.28, duration: 0.06, ease: "power2.out" }, 0.035)
          .to(intro, { autoAlpha: 0, yPercent: -12, duration: 0.025 }, 0.075)

          // Stage 1: Find the spark, 0.10-0.36
          .to(stageOne, { autoAlpha: 1, yPercent: 0, duration: 0.03 }, 0.10)
          .to(progressFills[0], { scaleX: 1, duration: 0.26, ease: "none" }, 0.10)
          .to(spark, { x: 38, y: -24, scale: 0.82, duration: 0.12, ease: "power2.inOut" }, 0.10)
          .to(route, { strokeDashoffset: 0, duration: 0.22, ease: "none" }, 0.10)
          .to(browser, { autoAlpha: 0.3, duration: 0.12 }, 0.10)
          .to(fragments, {
            autoAlpha: 1,
            x: (_index, element: HTMLElement) => fragmentValue(element, "x", 0.68),
            y: (_index, element: HTMLElement) => fragmentValue(element, "y", 0.68),
            rotation: (_index, element: HTMLElement) => fragmentRotation(element, 0.68),
            duration: 0.12,
            stagger: 0.004,
            ease: "power3.out",
          }, 0.115)
          .to(ideaLabels, { autoAlpha: 1, duration: 0.04, stagger: 0.012 }, 0.13)
          .to(sketches, { strokeDashoffset: 0, opacity: 1, duration: 0.14, stagger: 0.02, ease: "none" }, 0.15)
          .to(anchors, { opacity: 0.9, scale: 1, duration: 0.06, stagger: 0.008 }, 0.17)
          .to(fragments, {
            x: (_index, element: HTMLElement) => fragmentValue(element, "x", 0.26),
            y: (_index, element: HTMLElement) => fragmentValue(element, "y", 0.26),
            rotation: (_index, element: HTMLElement) => fragmentRotation(element, 0.26),
            duration: 0.07,
            ease: "power2.inOut",
          }, 0.29)
          .to(stageOne, { autoAlpha: 0, yPercent: -13, duration: 0.03 }, 0.33)

          // Stage 2: Give it form, 0.36-0.68
          .to(stageTwo, { autoAlpha: 1, yPercent: 0, duration: 0.04 }, 0.36)
          .to(progressNumbers[0], { opacity: 0.28, duration: 0.02 }, 0.36)
          .to(progressNumbers[1], { opacity: 1, duration: 0.02 }, 0.36)
          .to(progressFills[1], { scaleX: 1, duration: 0.32, ease: "none" }, 0.36)
          .to(visual, { "--wire": 1, duration: 0.16, ease: "power2.out" }, 0.36)
          .to(browser, { autoAlpha: 1, scale: 1, duration: 0.14 }, 0.36)
          .to(fragments, { x: 0, y: 0, rotation: 0, duration: 0.16, stagger: 0.0025, ease: "power3.inOut" }, 0.36)
          .to(grid, { opacity: 0.44, duration: 0.09 }, 0.40)
          .to(cursor, { autoAlpha: 1, x: -260, y: -150, duration: 0.12, ease: "power2.inOut" }, 0.43)
          .to(selection, { autoAlpha: 1, duration: 0.025 }, 0.50)
          .to(measurements, { autoAlpha: 1, duration: 0.035, stagger: 0.018 }, 0.50)
          .to(selection, { scaleX: 0.82, transformOrigin: "left center", duration: 0.06, ease: "back.out(1.8)" }, 0.53)
          .to(cursor, { x: -314, y: -185, duration: 0.07, ease: "power2.inOut" }, 0.55)
          .to(selection, { scaleX: 1, duration: 0.04 }, 0.58)
          .to(measurements, { autoAlpha: 0, duration: 0.04 }, 0.62)
          .to(stageTwo, { autoAlpha: 0, yPercent: -13, duration: 0.04 }, 0.64)

          // Stage 3: Make it real, 0.68-0.94
          .to(stageThree, { autoAlpha: 1, yPercent: 0, duration: 0.04 }, 0.68)
          .to(progressNumbers[1], { opacity: 0.28, duration: 0.02 }, 0.68)
          .to(progressNumbers[2], { opacity: 1, duration: 0.02 }, 0.68)
          .to(visual, { "--finish": 1, "--wire": 0.35, "--detail": 1, duration: 0.15, ease: "power2.inOut" }, 0.68)
          .to([ideaLabels, sketches, anchors], { autoAlpha: 0, duration: 0.08 }, 0.68)
          .to(grid, { opacity: 0.12, duration: 0.1 }, 0.70)
          .to(artPaths, { strokeDashoffset: 0, duration: 0.15, stagger: 0.02, ease: "none" }, 0.70)
          .to(selection, { autoAlpha: 0, duration: 0.06 }, 0.72)
          .to(cursor, { x: -182, y: -214, autoAlpha: 0, duration: 0.09 }, 0.73)
          .to(mobileFrame, { scale: 1.03, duration: 0.07, ease: "power2.out" }, 0.78)
          .to(breakpoint, { autoAlpha: 1, duration: 0.05 }, 0.78)
          .to(cta, { scale: 1.045, duration: 0.035, ease: "power2.out" }, 0.855)
          .to(cta, { scale: 1, duration: 0.035, ease: "power2.in" }, 0.89)
          .to(browser, { rotationY: 0, rotationX: 0, duration: 0.08 }, 0.86)
          .to(stageThree, { yPercent: -3, duration: 0.06 }, 0.94)

          // Final hold: 0.94-1.00
          .to(timelineClock, { value: 1, duration: 0.06, ease: "none" }, 0.94);

        const trigger = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            timeline.progress(self.progress).pause();
            setSectionProgress(self.progress);
          },
          onRefresh: (self) => {
            timeline.invalidate().progress(self.progress).pause();
            setSectionProgress(self.progress);
          },
        });
        const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
        return () => {
          cancelAnimationFrame(refreshFrame);
          trigger.kill();
          timeline.kill();
        };
      });

      media.add("(prefers-reduced-motion: reduce)", () => {
        setSectionProgress(1);
        gsap.set([intro, stageOne, stageTwo, stageThree], { clearProps: "all" });
        gsap.set(progressFills, { scaleX: 1 });
        gsap.set(progressNumbers, { opacity: 0.55 });
        gsap.set(progressNumbers[2], { opacity: 1 });
        gsap.set(visual, { "--finish": 1, "--wire": 0.35, "--detail": 1 });
      });
    }, section);

    return () => {
      media.revert();
      context.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} id="about" className="what-we-build" aria-labelledby="what-we-build-title">
      <div className="what-we-build-sticky">
        {backgroundReady && (
          <Suspense fallback={null}>
            <PhoenixEnergyBackground progressRef={sectionProgressRef} sectionRef={sectionRef} />
          </Suspense>
        )}
        <div className="build-layout">
          <div className="build-copy-column">
            <div className="build-copy-stack">
              <div className="build-copy" data-copy="intro">
                <span className="build-eyebrow"><i /> 01 / WHAT WE DO</span>
                <h2 id="what-we-build-title">WHAT DO<br />WE ACTUALLY<br /><em>BUILD?</em></h2>
                <p>We turn unfinished ideas into digital experiences people remember.</p>
              </div>
              <div className="build-copy" data-copy="one">
                <span className="build-eyebrow"><i /> 01 / FIND THE SPARK</span>
                <h2>FIRST,<br />WE FIND<br /><em>THE SPARK.</em></h2>
                <p>We understand the business, audience and purpose before designing anything.</p>
              </div>
              <div className="build-copy" data-copy="two">
                <span className="build-eyebrow"><i /> 02 / GIVE IT FORM</span>
                <h2>THEN,<br />WE GIVE IT<br /><em>A FORM.</em></h2>
                <p>We turn the idea into a clear structure, visual system and interaction language.</p>
              </div>
              <div className="build-copy" data-copy="three">
                <span className="build-eyebrow"><i /> 03 / MAKE IT REAL</span>
                <h2>FINALLY,<br />WE MAKE IT<br /><em>REAL.</em></h2>
                <p>We develop, test and refine the complete experience across every screen.</p>
              </div>
            </div>
            <ScrollProgress />
          </div>

          <div className="build-visual-stage" aria-label="An idea transforming into a finished website">
            <div className="build-axis-label build-axis-top" aria-hidden="true">CONCEPT → SYSTEM → EXPERIENCE</div>
            <div className="build-axis-label build-axis-side" aria-hidden="true">PHOENIX / DIGITAL PRODUCT LAB</div>
            <WhatWeBuildVisual />
          </div>
        </div>
        <span className="build-scroll-note" aria-hidden="true">SCROLL TO BUILD <i /></span>
      </div>
    </section>
  );
}
