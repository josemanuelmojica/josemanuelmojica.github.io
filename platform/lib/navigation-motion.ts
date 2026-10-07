export interface NavigationScrollState {
  y: number;
  direction: -1 | 0 | 1;
  travel: number;
  hidden: boolean;
}

export function navigationScrollStep(previous: NavigationScrollState, rawY: number, heroEnd: number, touch = false): NavigationScrollState {
  const y = Math.max(0, rawY);
  const protectedEnd = Math.max(140, heroEnd);
  if (y <= protectedEnd) return { y, direction: 0, travel: 0, hidden: false };
  const delta = y - Math.max(previous.y, protectedEnd);
  // Ignore subpixel/noise updates and elastic overscroll around the top.
  if (Math.abs(delta) < 1) return previous;
  const direction = delta > 0 ? 1 : -1;
  const travel = previous.direction === direction ? previous.travel + Math.abs(delta) : Math.abs(delta);
  const threshold = direction === 1 ? (touch ? 44 : 30) : (touch ? 24 : 16);
  return { y, direction, travel, hidden: travel >= threshold ? direction === 1 : previous.hidden };
}
