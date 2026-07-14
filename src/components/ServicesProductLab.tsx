import { useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { ArrowRight, Check, Command, FileText, MoreHorizontal, Paperclip, Play, Plus, Search, SlidersHorizontal } from "lucide-react";
import gsap from "gsap";
import "./ServicesProductLab.css";

type ServiceId = "landing" | "business" | "saas" | "ai";
type ModuleId = "nav" | "hero" | "media" | "rail" | "action" | "mobile";

interface ServiceDefinition {
  id: ServiceId;
  name: string;
  descriptor: string;
  bestFor: string;
  coreBuild: string;
  engagement: string;
}

const SERVICES: ServiceDefinition[] = [
  {
    id: "landing",
    name: "Landing Page",
    descriptor: "A focused launch experience",
    bestFor: "Launches, campaigns and focused offers",
    coreBuild: "Strategy · Design · Development · Motion",
    engagement: "1–3 weeks",
  },
  {
    id: "business",
    name: "Business Website",
    descriptor: "A structured multi-page presence",
    bestFor: "Studios, businesses and growing brands",
    coreBuild: "Information architecture · CMS · Responsive development",
    engagement: "3–6 weeks",
  },
  {
    id: "saas",
    name: "SaaS Product",
    descriptor: "A workflow-led product interface",
    bestFor: "Platforms, internal tools and digital products",
    coreBuild: "Product UX · Design systems · Frontend engineering",
    engagement: "4–8 weeks",
  },
  {
    id: "ai",
    name: "AI Tool",
    descriptor: "Human-controlled intelligence",
    bestFor: "AI workflows, assistants and automation products",
    coreBuild: "UX architecture · AI integration · Product engineering",
    engagement: "4–10 weeks",
  },
];

const MODULE_IDS: ModuleId[] = ["nav", "hero", "media", "rail", "action", "mobile"];

const MODULE_ROTATIONS: Record<ServiceId, Record<ModuleId, number>> = {
  landing: { nav: -0.35, hero: -0.7, media: 0.8, rail: 0.25, action: -1.2, mobile: 1.8 },
  business: { nav: 0.2, hero: -0.35, media: 0.45, rail: -0.5, action: 0.8, mobile: 1.25 },
  saas: { nav: 0, hero: 0.2, media: -0.4, rail: -0.25, action: 0.35, mobile: 1 },
  ai: { nav: 0.15, hero: -0.2, media: 0.5, rail: -0.45, action: 0.3, mobile: 1 },
};

interface ProductLayerProps {
  service: ServiceId;
  activeService: ServiceId;
  children: ReactNode;
}

function ProductLayer({ service, activeService, children }: ProductLayerProps) {
  return (
    <div
      className={`services-system-layer${service === activeService ? " is-active" : ""}`}
      data-service-content={service}
    >
      {children}
    </div>
  );
}

interface ProductModuleProps {
  id: ModuleId;
  activeService: ServiceId;
  children: ReactNode;
}

function ProductModule({ id, activeService, children }: ProductModuleProps) {
  return (
    <div className="services-system-module" data-system-module={id}>
      <div className="services-system-module-surface" data-module-surface={id}>
        {children}
        <span className="services-system-corner services-system-corner--tl" />
        <span className="services-system-corner services-system-corner--br" />
        <span className="services-system-module-code">M/{id.toUpperCase()}</span>
        <span className="sr-only">{activeService} product module</span>
      </div>
    </div>
  );
}

function NavigationModule({ activeService }: { activeService: ServiceId }) {
  return (
    <ProductModule id="nav" activeService={activeService}>
      <ProductLayer service="landing" activeService={activeService}>
        <span className="system-wordmark">PHX<span>°</span></span>
        <div className="system-nav-links"><span>Work</span><span>Method</span><span>Studio</span></div>
        <span className="system-nav-action">Start a project <ArrowRight /></span>
      </ProductLayer>
      <ProductLayer service="business" activeService={activeService}>
        <span className="system-wordmark system-wordmark--business"><i /> NORTH / CO.</span>
        <div className="system-nav-links"><span>Company</span><span>Services</span><span>Journal</span></div>
        <span className="system-nav-action">Contact <ArrowRight /></span>
      </ProductLayer>
      <ProductLayer service="saas" activeService={activeService}>
        <span className="system-wordmark"><i className="system-product-mark">A</i> ATLAS</span>
        <div className="system-product-path"><span>Workspace</span><i>/</i><strong>Release planning</strong></div>
        <span className="system-key"><Command /> K</span>
      </ProductLayer>
      <ProductLayer service="ai" activeService={activeService}>
        <span className="system-wordmark"><i className="system-product-mark">F</i> FORGE</span>
        <div className="system-product-path"><span>Projects</span><i>/</i><strong>Launch system</strong></div>
        <span className="system-nav-action"><Play /> Run workflow</span>
      </ProductLayer>
    </ProductModule>
  );
}

function HeroModule({ activeService }: { activeService: ServiceId }) {
  return (
    <ProductModule id="hero" activeService={activeService}>
      <ProductLayer service="landing" activeService={activeService}>
        <div className="system-editorial-hero">
          <span className="system-kicker">Digital product studio / 2026</span>
          <h3>MAKE THE<br /><em>IDEA MATTER.</em></h3>
          <p>Strategy, interface and engineering aligned into one decisive launch.</p>
          <span className="system-scroll-mark"><i /> Scroll to explore</span>
        </div>
      </ProductLayer>
      <ProductLayer service="business" activeService={activeService}>
        <div className="system-business-hero">
          <span className="system-kicker">Independent strategy studio</span>
          <h3>CLARITY FOR<br />WHAT COMES NEXT.</h3>
          <p>Positioning, digital systems and considered experiences for organisations in motion.</p>
          <div className="system-business-links"><span>Our capabilities</span><span>Selected work ↗</span></div>
        </div>
      </ProductLayer>
      <ProductLayer service="saas" activeService={activeService}>
        <div className="system-workflow-view">
          <div className="system-panel-heading"><div><span>WORKFLOW</span><strong>Release planning</strong></div><MoreHorizontal /></div>
          <div className="system-workflow-controls"><span className="is-active">All work</span><span>Assigned</span><span>Review queue</span><span className="system-ui-button"><Plus /> Add task</span></div>
          <div className="system-task-table">
            <div className="system-task-row system-task-row--head"><span>Task</span><span>Owner</span><span>State</span></div>
            <div className="system-task-row"><span><i className="system-check is-done"><Check /></i> Research synthesis</span><span>Design</span><b>Approved</b></div>
            <div className="system-task-row"><span><i className="system-check" /> Interface system</span><span>Product</span><b className="is-review">In review</b></div>
            <div className="system-task-row"><span><i className="system-check" /> Frontend QA</span><span>Build</span><b className="is-open">Ready</b></div>
          </div>
        </div>
      </ProductLayer>
      <ProductLayer service="ai" activeService={activeService}>
        <div className="system-result-canvas">
          <div className="system-panel-heading"><div><span>RESULT CANVAS</span><strong>Launch narrative</strong></div><span className="system-version">Draft 03</span></div>
          <div className="system-result-section"><span>01</span><div><strong>Position the change</strong><p>Lead with the operational shift the product creates, then support it with a clear system story.</p></div></div>
          <div className="system-result-section"><span>02</span><div><strong>Make the workflow tangible</strong><p>Show how teams move from scattered inputs to one controlled release process.</p></div></div>
          <div className="system-human-actions"><span className="system-ui-button">Review changes</span><span className="system-ui-button is-primary">Apply to canvas</span></div>
        </div>
      </ProductLayer>
    </ProductModule>
  );
}

function MediaModule({ activeService }: { activeService: ServiceId }) {
  return (
    <ProductModule id="media" activeService={activeService}>
      <ProductLayer service="landing" activeService={activeService}>
        <div className="system-launch-art">
          <svg viewBox="0 0 320 360" role="presentation">
            <defs><linearGradient id="serviceEmber" x1="0" y1="1" x2="1" y2="0"><stop stopColor="#8b1d08" /><stop offset="0.55" stopColor="#ff4d12" /><stop offset="1" stopColor="#ffb36b" /></linearGradient></defs>
            <path d="M51 286C87 238 97 187 79 134C112 157 140 176 153 206C173 151 169 91 215 45C209 116 247 139 270 178C298 226 257 312 171 328C121 337 76 320 51 286Z" fill="url(#serviceEmber)" />
            <path d="M110 285C149 254 170 220 169 179C199 213 213 241 195 285C180 319 133 323 110 285Z" fill="#130d0a" fillOpacity=".74" />
            <path d="M35 70H285M35 132H285M35 194H285M35 256H285M85 35V325M147 35V325M209 35V325" stroke="white" strokeOpacity=".09" />
          </svg>
          <span className="system-art-caption">PHOENIX / FORM 01</span>
        </div>
      </ProductLayer>
      <ProductLayer service="business" activeService={activeService}>
        <div className="system-case-study">
          <div className="system-case-art"><span>FIELDWORK</span><i /><i /><i /></div>
          <div className="system-case-meta"><span>CASE STUDY / 04</span><strong>A brand system built for movement.</strong><b>View project <ArrowRight /></b></div>
        </div>
      </ProductLayer>
      <ProductLayer service="saas" activeService={activeService}>
        <div className="system-detail-panel">
          <div className="system-panel-heading"><div><span>CONTEXT</span><strong>Interface system</strong></div><MoreHorizontal /></div>
          <p>Unify navigation, tokens and interaction rules before feature delivery.</p>
          <div className="system-detail-list"><span><i className="is-complete"><Check /></i> Navigation model</span><span><i className="is-complete"><Check /></i> Component inventory</span><span><i /> Interaction review</span></div>
          <div className="system-detail-footer"><span>Owner</span><strong>Product design</strong></div>
        </div>
      </ProductLayer>
      <ProductLayer service="ai" activeService={activeService}>
        <div className="system-context-panel">
          <div className="system-panel-heading"><div><span>CONTEXT</span><strong>Connected sources</strong></div><Plus /></div>
          <div className="system-source"><FileText /><div><strong>Brand brief</strong><span>Positioning and audience</span></div><Check /></div>
          <div className="system-source"><FileText /><div><strong>Product notes</strong><span>Features and constraints</span></div><Check /></div>
          <div className="system-source"><FileText /><div><strong>Voice guide</strong><span>Tone and vocabulary</span></div><Check /></div>
          <div className="system-context-control"><SlidersHorizontal /><span>Retrieval controls</span></div>
        </div>
      </ProductLayer>
    </ProductModule>
  );
}

function RailModule({ activeService }: { activeService: ServiceId }) {
  return (
    <ProductModule id="rail" activeService={activeService}>
      <ProductLayer service="landing" activeService={activeService}>
        <div className="system-proof-strip"><span>STRATEGY</span><i /><span>DESIGN</span><i /><span>DEVELOPMENT</span><i /><span>MOTION</span></div>
      </ProductLayer>
      <ProductLayer service="business" activeService={activeService}>
        <div className="system-sitemap">
          <span className="system-kicker">CONTENT SYSTEM</span>
          <strong>Company</strong>
          <div><i /><span>Services</span></div><div><i /><span>Work / Case studies</span></div><div><i /><span>Journal / CMS</span></div><div><i /><span>Contact path</span></div>
        </div>
      </ProductLayer>
      <ProductLayer service="saas" activeService={activeService}>
        <div className="system-app-rail">
          <span className="system-app-logo">A</span>
          <div><span className="is-active">WK</span><span>PL</span><span>DS</span><span>QA</span></div>
          <span className="system-avatar">PL</span>
        </div>
      </ProductLayer>
      <ProductLayer service="ai" activeService={activeService}>
        <div className="system-history-rail">
          <span className="system-app-logo">F</span><span className="system-rail-action"><Plus /> New workflow</span>
          <small>RECENT PROJECTS</small><strong>Launch system</strong><span>Research synthesis</span><span>Content operations</span><span>Support triage</span>
          <b>PL</b>
        </div>
      </ProductLayer>
    </ProductModule>
  );
}

function ActionModule({ activeService }: { activeService: ServiceId }) {
  return (
    <ProductModule id="action" activeService={activeService}>
      <ProductLayer service="landing" activeService={activeService}>
        <div className="system-launch-cta"><span>Start a project</span><ArrowRight /></div>
      </ProductLayer>
      <ProductLayer service="business" activeService={activeService}>
        <div className="system-contact-path"><span>Ready to create clarity?</span><strong>Start a conversation</strong><ArrowRight /></div>
      </ProductLayer>
      <ProductLayer service="saas" activeService={activeService}>
        <div className="system-command-surface"><Search /><span>Search tasks, docs or people</span><b><Command /> K</b></div>
      </ProductLayer>
      <ProductLayer service="ai" activeService={activeService}>
        <div className="system-composer">
          <span>Refine the launch narrative using the connected product notes…</span>
          <div><span className="system-compose-control"><Paperclip /></span><b>Reasoned workflow</b><span className="system-compose-control is-run"><ArrowRight /></span></div>
        </div>
      </ProductLayer>
    </ProductModule>
  );
}

function MobileModule({ activeService }: { activeService: ServiceId }) {
  return (
    <ProductModule id="mobile" activeService={activeService}>
      <ProductLayer service="landing" activeService={activeService}>
        <div className="system-phone-ui"><span className="system-phone-bar" /><small>PHX°</small><strong>MAKE THE<br /><em>IDEA MATTER.</em></strong><i className="system-phone-art" /><b>Start a project →</b></div>
      </ProductLayer>
      <ProductLayer service="business" activeService={activeService}>
        <div className="system-phone-ui"><span className="system-phone-bar" /><small>NORTH / CO.</small><strong>CLARITY FOR<br />WHAT'S NEXT.</strong><i className="system-phone-image" /><b>Explore services →</b></div>
      </ProductLayer>
      <ProductLayer service="saas" activeService={activeService}>
        <div className="system-phone-ui system-phone-ui--product"><span className="system-phone-bar" /><small>ATLAS / TASKS</small><strong>Release planning</strong><i /><i /><i /><b>Open workspace →</b></div>
      </ProductLayer>
      <ProductLayer service="ai" activeService={activeService}>
        <div className="system-phone-ui system-phone-ui--product"><span className="system-phone-bar" /><small>FORGE / RESULT</small><strong>Launch narrative</strong><i /><i /><i /><b>Review draft →</b></div>
      </ProductLayer>
    </ProductModule>
  );
}

function ServicesProductLab() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const previousRectsRef = useRef<Map<ModuleId, DOMRect>>(new Map());
  const previousServiceRef = useRef<ServiceId>("landing");
  const lockedServiceRef = useRef<ServiceId>("landing");
  const pointerBoundsRef = useRef<DOMRect | null>(null);
  const reducedMotionRef = useRef(false);
  const transitionRef = useRef<gsap.core.Timeline | null>(null);
  const [activeService, setActiveService] = useState<ServiceId>("landing");
  const [lockedService, setLockedService] = useState<ServiceId>("landing");

  const selectedService = SERVICES.find((service) => service.id === activeService) ?? SERVICES[0];

  const captureModuleRects = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const nextRects = new Map<ModuleId, DOMRect>();
    stage.querySelectorAll<HTMLElement>("[data-system-module]").forEach((module) => {
      nextRects.set(module.dataset.systemModule as ModuleId, module.getBoundingClientRect());
    });
    previousRectsRef.current = nextRects;
  };

  const showService = (service: ServiceId) => {
    if (service === activeService) return;
    captureModuleRects();
    setActiveService(service);
  };

  const selectService = (service: ServiceId) => {
    lockedServiceRef.current = service;
    setLockedService(service);
    showService(service);
  };

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const plane = planeRef.current;
    if (!section || !stage || !plane) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reducedMotionRef.current = reduceMotion;
    const previousService = previousServiceRef.current;
    const modules = Array.from(stage.querySelectorAll<HTMLElement>("[data-system-module]"));
    const surfaces = Array.from(stage.querySelectorAll<HTMLElement>("[data-module-surface]"));
    const guides = stage.querySelector<SVGElement>(".services-system-guides");
    const oldContent = Array.from(stage.querySelectorAll<HTMLElement>(`[data-service-content="${previousService}"]`));
    const newContent = Array.from(stage.querySelectorAll<HTMLElement>(`[data-service-content="${activeService}"]`));

    transitionRef.current?.kill();

    if (previousService === activeService || previousRectsRef.current.size === 0) {
      gsap.set(newContent, { autoAlpha: 1, y: 0 });
      previousServiceRef.current = activeService;
      return;
    }

    modules.forEach((module) => {
      const id = module.dataset.systemModule as ModuleId;
      const previousRect = previousRectsRef.current.get(id);
      const nextRect = module.getBoundingClientRect();
      if (!previousRect || !nextRect.width || !nextRect.height) return;
      gsap.set(module, {
        x: previousRect.left - nextRect.left,
        y: previousRect.top - nextRect.top,
        scaleX: previousRect.width / nextRect.width,
        scaleY: previousRect.height / nextRect.height,
        transformOrigin: "0 0",
      });
    });

    gsap.set(oldContent, { autoAlpha: 1, y: 0 });
    gsap.set(newContent, { autoAlpha: 0, y: 8 });

    if (reduceMotion) {
      gsap.set(modules, { clearProps: "transform" });
      gsap.set(surfaces, { clearProps: "transform" });
      gsap.set(oldContent, { autoAlpha: 0 });
      gsap.set(newContent, { autoAlpha: 1, y: 0 });
      previousServiceRef.current = activeService;
      return;
    }

    const timeline = gsap.timeline({ defaults: { ease: "power3.inOut" } });
    transitionRef.current = timeline;
    timeline
      .to(oldContent, { autoAlpha: 0, y: -5, duration: 0.14 }, 0)
      .to(plane, { opacity: 0.78, duration: 0.16 }, 0)
      .fromTo(guides, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.18 }, 0.07)
      .to(modules, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.66, stagger: 0.025 }, 0.12)
      .fromTo(
        surfaces,
        { rotation: (index) => MODULE_ROTATIONS[previousService][MODULE_IDS[index]] },
        { rotation: (index) => MODULE_ROTATIONS[activeService][MODULE_IDS[index]], duration: 0.62, stagger: 0.025 },
        0.12,
      )
      .to(newContent, { autoAlpha: 1, y: 0, duration: 0.32, stagger: 0.012, ease: "power2.out" }, 0.47)
      .to(guides, { autoAlpha: 0, duration: 0.22 }, 0.57)
      .to(plane, { opacity: 1, duration: 0.24 }, 0.56);

    previousServiceRef.current = activeService;
    return () => {
      timeline.kill();
    };
  }, [activeService]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") nextIndex = (index + 1) % SERVICES.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") nextIndex = (index - 1 + SERVICES.length) % SERVICES.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = SERVICES.length - 1;
    else return;

    event.preventDefault();
    const nextService = SERVICES[nextIndex];
    selectService(nextService.id);
    sectionRef.current?.querySelector<HTMLButtonElement>(`#service-tab-${nextService.id}`)?.focus();
  };

  const handlePointerEnter = () => {
    pointerBoundsRef.current = stageRef.current?.getBoundingClientRect() ?? null;
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reducedMotionRef.current || event.pointerType === "touch") return;
    const bounds = pointerBoundsRef.current;
    const plane = planeRef.current;
    if (!bounds || !plane) return;
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    plane.style.setProperty("--pointer-x", x.toFixed(3));
    plane.style.setProperty("--pointer-y", y.toFixed(3));
  };

  const resetPointer = () => {
    pointerBoundsRef.current = null;
    planeRef.current?.style.setProperty("--pointer-x", "0");
    planeRef.current?.style.setProperty("--pointer-y", "0");
  };

  return (
    <section ref={sectionRef} id="live-preview" className="services-product-lab" aria-labelledby="services-system-heading">
      <div className="services-lab-environment" aria-hidden="true"><span /><span /><span /></div>
      <div className="services-lab-transition-line" aria-hidden="true"><i /></div>

      <div className="services-lab-inner">
        <header className="services-lab-heading">
          <div className="services-lab-eyebrow"><span>02 / SERVICES</span><i>MODULAR PRODUCT SYSTEMS</i></div>
          <div className="services-lab-heading-grid">
            <h2 id="services-system-heading">ONE SYSTEM.<br /><em>FOUR WAYS TO BUILD.</em></h2>
            <p>From launch-ready websites to intelligent products, we design and engineer the complete experience.</p>
          </div>
        </header>

        <div className="services-lab-layout">
          <div className="services-lab-index-column">
            <div className="services-lab-tabs" role="tablist" aria-label="Choose a service" aria-orientation="vertical">
              {SERVICES.map((service, index) => {
                const isActive = service.id === activeService;
                const isLocked = service.id === lockedService;
                return (
                  <button
                    id={`service-tab-${service.id}`}
                    key={service.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="services-system-panel"
                    className={`services-lab-tab${isActive ? " is-active" : ""}${isLocked ? " is-locked" : ""}`}
                    onMouseEnter={() => showService(service.id)}
                    onMouseLeave={() => showService(lockedServiceRef.current)}
                    onFocus={() => showService(service.id)}
                    onBlur={() => showService(lockedServiceRef.current)}
                    onClick={() => selectService(service.id)}
                    onKeyDown={(event) => handleKeyDown(event, index)}
                  >
                    <span className="services-tab-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="services-tab-copy"><strong>{service.name}</strong><small>{service.descriptor}</small></span>
                    <span className="services-tab-marker" aria-hidden="true"><i /><ArrowRight /></span>
                  </button>
                );
              })}
            </div>

            <div id="services-system-panel" className="services-lab-details" role="tabpanel" aria-live="polite" aria-labelledby={`service-tab-${activeService}`} tabIndex={0}>
              <dl>
                <div><dt>Best for</dt><dd>{selectedService.bestFor}</dd></div>
                <div><dt>Core build</dt><dd>{selectedService.coreBuild}</dd></div>
                <div><dt>Typical engagement</dt><dd>{selectedService.engagement}</dd></div>
              </dl>
            </div>
          </div>

          <div className="services-lab-stage-column">
            <div className="services-stage-label"><span>SYSTEM / {String(SERVICES.findIndex((service) => service.id === activeService) + 1).padStart(2, "0")}</span><i>SHARED MODULES / ACTIVE</i></div>
            <div
              ref={stageRef}
              className="services-system-stage"
              data-service={activeService}
              aria-hidden="true"
              onPointerEnter={handlePointerEnter}
              onPointerMove={handlePointerMove}
              onPointerLeave={resetPointer}
            >
              <svg className="services-system-guides" viewBox="0 0 1000 680" preserveAspectRatio="none" aria-hidden="true">
                <path d="M54 78H946M54 340H946M54 602H946M112 34V646M500 34V646M888 34V646" />
                <path d="M74 620L932 62M74 62L932 620" className="services-system-guides-diagonal" />
                <circle cx="500" cy="340" r="4" /><circle cx="112" cy="78" r="4" /><circle cx="888" cy="602" r="4" />
              </svg>
              <div className="services-system-axis services-system-axis--x" aria-hidden="true">X / CONFIGURATION</div>
              <div className="services-system-axis services-system-axis--y" aria-hidden="true">Y / STRUCTURE</div>

              <div ref={planeRef} className="services-system-plane">
                <NavigationModule activeService={activeService} />
                <HeroModule activeService={activeService} />
                <MediaModule activeService={activeService} />
                <RailModule activeService={activeService} />
                <ActionModule activeService={activeService} />
                <MobileModule activeService={activeService} />
              </div>
            </div>
            <div className="services-stage-footer"><span>DESIGN / ENGINEERING / MOTION</span><i /><span>SELECT A SYSTEM TO RECONFIGURE</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ServicesProductLab;
