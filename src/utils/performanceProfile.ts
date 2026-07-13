export type PerformanceTier = "low" | "balanced" | "high";

export function getPerformanceTier(): PerformanceTier {
  if (typeof window === "undefined" || typeof navigator === "undefined") return "high";

  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency || 8;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  if (reducedMotion || coarsePointer || memory <= 4 || cores <= 4 || window.innerWidth < 700) return "low";
  if (memory <= 8 || cores <= 8 || window.innerWidth < 1200 || window.devicePixelRatio > 1.5) return "balanced";
  return "high";
}
