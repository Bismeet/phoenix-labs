import { useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import "./Navbar.css";

const NAV_LINKS = [
  { label: "Home", href: "#hero-section-container", section: "home" },
  { label: "About", href: "#about", section: "about" },
  { label: "Services", href: "#services", section: "services" },
  { label: "Work", href: "#work", section: "work" },
  { label: "Process", href: "#process", section: "process" },
  { label: "Contact", href: "#contact", section: "contact" },
] as const;

const TRACKED_SECTIONS = [
  { id: "hero-section-container", navId: "home" },
  { id: "about", navId: "about" },
  { id: "services", navId: "services" },
  { id: "tech-stack", navId: "services" },
  { id: "live-preview", navId: "services" },
  { id: "work", navId: "work" },
  { id: "why-us", navId: "about" },
  { id: "process", navId: "process" },
  { id: "contact", navId: "contact" },
] as const;

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(() => window.scrollY > 64);
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeSectionRef = useRef("home");
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let crossedThreshold = window.scrollY > 64;
    const handleScroll = () => {
      const nextThreshold = window.scrollY > 64;
      if (nextThreshold !== crossedThreshold) {
        crossedThreshold = nextThreshold;
        setIsScrolled(nextThreshold);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const visibleSections = new Map<string, boolean>();
    const observedSections = TRACKED_SECTIONS.flatMap(({ id, navId }) => {
      const element = document.getElementById(id);
      return element ? [{ element, id, navId }] : [];
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => visibleSections.set(entry.target.id, entry.isIntersecting));

        const visible = observedSections
          .filter(({ id }) => visibleSections.get(id))
          .sort((a, b) => {
            const activationLine = window.innerHeight * 0.36;
            return Math.abs(a.element.getBoundingClientRect().top - activationLine)
              - Math.abs(b.element.getBoundingClientRect().top - activationLine);
          });

        const nextSection = visible[0]?.navId;
        if (nextSection && nextSection !== activeSectionRef.current) {
          activeSectionRef.current = nextSection;
          setActiveSection(nextSection);
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );

    observedSections.forEach(({ element }) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const firstLink = mobilePanelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    window.requestAnimationFrame(() => firstLink?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileMenuOpen(false);
        window.requestAnimationFrame(() => menuTriggerRef.current?.focus({ preventScroll: true }));
        return;
      }

      if (event.key !== "Tab") return;
      const controls = Array.from(
        mobilePanelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
      ).filter((control) => !control.hasAttribute("disabled"));
      if (!controls.length) return;

      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const desktopMedia = window.matchMedia("(min-width: 1121px)");
    const closeAtDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileMenuOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    desktopMedia.addEventListener("change", closeAtDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      desktopMedia.removeEventListener("change", closeAtDesktop);
    };
  }, [mobileMenuOpen]);

  const focusProjectSelector = () => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      document.getElementById("project-type-landing-page")?.focus({ preventScroll: true });
    }, reducedMotion ? 0 : 900);
  };

  const closeMobileMenu = (returnFocus = true) => {
    setMobileMenuOpen(false);
    if (returnFocus) {
      window.requestAnimationFrame(() => menuTriggerRef.current?.focus({ preventScroll: true }));
    }
  };
  const handleProjectClick = () => {
    closeMobileMenu(true);
    focusProjectSelector();
  };

  return (
    <nav
      className={`site-nav${isScrolled || mobileMenuOpen ? " is-scrolled" : ""}${mobileMenuOpen ? " is-menu-open" : ""}`}
      aria-label="Primary navigation"
    >
      <div className="site-nav__inner">
        <a className="site-nav__brand" href="#hero-section-container" aria-label="Phoenix Labs — back to home">
          <img src="/phoenix-icon.png" alt="" aria-hidden="true" />
          <span>PHOENIX LABS</span>
          <i aria-hidden="true" />
        </a>

        <div className="site-nav__desktop-links">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.section;
            return (
              <a
                key={link.section}
                href={link.href}
                className={isActive ? "is-active" : undefined}
                aria-current={isActive ? "location" : undefined}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        <div className="site-nav__actions">
          <a className="site-nav__view-work" href="#work">VIEW WORK</a>
          <div className="site-nav__project-actions">
            <a href="#contact" onClick={focusProjectSelector}>START A PROJECT</a>
            <a href="#contact" onClick={focusProjectSelector} aria-label="Start a project">
              <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>

        <button
          ref={menuTriggerRef}
          type="button"
          className="site-nav__menu-trigger"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-controls="mobile-navigation"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((current) => !current)}
        >
          {mobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div
          ref={mobilePanelRef}
          id="mobile-navigation"
          className="site-mobile-menu"
          data-lenis-prevent
        >
          <div className="site-mobile-menu__meta">
            <span>NAVIGATION</span>
            <span>PHOENIX LABS / 2026</span>
          </div>

          <div className="site-mobile-menu__links">
            {NAV_LINKS.map((link, index) => {
              const isActive = activeSection === link.section;
              return (
                <a
                  key={link.section}
                  href={link.href}
                  className={isActive ? "is-active" : undefined}
                  aria-current={isActive ? "location" : undefined}
                  onClick={() => closeMobileMenu(true)}
                >
                  <span>0{index + 1}</span>
                  {link.label}
                  <i aria-hidden="true" />
                </a>
              );
            })}
          </div>

          <div className="site-mobile-menu__footer">
            <a className="site-mobile-menu__cta" href="#contact" onClick={handleProjectClick}>
              START A PROJECT <ArrowRight aria-hidden="true" />
            </a>
            <a className="site-mobile-menu__email" href="mailto:labsphoenix1@gmail.com">
              labsphoenix1@gmail.com
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
