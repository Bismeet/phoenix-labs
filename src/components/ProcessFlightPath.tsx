import { useLayoutEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./ProcessFlightPath.css";

gsap.registerPlugin(ScrollTrigger);

const PROCESS_STAGES = [
  {
    title: "Discovery",
    description: "We understand the product, audience, goals and constraints before making design decisions.",
    outputs: ["Project scope", "Audience and goals", "Functional requirements"],
    marker: "ORIGIN / 01-A",
  },
  {
    title: "Strategy",
    description: "We define the structure, user journey and technical direction before production begins.",
    outputs: ["Information architecture", "User flows", "Technical plan"],
    marker: "DIRECTION / 02-B",
  },
  {
    title: "Design",
    description: "We create the visual system, responsive layouts and interactive behaviour of the product.",
    outputs: ["UI direction", "Design system", "Interactive prototype"],
    marker: "FORM / 03-C",
  },
  {
    title: "Build",
    description: "We develop, connect and test the complete experience using production-ready technology.",
    outputs: ["Frontend and backend", "Integrations", "Quality testing"],
    marker: "SYSTEM / 04-D",
  },
  {
    title: "Launch",
    description: "We refine performance, verify the final product and prepare it for real users.",
    outputs: ["Deployment", "Performance checks", "Handover and documentation"],
    marker: "RELEASE / 05-E",
  },
] as const;

const STAGE_PROGRESS = [0.1, 0.3, 0.5, 0.7, 0.9];
const DESKTOP_PATH = "M 500 0 C 500 90 430 135 430 220 C 430 370 570 505 570 660 C 570 810 435 955 435 1100 C 435 1255 570 1395 570 1540 C 570 1700 500 1845 500 1980 C 500 2080 500 2150 500 2200";
const MOBILE_PATH = "M 500 0 C 500 90 210 145 210 220 C 195 375 225 510 210 660 C 195 815 225 955 210 1100 C 195 1255 225 1395 210 1540 C 195 1695 210 1845 210 1980 C 210 2070 210 2150 210 2200";

function ProcessFlightPath() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const guidePathRef = useRef<SVGPathElement>(null);
  const completedPathRef = useRef<SVGPathElement>(null);
  const phoenixRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const cardRefs = useRef<Array<HTMLLIElement | null>>([]);
  const nodeRefs = useRef<Array<SVGGElement | null>>([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const guidePath = guidePathRef.current;
    const completedPath = completedPathRef.current;
    const phoenix = phoenixRef.current;

    if (!section || !track || !guidePath || !completedPath || !phoenix) return;

    let pathLength = 0;
    let timeline: gsap.core.Timeline | null = null;

    const applyStageState = (progress: number) => {
      let currentStage = 0;
      STAGE_PROGRESS.forEach((stagePoint, index) => {
        if (progress >= stagePoint) currentStage = index;
      });

      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        card.classList.toggle("is-active", index === currentStage);
        card.classList.toggle("is-complete", index < currentStage);
        card.classList.toggle("is-upcoming", index > currentStage);
      });

      nodeRefs.current.forEach((node, index) => {
        if (!node) return;
        node.classList.toggle("is-active", index === currentStage);
        node.classList.toggle("is-complete", progress >= STAGE_PROGRESS[index]);
      });

      if (counterRef.current) counterRef.current.textContent = `${String(currentStage + 1).padStart(2, "0")} / 05`;
      section.classList.toggle("is-launched", progress >= STAGE_PROGRESS[4]);
    };

    const configureGeometry = () => {
      const isMobile = window.matchMedia("(max-width: 760px)").matches;
      const pathData = isMobile ? MOBILE_PATH : DESKTOP_PATH;
      guidePath.setAttribute("d", pathData);
      completedPath.setAttribute("d", pathData);
      pathLength = guidePath.getTotalLength();

      completedPath.style.strokeDasharray = `${pathLength}`;
      completedPath.style.strokeDashoffset = `${pathLength * (1 - (timeline?.progress() ?? 0))}`;

      const svgBounds = guidePath.ownerSVGElement?.getBoundingClientRect();
      const inverseScaleX = svgBounds?.width ? 1000 / svgBounds.width : 1;
      const inverseScaleY = svgBounds?.height ? 2200 / svgBounds.height : 1;

      nodeRefs.current.forEach((node, index) => {
        if (!node) return;
        const point = guidePath.getPointAtLength(pathLength * STAGE_PROGRESS[index]);
        node.setAttribute(
          "transform",
          `translate(${point.x} ${point.y}) scale(${inverseScaleX} ${inverseScaleY})`,
        );
      });
    };

    const context = gsap.context(() => {
      configureGeometry();
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reducedMotion) {
        section.classList.add("is-reduced-motion", "is-launched");
        completedPath.style.strokeDashoffset = "0";
        gsap.set(phoenix, { xPercent: -50, yPercent: -50, y: track.clientHeight * STAGE_PROGRESS[4] });
        applyStageState(1);
        return;
      }

      gsap.set(phoenix, { xPercent: -50, yPercent: -50, y: 0 });
      applyStageState(0);
      timeline = gsap.timeline({
        defaults: { ease: "none" },
        onUpdate: () => applyStageState(timeline?.progress() ?? 0),
        scrollTrigger: {
          trigger: track,
          start: "top 46%",
          end: "bottom 54%",
          scrub: 0.35,
          invalidateOnRefresh: true,
          onRefreshInit: configureGeometry,
        },
      });

      timeline
        .fromTo(
          completedPath,
          { strokeDashoffset: () => pathLength },
          { strokeDashoffset: 0, duration: 1 },
          0,
        )
        .to(
          phoenix,
          {
            y: () => track.clientHeight,
            duration: 1,
          },
          0,
        );
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section ref={sectionRef} id="process" className="process-flight" aria-labelledby="process-flight-heading">
      <div className="process-flight__frame" aria-hidden="true" />

      <header className="process-flight__intro">
        <div className="process-flight__eyebrow"><i />05 / OUR PROCESS</div>
        <div className="process-flight__intro-copy">
          <h2 id="process-flight-heading">A CLEAR PATH<br /><em>FROM IDEA TO LAUNCH.</em></h2>
          <p>Five focused stages that turn an early direction into a polished, production-ready digital product.</p>
        </div>
      </header>

      <div ref={trackRef} className="process-flight__track">
        <div className="process-flight__coordinates process-flight__coordinates--start" aria-hidden="true">
          <span>IDEA</span><i />
        </div>
        <div className="process-flight__coordinates process-flight__coordinates--end" aria-hidden="true">
          <span>LIVE PRODUCT</span><i />
        </div>

        <div className="process-flight__counter" aria-hidden="true">
          <span ref={counterRef}>01 / 05</span>
          <small>FLIGHT PROGRESS</small>
        </div>

        <svg className="process-flight__svg" viewBox="0 0 1000 2200" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path ref={guidePathRef} className="process-flight__path process-flight__path--guide" />
          <path ref={completedPathRef} className="process-flight__path process-flight__path--complete" />
          {PROCESS_STAGES.map((stage, index) => (
            <g
              key={stage.title}
              ref={(node) => { nodeRefs.current[index] = node; }}
              className="process-flight__node"
            >
              <circle className="process-flight__node-halo" r="19" />
              <circle className="process-flight__node-ring" r="7" />
              <circle className="process-flight__node-core" r="2.5" />
              <text x="17" y="4">0{index + 1}</text>
            </g>
          ))}
        </svg>

        <div ref={phoenixRef} className="process-flight__phoenix" aria-hidden="true">
          <img src="/phoenix-icon.png" alt="" draggable="false" />
        </div>

        <ol className="process-flight__stages">
          {PROCESS_STAGES.map((stage, index) => (
            <li
              key={stage.title}
              ref={(card) => { cardRefs.current[index] = card; }}
              className={`process-flight__stage process-flight__stage--${index + 1}`}
            >
              <article className="process-flight__card">
                <span className="process-flight__active-edge" aria-hidden="true" />
                <div className="process-flight__card-meta">
                  <span>STEP 0{index + 1}</span>
                  <span>{stage.marker}</span>
                </div>
                <h3>{stage.title}</h3>
                <p>{stage.description}</p>
                <div className="process-flight__outputs">
                  <span>KEY OUTPUTS</span>
                  <ul>
                    {stage.outputs.map((output) => <li key={output}>{output}</li>)}
                  </ul>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>

      <footer className="process-flight__launch">
        <div className="process-flight__launch-node" aria-hidden="true"><i /><span /></div>
        <span className="process-flight__launch-label">DESTINATION / 05</span>
        <h3>
          <span className="process-flight__launch-line process-flight__launch-line--primary">READY TO BUILD</span>
          <em className="process-flight__launch-line process-flight__launch-line--accent">SOMETHING REAL?</em>
        </h3>
        <p>Tell us what you're creating. We'll help define the clearest path forward.</p>
        <a href="#contact" className="process-flight__cta">
          <span>START A PROJECT</span>
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>
        <div className="process-flight__contact-bridge" aria-hidden="true"><i /></div>
      </footer>
    </section>
  );
}

export default ProcessFlightPath;
