import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import emailjs from "@emailjs/browser";
import { ArrowLeft, ArrowRight, Check, LoaderCircle, Mail } from "lucide-react";
import "./StartProjectSection.css";

const CONTACT_EMAIL = "labsphoenix1@gmail.com";
const GITHUB_URL = "https://github.com/Bismeet";
const INSTAGRAM_URL = "https://www.instagram.com/phoenixlabs.in?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==";

function GithubMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function InstagramMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

const PROJECT_TYPES = [
  { id: "landing-page", label: "Landing page", description: "A focused launch or campaign." },
  { id: "business-website", label: "Business website", description: "A clear multi-page company presence." },
  { id: "web-application", label: "Web application", description: "An interactive workflow or platform." },
  { id: "saas-product", label: "SaaS product", description: "A subscription product or service." },
  { id: "ai-tool", label: "AI tool", description: "An AI-led product or automation." },
  { id: "something-else", label: "Something else", description: "A different kind of digital brief." },
] as const;

const SCOPE_OPTIONS = [
  { id: "focused", label: "Focused", description: "One clear page, workflow or launch objective." },
  { id: "standard", label: "Standard", description: "A multi-page site or product with several core features." },
  { id: "extensive", label: "Extensive", description: "A larger platform, application or custom system." },
] as const;

const TIMELINE_OPTIONS = ["Flexible", "1–2 months", "2–4 months", "Not sure yet"] as const;
const REQUIREMENT_OPTIONS = [
  { id: "content-management", label: "Content management" },
  { id: "authentication", label: "Authentication" },
  { id: "payments", label: "Payments" },
  { id: "admin-tools", label: "Admin tools" },
  { id: "integrations", label: "Third-party integrations" },
  { id: "ai-functionality", label: "AI functionality" },
  { id: "motion", label: "Motion and interaction" },
  { id: "not-sure", label: "Not sure yet" },
] as const;

const BUDGET_OPTIONS = [
  "Under ₹25,000",
  "₹25,000–₹50,000",
  "₹50,000–₹1,00,000",
  "₹1,00,000+",
  "Not sure yet",
] as const;

interface ProjectBrief {
  projectType: string;
  scope: string;
  timeline: string;
  requirements: string[];
  name: string;
  email: string;
  company: string;
  website: string;
  budget: string;
  description: string;
}

type ErrorKey = "projectType" | "scope" | "timeline" | "name" | "email" | "budget" | "description";
type FormErrors = Partial<Record<ErrorKey, string>>;
type SubmissionState = "idle" | "sending" | "success" | "error";

const INITIAL_BRIEF: ProjectBrief = {
  projectType: "",
  scope: "",
  timeline: "",
  requirements: [],
  name: "",
  email: "",
  company: "",
  website: "",
  budget: "",
  description: "",
};

function optionLabel<T extends readonly { id: string; label: string }[]>(options: T, value: string) {
  return options.find((option) => option.id === value)?.label ?? "Not selected";
}

function StartProjectSection() {
  const [step, setStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [brief, setBrief] = useState<ProjectBrief>(INITIAL_BRIEF);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submission, setSubmission] = useState<SubmissionState>("idle");
  const [submissionMessage, setSubmissionMessage] = useState("");
  const stepHeadingRefs = useRef<Array<HTMLHeadingElement | null>>([]);
  const submissionInFlightRef = useRef(false);

  const clearError = (key: ErrorKey) => {
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handleTextChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const key = event.target.name as keyof ProjectBrief;
    const value = event.target.value;
    setBrief((current) => ({ ...current, [key]: value }));
    if (["name", "email", "budget", "description"].includes(key)) clearError(key as ErrorKey);
    if (submission === "error") setSubmission("idle");
  };

  const selectSingle = (key: "projectType" | "scope" | "timeline", value: string) => {
    setBrief((current) => ({ ...current, [key]: value }));
    clearError(key);
  };

  const toggleRequirement = (value: string) => {
    setBrief((current) => {
      if (value === "not-sure") {
        return { ...current, requirements: current.requirements.includes(value) ? [] : [value] };
      }
      const withoutUnsure = current.requirements.filter((item) => item !== "not-sure");
      return {
        ...current,
        requirements: withoutUnsure.includes(value)
          ? withoutUnsure.filter((item) => item !== value)
          : [...withoutUnsure, value],
      };
    });
  };

  const validateStep = (stepIndex: number) => {
    const nextErrors: FormErrors = {};

    if (stepIndex === 0 && !brief.projectType) {
      nextErrors.projectType = "Choose the product type that best matches the project.";
    }

    if (stepIndex === 1) {
      if (!brief.scope) nextErrors.scope = "Choose an approximate scope size.";
      if (!brief.timeline) nextErrors.timeline = "Choose the closest timeline option.";
    }

    if (stepIndex === 2) {
      if (!brief.name.trim()) nextErrors.name = "Enter your name.";
      if (!brief.email.trim()) {
        nextErrors.email = "Enter your email address.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(brief.email.trim())) {
        nextErrors.email = "Enter a valid email address.";
      }
      if (!brief.budget) nextErrors.budget = "Choose an approximate budget range.";
      if (brief.description.trim().length < 20) {
        nextErrors.description = "Tell us a little more about the project (at least 20 characters).";
      }
    }

    setErrors((current) => ({ ...current, ...nextErrors }));
    const firstError = Object.keys(nextErrors)[0] as ErrorKey | undefined;
    if (firstError) {
      const focusTarget = firstError === "projectType"
        ? "project-type-landing-page"
        : firstError === "scope"
          ? "scope-focused"
          : firstError === "timeline"
            ? "timeline-flexible"
            : `brief-${firstError}`;
      window.requestAnimationFrame(() => document.getElementById(focusTarget)?.focus({ preventScroll: true }));
      return false;
    }
    return true;
  };

  const moveToStep = (nextStep: number) => {
    setStep(nextStep);
    window.requestAnimationFrame(() => stepHeadingRefs.current[nextStep]?.focus({ preventScroll: true }));
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    const nextStep = Math.min(2, step + 1);
    setFurthestStep((current) => Math.max(current, nextStep));
    moveToStep(nextStep);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submission === "sending" || submissionInFlightRef.current) return;
    if (!validateStep(2)) return;

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (!serviceId || !templateId || !publicKey) {
      setSubmission("error");
      setSubmissionMessage(`The project brief service is unavailable right now. Please email ${CONTACT_EMAIL} directly.`);
      return;
    }

    submissionInFlightRef.current = true;
    setSubmission("sending");
    setSubmissionMessage("");

    const projectType = optionLabel(PROJECT_TYPES, brief.projectType);
    const scope = optionLabel(SCOPE_OPTIONS, brief.scope);
    const requirements = brief.requirements.length
      ? brief.requirements.map((item) => optionLabel(REQUIREMENT_OPTIONS, item)).join(", ")
      : "None selected";
    const message = [
      `Project type: ${projectType}`,
      `Scope: ${scope}`,
      `Timeline: ${brief.timeline}`,
      `Requirements: ${requirements}`,
      `Budget: ${brief.budget}`,
      `Company or brand: ${brief.company || "Not provided"}`,
      `Existing website or profile: ${brief.website || "Not provided"}`,
      "",
      brief.description.trim(),
    ].join("\n");

    try {
      const response = await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: brief.name.trim(),
          user_name: brief.name.trim(),
          name: brief.name.trim(),
          from_email: brief.email.trim(),
          user_email: brief.email.trim(),
          email: brief.email.trim(),
          reply_to: brief.email.trim(),
          to_name: "Phoenix Labs",
          to_email: CONTACT_EMAIL,
          company: brief.company.trim() || "Not provided",
          website: brief.website.trim() || "Not provided",
          project_type: projectType,
          scope,
          timeline: brief.timeline,
          requirements,
          budget: brief.budget,
          project_description: brief.description.trim(),
          subject: `New Phoenix Labs project brief — ${projectType}`,
          message,
        },
        { publicKey },
      );

      if (response.status !== 200) throw new Error("Submission was not confirmed");
      setSubmission("success");
      setSubmissionMessage("We'll review the details and get back to you with the next step.");
    } catch {
      setSubmission("error");
      setSubmissionMessage(`We couldn't send the brief. Your answers are still here—please try again or email ${CONTACT_EMAIL}.`);
    } finally {
      submissionInFlightRef.current = false;
    }
  };

  const requirementSummary = brief.requirements.length
    ? brief.requirements.map((item) => optionLabel(REQUIREMENT_OPTIONS, item)).join(", ")
    : "None selected";

  return (
    <section id="contact" className="start-project" aria-labelledby="start-project-heading">
      <div className="start-project__path-entry" aria-hidden="true"><i /><span /></div>

      <header className="start-project__header">
        <div className="start-project__eyebrow"><i />06 / START A PROJECT</div>
        <div className="start-project__heading-copy">
          <h2 id="start-project-heading">TELL US<br /><em>WHAT YOU'RE BUILDING.</em></h2>
          <p>Share the direction, scope and timeline. We'll review it and respond with the clearest next step.</p>
          <small>No sales script. No obligation. Just a focused conversation about the project.</small>
        </div>
      </header>

      <div className="start-project__layout">
        <aside className="start-project__context" aria-label="Project enquiry context">
          <img className="start-project__phoenix" src="/phoenix-icon.png" alt="" aria-hidden="true" draggable="false" />
          <div className="start-project__context-copy">
            <span className="start-project__context-label">THE STARTING POINT</span>
            <h3>GOOD PRODUCTS<br />START WITH<br /><em>CLEAR DIRECTION.</em></h3>
            <p>A few details help us understand what the product needs, where it stands and how we can help.</p>
          </div>

          <div className="start-project__contact-list">
            <span>CONTACT</span>
            <a href={`mailto:${CONTACT_EMAIL}`}><Mail aria-hidden="true" />{CONTACT_EMAIL}</a>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer"><GithubMark />GitHub / Bismeet</a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"><InstagramMark />Instagram / @phoenixlabs.in</a>
          </div>
        </aside>

        <form className="start-project__form" onSubmit={handleSubmit} noValidate>
          {submission === "success" ? (
            <div className="start-project__success" role="status" aria-live="polite">
              <span><Check aria-hidden="true" /></span>
              <small>PROJECT BRIEF / CONFIRMED</small>
              <h3>BRIEF RECEIVED.</h3>
              <p>{submissionMessage}</p>
              <a href={`mailto:${CONTACT_EMAIL}`}>EMAIL US DIRECTLY <ArrowRight aria-hidden="true" /></a>
            </div>
          ) : (
            <>
              <div className="start-project__progress" aria-label={`Step ${step + 1} of 3`}>
                <div className="start-project__progress-meta">
                  <span>{String(step + 1).padStart(2, "0")} / 03</span>
                  <span>{step === 0 ? "DIRECTION" : step === 1 ? "SCOPE" : "CONTACT"}</span>
                </div>
                <div className="start-project__progress-track"><i style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>
                <div className="start-project__step-tabs">
                  {["What", "Scope", "Details"].map((label, index) => (
                    <button
                      key={label}
                      type="button"
                      className={index === step ? "is-active" : index < step ? "is-complete" : ""}
                      disabled={index > furthestStep}
                      aria-current={index === step ? "step" : undefined}
                      onClick={() => moveToStep(index)}
                    >
                      <span>0{index + 1}</span>{label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="start-project__steps">
                <section className="start-project__step" hidden={step !== 0} aria-labelledby="brief-step-1">
                  <div className="start-project__step-heading">
                    <span>STEP 01</span>
                    <h3 ref={(node) => { stepHeadingRefs.current[0] = node; }} id="brief-step-1" tabIndex={-1}>What are you building?</h3>
                    <p>Choose the closest fit. You can add the details later.</p>
                  </div>
                  <fieldset className="start-project__fieldset" aria-describedby={errors.projectType ? "project-type-error" : undefined}>
                    <legend className="start-project__sr-only">Project type</legend>
                    <div className="start-project__product-options">
                      {PROJECT_TYPES.map((option) => (
                        <label key={option.id} className="start-project__choice">
                          <input
                            id={`project-type-${option.id}`}
                            className="start-project__control-input"
                            type="radio"
                            name="projectType"
                            value={option.id}
                            checked={brief.projectType === option.id}
                            onChange={() => selectSingle("projectType", option.id)}
                          />
                          <span className="start-project__choice-content">
                            <i aria-hidden="true"><Check /></i>
                            <strong>{option.label}</strong>
                            <small>{option.description}</small>
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors.projectType && <p id="project-type-error" className="start-project__error">{errors.projectType}</p>}
                  </fieldset>
                </section>

                <section className="start-project__step" hidden={step !== 1} aria-labelledby="brief-step-2">
                  <div className="start-project__step-heading">
                    <span>STEP 02</span>
                    <h3 ref={(node) => { stepHeadingRefs.current[1] = node; }} id="brief-step-2" tabIndex={-1}>What does it need?</h3>
                    <p>Set a useful starting point without locking the project into a false estimate.</p>
                  </div>

                  <fieldset className="start-project__fieldset" aria-describedby={errors.scope ? "scope-error" : undefined}>
                    <legend>Scope size</legend>
                    <div className="start-project__scope-options">
                      {SCOPE_OPTIONS.map((option) => (
                        <label key={option.id} className="start-project__choice start-project__choice--scope">
                          <input
                            id={`scope-${option.id}`}
                            className="start-project__control-input"
                            type="radio"
                            name="scope"
                            value={option.id}
                            checked={brief.scope === option.id}
                            onChange={() => selectSingle("scope", option.id)}
                          />
                          <span className="start-project__choice-content">
                            <i aria-hidden="true"><Check /></i>
                            <strong>{option.label}</strong>
                            <small>{option.description}</small>
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors.scope && <p id="scope-error" className="start-project__error">{errors.scope}</p>}
                  </fieldset>

                  <fieldset className="start-project__fieldset" aria-describedby={errors.timeline ? "timeline-error" : undefined}>
                    <legend>Timeline</legend>
                    <div className="start-project__timeline-options">
                      {TIMELINE_OPTIONS.map((option, index) => (
                        <label key={option} className="start-project__compact-choice">
                          <input
                            id={index === 0 ? "timeline-flexible" : undefined}
                            className="start-project__control-input"
                            type="radio"
                            name="timeline"
                            value={option}
                            checked={brief.timeline === option}
                            onChange={() => selectSingle("timeline", option)}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                    {errors.timeline && <p id="timeline-error" className="start-project__error">{errors.timeline}</p>}
                  </fieldset>

                  <fieldset className="start-project__fieldset">
                    <legend>Requirements <small>Choose any that apply</small></legend>
                    <div className="start-project__chips">
                      {REQUIREMENT_OPTIONS.map((option) => (
                        <label key={option.id} className="start-project__chip">
                          <input
                            className="start-project__control-input"
                            type="checkbox"
                            value={option.id}
                            checked={brief.requirements.includes(option.id)}
                            onChange={() => toggleRequirement(option.id)}
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </section>

                <section className="start-project__step" hidden={step !== 2} aria-labelledby="brief-step-3">
                  <div className="start-project__step-heading">
                    <span>STEP 03</span>
                    <h3 ref={(node) => { stepHeadingRefs.current[2] = node; }} id="brief-step-3" tabIndex={-1}>Tell us about the project.</h3>
                    <p>Give us enough context to make the first conversation useful.</p>
                  </div>

                  <div className="start-project__fields">
                    <div className="start-project__field">
                      <label htmlFor="brief-name">Name <span aria-hidden="true">*</span></label>
                      <input id="brief-name" name="name" autoComplete="name" value={brief.name} onChange={handleTextChange} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "brief-name-error" : undefined} />
                      {errors.name && <p id="brief-name-error" className="start-project__error">{errors.name}</p>}
                    </div>
                    <div className="start-project__field">
                      <label htmlFor="brief-email">Email <span aria-hidden="true">*</span></label>
                      <input id="brief-email" name="email" type="email" inputMode="email" autoComplete="email" value={brief.email} onChange={handleTextChange} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "brief-email-error" : undefined} />
                      {errors.email && <p id="brief-email-error" className="start-project__error">{errors.email}</p>}
                    </div>
                    <div className="start-project__field">
                      <label htmlFor="brief-company">Company or brand <small>Optional</small></label>
                      <input id="brief-company" name="company" autoComplete="organization" value={brief.company} onChange={handleTextChange} />
                    </div>
                    <div className="start-project__field">
                      <label htmlFor="brief-website">Existing website or profile <small>Optional</small></label>
                      <input id="brief-website" name="website" inputMode="url" value={brief.website} onChange={handleTextChange} />
                    </div>
                    <div className="start-project__field start-project__field--full">
                      <label htmlFor="brief-budget">Approximate budget <span aria-hidden="true">*</span></label>
                      <select id="brief-budget" name="budget" value={brief.budget} onChange={handleTextChange} aria-invalid={Boolean(errors.budget)} aria-describedby={errors.budget ? "brief-budget-error" : undefined}>
                        <option value="">Choose a range</option>
                        {BUDGET_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                      {errors.budget && <p id="brief-budget-error" className="start-project__error">{errors.budget}</p>}
                    </div>
                    <div className="start-project__field start-project__field--full">
                      <label htmlFor="brief-description">Project description <span aria-hidden="true">*</span></label>
                      <textarea id="brief-description" name="description" rows={5} value={brief.description} onChange={handleTextChange} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? "brief-description-error" : "brief-description-help"} />
                      <small id="brief-description-help">What are you creating, who is it for, and what should it help them do?</small>
                      {errors.description && <p id="brief-description-error" className="start-project__error">{errors.description}</p>}
                    </div>
                  </div>

                  <div className="start-project__summary">
                    <span>YOUR BRIEF</span>
                    <dl>
                      <div><dt>Product type</dt><dd>{optionLabel(PROJECT_TYPES, brief.projectType)}</dd></div>
                      <div><dt>Scope</dt><dd>{optionLabel(SCOPE_OPTIONS, brief.scope)}</dd></div>
                      <div><dt>Timeline</dt><dd>{brief.timeline || "Not selected"}</dd></div>
                      <div><dt>Requirements</dt><dd>{requirementSummary}</dd></div>
                    </dl>
                  </div>
                </section>
              </div>

              <div className="start-project__form-actions">
                {step > 0 ? (
                  <button type="button" className="start-project__back" onClick={() => moveToStep(step - 1)}>
                    <ArrowLeft aria-hidden="true" />BACK
                  </button>
                ) : <span />}
                {step < 2 ? (
                  <button type="button" className="start-project__next" onClick={handleNext}>
                    NEXT STEP<ArrowRight aria-hidden="true" />
                  </button>
                ) : (
                  <button type="submit" className="start-project__submit" disabled={submission === "sending"}>
                    {submission === "sending" ? <><LoaderCircle className="is-spinning" aria-hidden="true" />SENDING BRIEF</> : <>SEND PROJECT BRIEF<ArrowRight aria-hidden="true" /></>}
                  </button>
                )}
              </div>

              {submission === "error" && (
                <p className="start-project__submission-error" role="alert">
                  {submissionMessage} <a href={`mailto:${CONTACT_EMAIL}`}>Email us directly.</a>
                </p>
              )}
            </>
          )}
        </form>
      </div>

      <footer className="start-project__footer">
        <div className="start-project__footer-brand">
          <img src="/phoenix-icon.png" alt="" />
          <div><strong>PHOENIX LABS</strong><span>Digital products designed and built with intent.</span></div>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#about">About</a><a href="#services">Services</a><a href="#work">Work</a><a href="#process">Process</a><a href="#contact">Contact</a>
        </nav>
        <div className="start-project__footer-socials">
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="Phoenix Labs on GitHub"><GithubMark /></a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Phoenix Labs on Instagram"><InstagramMark /></a>
          <a href={`mailto:${CONTACT_EMAIL}`} aria-label="Email Phoenix Labs"><Mail /></a>
        </div>
        <div className="start-project__footer-bottom">
          <span>© {new Date().getFullYear()} Phoenix Labs</span>
          <span>Websites · Web applications · Digital products</span>
        </div>
      </footer>
    </section>
  );
}

export default StartProjectSection;
