import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollFrameSequence, { type ScrollFrameSequenceHandle } from "./ScrollFrameSequence";
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
  const frameSequenceRef = useRef<ScrollFrameSequenceHandle>(null);
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
      const progressFills = section.querySelectorAll<HTMLElement>(".build-progress-track i");
      const progressNumbers = section.querySelectorAll<HTMLElement>(".build-progress-number");

      if (!intro || !stageOne || !stageTwo || !stageThree) return;

      const setSectionProgress = (progress: number) => {
        sectionProgressRef.current = progress;
        frameSequenceRef.current?.setProgress(progress);
      };

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set([stageOne, stageTwo, stageThree], { autoAlpha: 0, yPercent: 16 });
        gsap.set(progressFills, { scaleX: 0, transformOrigin: "left center" });
        gsap.set(progressNumbers, { opacity: 0.28 });
        gsap.set(progressNumbers[0], { opacity: 1 });

        const timeline = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.65,
            invalidateOnRefresh: true,
            onUpdate: (self) => setSectionProgress(self.progress),
            onRefresh: (self) => setSectionProgress(self.progress),
          },
        });

        timeline
          .to(intro, { autoAlpha: 0, yPercent: -18, duration: 0.7 }, 0.45)
          .to(stageOne, { autoAlpha: 1, yPercent: 0, duration: 0.75 }, 0.72)
          .to(progressFills[0], { scaleX: 1, duration: 2.1, ease: "none" }, 0.8)
          .to(stageOne, { autoAlpha: 0, yPercent: -16, duration: 0.65 }, 2.35)
          .to(stageTwo, { autoAlpha: 1, yPercent: 0, duration: 0.7 }, 2.52)
          .to(progressNumbers[0], { opacity: 0.28, duration: 0.3 }, 2.5)
          .to(progressNumbers[1], { opacity: 1, duration: 0.3 }, 2.5)
          .to(progressFills[1], { scaleX: 1, duration: 2.35, ease: "none" }, 2.7)
          .to(stageTwo, { autoAlpha: 0, yPercent: -16, duration: 0.65 }, 4.78)
          .to(stageThree, { autoAlpha: 1, yPercent: 0, duration: 0.7 }, 4.96)
          .to(progressNumbers[1], { opacity: 0.28, duration: 0.3 }, 4.92)
          .to(progressNumbers[2], { opacity: 1, duration: 0.3 }, 4.92)
          .to(stageThree, { yPercent: -5, duration: 1.35 }, 7.05);

        return () => timeline.kill();
      });

      media.add("(prefers-reduced-motion: reduce)", () => {
        setSectionProgress(1);
        gsap.set([intro, stageOne, stageTwo], { display: "none" });
        gsap.set(stageThree, { autoAlpha: 1, yPercent: 0 });
        gsap.set(progressFills, { scaleX: 1 });
        gsap.set(progressNumbers, { opacity: 0.55 });
        gsap.set(progressNumbers[2], { opacity: 1 });
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
            <ScrollFrameSequence
              ref={frameSequenceRef}
              frameCount={240}
              progressRef={sectionProgressRef}
              onFirstFrameReady={() => ScrollTrigger.refresh()}
            />
          </div>
        </div>
        <span className="build-scroll-note" aria-hidden="true">SCROLL TO BUILD <i /></span>
      </div>
    </section>
  );
}
