import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Expand, X } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./FeaturedWorkReel.css";

gsap.registerPlugin(ScrollTrigger);

interface ProjectDefinition {
  id: string;
  title: string;
  category: string;
  description: string;
  tech: string[];
  highlights: string[];
  gallery: string[];
  previewIndex: number;
  supportingIndex?: number;
  imageDescription: string;
}

const PROJECTS: ProjectDefinition[] = [
  {
    id: "bmw-m5",
    title: "BMW M5 Experience",
    category: "Interactive Web Experience",
    description: "A cinematic product website presenting the BMW M5 through full-width vehicle imagery, editorial storytelling and interactive model exploration.",
    tech: ["React", "Three.js", "Tailwind CSS", "Vite"],
    highlights: [
      "Full-width vehicle storytelling across performance and design sections",
      "Interactive colour and wheel configuration experience",
      "Responsive navigation and cinematic content transitions",
    ],
    gallery: [
      "/gallery/bmw-m5-1.png", "/gallery/bmw-m5-2.png", "/gallery/bmw-m5-3.png", "/gallery/bmw-m5-4.png", "/gallery/bmw-m5-5.png",
      "/gallery/bmw-m5-6.png", "/gallery/bmw-m5-7.png", "/gallery/bmw-m5-8.png", "/gallery/bmw-m5-9.png", "/gallery/bmw-m5-10.png",
    ],
    previewIndex: 0,
    supportingIndex: 5,
    imageDescription: "BMW M5 website showing the vehicle hero and editorial product experience",
  },
  {
    id: "one-piece",
    title: "One Piece Experience",
    category: "Cinematic Web Experience",
    description: "An immersive story-led website exploring the world and characters of One Piece through bold typography, scene-based sections and expressive motion.",
    tech: ["Next.js", "Web Audio", "Canvas API", "GSAP"],
    highlights: [
      "Narrative chapters built around character and story artwork",
      "Motion-led transitions across the interactive experience",
      "Audio and canvas elements supporting world exploration",
    ],
    gallery: [
      "/gallery/one-piece-1.png", "/gallery/one-piece-2.png", "/gallery/one-piece-3.png", "/gallery/one-piece-4.png", "/gallery/one-piece-5.png",
    ],
    previewIndex: 0,
    supportingIndex: 2,
    imageDescription: "One Piece cinematic website featuring Monkey D. Luffy and story artwork",
  },
  {
    id: "n-queen",
    title: "N-Queen Solver",
    category: "Algorithm Visualizer",
    description: "An interactive learning workspace that makes recursive backtracking visible through an adjustable chessboard, solver controls and structured insights.",
    tech: ["TypeScript", "HTML5 Canvas", "Tailwind CSS"],
    highlights: [
      "Adjustable board size and solver strategy controls",
      "Step-by-step backtracking and board-state visualization",
      "Dedicated learning and exploration views for the algorithm",
    ],
    gallery: [
      "/gallery/n-queen-1.png", "/gallery/n-queen-2.png", "/gallery/n-queen-3.png", "/gallery/n-queen-4.png", "/gallery/n-queen-5.png",
    ],
    previewIndex: 1,
    supportingIndex: 3,
    imageDescription: "N-Queen solver workspace showing a solved board and algorithm controls",
  },
  {
    id: "desert-ai",
    title: "Desert Image Segmentation AI",
    category: "Computer Vision Application",
    description: "A terrain-segmentation application designed to compare source imagery with model-generated masks for sand, rock and vegetation regions.",
    tech: ["Python", "PyTorch", "ONNX Runtime", "React"],
    highlights: [
      "Client-side terrain segmentation workflow",
      "Input and segmentation-mask comparison",
      "Model integration through ONNX Runtime",
    ],
    gallery: [],
    previewIndex: 0,
    imageDescription: "Desert image segmentation project",
  },
  {
    id: "campus-assistant",
    title: "AI Campus Assistant",
    category: "AI Product",
    description: "A student productivity platform bringing academic monitoring, subject analysis, study recommendations and assistant workflows into one application.",
    tech: ["Next.js", "FastAPI", "VectorDB", "OpenAI API"],
    highlights: [
      "Subject-level academic monitoring and study planning",
      "Resource and video recommendations within the workspace",
      "Assistant workflows connected to campus knowledge",
    ],
    gallery: [
      "/gallery/campus-ai-1.png", "/gallery/campus-ai-2.png", "/gallery/campus-ai-3.png", "/gallery/campus-ai-4.png", "/gallery/campus-ai-5.png",
      "/gallery/campus-ai-6.png", "/gallery/campus-ai-7.png", "/gallery/campus-ai-8.png", "/gallery/campus-ai-9.png", "/gallery/campus-ai-10.png",
    ],
    previewIndex: 0,
    supportingIndex: 7,
    imageDescription: "CampusMind AI product showing the academic assistant landing experience",
  },
];

interface ProjectGalleryProps {
  project: ProjectDefinition;
  imageIndex: number;
  onIndexChange: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
}

function ProjectGallery({ project, imageIndex, onIndexChange, onClose }: ProjectGalleryProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const closeRef = useRef(onClose);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const imageCount = project.gallery.length;
  const currentImage = project.gallery[imageIndex];

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  const showPrevious = () => {
    onIndexChange((current) => (current - 1 + imageCount) % imageCount);
  };

  const showNext = () => {
    onIndexChange((current) => (current + 1) % imageCount);
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }

      if (event.key === "ArrowLeft" && imageCount > 1) {
        event.preventDefault();
        onIndexChange((current) => (current - 1 + imageCount) % imageCount);
        return;
      }

      if (event.key === "ArrowRight" && imageCount > 1) {
        event.preventDefault();
        onIndexChange((current) => (current + 1) % imageCount);
        return;
      }

      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>("button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [imageCount, onIndexChange]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch") return;
    touchStartXRef.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch" || touchStartXRef.current === null) return;
    const distance = event.clientX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(distance) < 48 || imageCount < 2) return;
    if (distance > 0) showPrevious();
    else showNext();
  };

  return createPortal(
    <div className="work-gallery-backdrop" onPointerDown={(event) => event.target === event.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        className="work-gallery-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="work-gallery-title"
        data-lenis-prevent
      >
        <header className="work-gallery-header">
          <div>
            <span>PROJECT GALLERY</span>
            <h3 id="work-gallery-title">{project.title}</h3>
          </div>
          <div className="work-gallery-header-meta">
            <span>{String(imageIndex + 1).padStart(2, "0")} / {String(imageCount).padStart(2, "0")}</span>
            <button ref={closeButtonRef} type="button" onClick={onClose} aria-label={`Close ${project.title} gallery`}>
              <X aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="work-gallery-stage" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerCancel={() => { touchStartXRef.current = null; }}>
          {failedImage === currentImage ? (
            <div className="work-gallery-error" role="status">This screenshot could not be loaded.</div>
          ) : (
            <img
              key={currentImage}
              src={currentImage}
              alt={`${project.title} screenshot ${imageIndex + 1} of ${imageCount}`}
              width="1024"
              height="465"
              draggable="false"
              onError={() => setFailedImage(currentImage)}
            />
          )}

          {imageCount > 1 && (
            <>
              <button className="work-gallery-arrow work-gallery-arrow--previous" type="button" onClick={showPrevious} aria-label="Previous screenshot">
                <ArrowLeft aria-hidden="true" />
              </button>
              <button className="work-gallery-arrow work-gallery-arrow--next" type="button" onClick={showNext} aria-label="Next screenshot">
                <ArrowRight aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        <footer className="work-gallery-footer">
          <div className="work-gallery-thumbnails" aria-label="Choose a screenshot">
            {project.gallery.map((image, index) => (
              <button
                key={image}
                type="button"
                className={index === imageIndex ? "is-active" : ""}
                onClick={() => onIndexChange(index)}
                aria-label={`Show screenshot ${index + 1}`}
                aria-current={index === imageIndex ? "true" : undefined}
              >
                <img src={image} alt="" width="160" height="73" loading="lazy" />
              </button>
            ))}
          </div>
          <span className="work-gallery-hint">← → Navigate · ESC Close · Swipe on touch</span>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

function FeaturedWorkReel() {
  const sectionRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const [activeProject, setActiveProject] = useState(PROJECTS[0].id);
  const [galleryProject, setGalleryProject] = useState<ProjectDefinition | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const openGallery = (project: ProjectDefinition, button: HTMLButtonElement) => {
    if (project.gallery.length === 0) return;
    openerRef.current = button;
    setGalleryIndex(project.previewIndex);
    setGalleryProject(project);
  };

  const closeGallery = () => {
    setGalleryProject(null);
    window.requestAnimationFrame(() => openerRef.current?.focus());
  };

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const context = gsap.context(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const chapters = gsap.utils.toArray<HTMLElement>(".work-reel-chapter");

      chapters.forEach((chapter) => {
        const projectId = chapter.dataset.projectId ?? PROJECTS[0].id;
        const meta = chapter.querySelector(".work-project-meta");
        const title = chapter.querySelector(".work-project-title");
        const body = chapter.querySelector(".work-project-body");
        const visual = chapter.querySelector(".work-project-visual-mask");
        const support = chapter.querySelector(".work-project-supporting");
        const progress = chapter.querySelector(".work-project-progress i");
        const reversed = chapter.classList.contains("work-reel-chapter--reverse");

        if (reducedMotion) {
          gsap.set([meta, title, body, visual, support], { clearProps: "all", autoAlpha: 1 });
          gsap.set(progress, { scaleX: 1 });
          return;
        }

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: chapter,
            start: "top 82%",
            end: "top 28%",
            scrub: 0.65,
            invalidateOnRefresh: true,
            onEnter: () => setActiveProject(projectId),
            onEnterBack: () => setActiveProject(projectId),
          },
        });

        timeline
          .fromTo(meta, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.22, ease: "power2.out" }, 0)
          .fromTo(progress, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "none" }, 0)
          .fromTo(
            visual,
            { clipPath: reversed ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" },
            { clipPath: "inset(0 0% 0 0%)", duration: 0.7, ease: "power3.inOut" },
            0.08,
          )
          .fromTo(title, { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0.28)
          .fromTo(body, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }, 0.4);

        if (support) {
          timeline.fromTo(support, { autoAlpha: 0, y: 38 }, { autoAlpha: 1, y: 0, duration: 0.42, ease: "power2.out" }, 0.42);
        }
      });
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section ref={sectionRef} id="work" className="work-reel" aria-labelledby="work-reel-heading">
      <div className="work-reel-background" aria-hidden="true" />
      <div className="work-reel-transition" aria-hidden="true"><i /></div>

      <div className="work-reel-inner">
        <header className="work-reel-intro">
          <div className="work-reel-eyebrow"><span>03 / SELECTED WORK</span><i>REAL PROJECTS / REAL INTERFACES</i></div>
          <div className="work-reel-intro-grid">
            <h2 id="work-reel-heading">BUILT FOR<br /><em>THE REAL WORLD.</em></h2>
            <div>
              <p>Selected websites, interactive experiences and intelligent products designed and developed by Phoenix Labs.</p>
              <span>Explore the work. Open any available project to view the full experience.</span>
            </div>
          </div>
        </header>

        <nav className="work-project-rail" aria-label="Selected project index">
          {PROJECTS.map((project, index) => (
            <a
              key={project.id}
              href={`#work-${project.id}`}
              className={activeProject === project.id ? "is-active" : ""}
              aria-current={activeProject === project.id ? "true" : undefined}
              aria-label={`Go to project ${index + 1}: ${project.title}`}
            >
              <span>{String(index + 1).padStart(2, "0")}</span><i />
            </a>
          ))}
        </nav>

        <div className="work-reel-projects">
          {PROJECTS.map((project, index) => {
            const mainImage = project.gallery[project.previewIndex];
            const supportingImage = project.supportingIndex === undefined ? undefined : project.gallery[project.supportingIndex];
            return (
              <article
                id={`work-${project.id}`}
                key={project.id}
                className={`work-reel-chapter${index % 2 === 1 ? " work-reel-chapter--reverse" : ""}`}
                data-project-id={project.id}
                data-project-theme={project.id}
              >
                <div className="work-project-visual">
                  <div className="work-project-visual-mask">
                    {mainImage ? (
                      <figure className="work-project-main-frame">
                        <img
                          src={mainImage}
                          alt={project.imageDescription}
                          width="1024"
                          height="465"
                          loading="lazy"
                          decoding="async"
                        />
                        <figcaption>{String(index + 1).padStart(2, "0")} / PRIMARY VIEW</figcaption>
                      </figure>
                    ) : (
                      <div className="work-project-archive-note">
                        <span>PROJECT ARCHIVE / IMAGE ASSETS MISSING</span>
                        <strong>The project remains part of the Phoenix Labs archive, but its configured screenshots are not present in this repository.</strong>
                        <p>Broken gallery requests have been removed.</p>
                      </div>
                    )}
                  </div>

                  {supportingImage && (
                    <figure className="work-project-supporting" aria-label={`Supporting view of ${project.title}`}>
                      <img src={supportingImage} alt={`${project.title} supporting interface view`} width="1024" height="465" loading="lazy" decoding="async" />
                    </figure>
                  )}
                  <span className="work-project-coordinate" aria-hidden="true">FRAME / {String(index + 1).padStart(2, "0")}</span>
                </div>

                <div className="work-project-copy">
                  <div className="work-project-meta">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <i />
                    <span>{project.category}</span>
                  </div>
                  <h3 className="work-project-title">{project.title}</h3>
                  <div className="work-project-body">
                    <p>{project.description}</p>
                    <div className="work-project-tech" aria-label="Technologies used">
                      {project.tech.map((technology) => <span key={technology}>{technology}</span>)}
                    </div>
                    <ul>
                      {project.highlights.map((highlight) => <li key={highlight}><i aria-hidden="true" />{highlight}</li>)}
                    </ul>
                    {project.gallery.length > 0 ? (
                      <button type="button" className="work-project-button" onClick={(event) => openGallery(project, event.currentTarget)}>
                        <span>View project</span><Expand aria-hidden="true" />
                      </button>
                    ) : (
                      <span className="work-project-unavailable">Gallery unavailable — screenshot files not found</span>
                    )}
                  </div>
                  <div className="work-project-progress" aria-hidden="true"><i /></div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {galleryProject && (
        <ProjectGallery project={galleryProject} imageIndex={galleryIndex} onIndexChange={setGalleryIndex} onClose={closeGallery} />
      )}
    </section>
  );
}

export default FeaturedWorkReel;
