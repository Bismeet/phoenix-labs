import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./WhyPhoenixEditorial.css";

gsap.registerPlugin(ScrollTrigger);

const PRINCIPLES = [
  {
    title: "Think before building",
    description: "We clarify the audience, purpose and product structure before choosing visual treatments or technology.",
    label: "STRATEGY · STRUCTURE · PRIORITIES",
  },
  {
    title: "Design and engineering together",
    description: "The experience is designed with real implementation in mind, so the finished product stays faithful to the original direction.",
    label: "UX · VISUAL SYSTEM · DEVELOPMENT",
  },
  {
    title: "Build for real use",
    description: "We focus on responsive behaviour, maintainable systems and thoughtful details rather than creating something that only looks good in a screenshot.",
    label: "PERFORMANCE · RESPONSIVENESS · LONGEVITY",
  },
];

function WhyPhoenixEditorial() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const context = gsap.context(() => {
      const intro = gsap.utils.toArray<HTMLElement>("[data-why-intro]");
      const statement = section.querySelector<HTMLElement>(".why-editorial-statement");
      const principles = gsap.utils.toArray<HTMLElement>(".why-editorial-principle");
      const designLine = section.querySelector<HTMLElement>(".why-alignment-track--design");
      const engineeringLine = section.querySelector<HTMLElement>(".why-alignment-track--engineering");
      const productLine = section.querySelector<HTMLElement>(".why-alignment-product");
      const productRule = section.querySelector<HTMLElement>(".why-alignment-product i");
      const closing = section.querySelector<HTMLElement>(".why-editorial-closing");
      const processBridge = section.querySelector<HTMLElement>(".why-process-bridge i");
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const contentTargets = [...intro, statement, ...principles, closing].filter(
        (target): target is HTMLElement => target !== null,
      );

      if (reducedMotion) {
        gsap.set(contentTargets, { autoAlpha: 1, y: 0, clearProps: "transform" });
        gsap.set(designLine, { y: 46, autoAlpha: 0 });
        gsap.set(engineeringLine, { y: -46, autoAlpha: 0 });
        gsap.set(productLine, { autoAlpha: 1 });
        gsap.set(productRule, { scaleX: 1 });
        gsap.set(processBridge, { scaleY: 1 });
        return;
      }

      const timeline = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: section,
          start: "top 76%",
          end: "bottom 82%",
          scrub: 0.65,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .fromTo(intro, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.18, stagger: 0.025 }, 0)
        .fromTo(statement, { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: 0.2 }, 0.1)
        .fromTo(principles, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.21, stagger: 0.095 }, 0.19)
        .to(designLine, { y: 46, autoAlpha: 0.38, duration: 0.24, ease: "power2.inOut" }, 0.43)
        .to(engineeringLine, { y: -46, autoAlpha: 0.38, duration: 0.24, ease: "power2.inOut" }, 0.43)
        .fromTo(productLine, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.18 }, 0.57)
        .fromTo(productRule, { scaleX: 0 }, { scaleX: 1, duration: 0.23, ease: "power2.inOut" }, 0.57)
        .fromTo(closing, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.22 }, 0.69)
        .fromTo(processBridge, { scaleY: 0 }, { scaleY: 1, duration: 0.18, ease: "none" }, 0.82);
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section ref={sectionRef} id="why-us" className="why-editorial" aria-labelledby="why-editorial-heading">
      <div className="why-editorial-background" aria-hidden="true" />
      <div className="why-work-transition" aria-hidden="true"><i /></div>

      <div className="why-editorial-inner">
        <header className="why-editorial-header">
          <div className="why-editorial-eyebrow" data-why-intro>
            <span>04 / WHY PHOENIX LABS</span>
            <i>INTENT / CRAFT / LONGEVITY</i>
          </div>
          <div className="why-editorial-intro">
            <h2 id="why-editorial-heading" data-why-intro>BUILT WITH INTENT.<br /><em>ENGINEERED TO LAST.</em></h2>
            <p data-why-intro>We combine clear product thinking, original design and dependable engineering to create digital products that feel considered from the first interaction to the final release.</p>
          </div>
        </header>

        <div className="why-editorial-structure">
          <div className="why-editorial-statement-column">
            <div className="why-editorial-statement">
              <span className="why-editorial-rule" aria-hidden="true" />
              <h3>WE DON'T FORCE<br />IDEAS INTO<br /><em>TEMPLATES.</em></h3>
              <p>Every project starts with the problem, not a prebuilt layout.</p>
            </div>
          </div>

          <ol className="why-editorial-principles">
            {PRINCIPLES.map((principle, index) => (
              <li key={principle.title} className="why-editorial-principle">
                <span className="why-principle-number">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{principle.title}</h3>
                  <p>{principle.description}</p>
                  <span className="why-principle-label">{principle.label}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="why-alignment" aria-hidden="true">
          <div className="why-alignment-track why-alignment-track--design"><span>DESIGN</span><i /></div>
          <div className="why-alignment-track why-alignment-track--engineering"><span>ENGINEERING</span><i /></div>
          <div className="why-alignment-product"><i /><span>PRODUCT</span></div>
        </div>

        <div className="why-editorial-closing">
          <span>OUR STANDARD / 01</span>
          <h3>WE BUILD THE KIND OF PRODUCTS<br />WE'D BE <em>PROUD TO USE</em> OURSELVES.</h3>
        </div>

        <div className="why-process-bridge" aria-hidden="true"><span>PRODUCT</span><i /></div>
      </div>
    </section>
  );
}

export default WhyPhoenixEditorial;
