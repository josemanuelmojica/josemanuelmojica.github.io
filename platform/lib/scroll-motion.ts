export interface ScrollProgressAnchor { raw: number; visual: number }

export function clampScrollProgress(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
}

/** Rebase native scrolling around a frozen composition, retaining both endpoints. */
export function rebaseScrollProgress(raw: number, anchor: ScrollProgressAnchor | null): number {
  const progress = clampScrollProgress(raw);
  if (!anchor) return progress;
  const pivot = clampScrollProgress(anchor.raw);
  const held = clampScrollProgress(anchor.visual);
  if (pivot <= 0 || pivot >= 1) return progress;
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;
  if (progress === pivot) return held;
  return progress < pivot
    ? (pivot > 0 ? progress / pivot * held : 0)
    : held + (pivot < 1 ? (progress - pivot) / (1 - pivot) * (1 - held) : 0);
}

/** The inverse mapping lets chapter buttons seek to the same visual beat after a pause. */
export function rawScrollProgressForVisual(visual: number, anchor: ScrollProgressAnchor | null): number {
  const progress = clampScrollProgress(visual);
  if (!anchor) return progress;
  const pivot = clampScrollProgress(anchor.raw);
  const held = clampScrollProgress(anchor.visual);
  if (pivot <= 0 || pivot >= 1) return progress;
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;
  if (progress === held) return pivot;
  return progress < held
    ? (held > 0 ? progress / held * pivot : 0)
    : pivot + (held < 1 ? (progress - held) / (1 - held) * (1 - pivot) : 0);
}
