/** Decorative survey contours, drawn once on load (static with reduced motion). */
export function Contour({ className = "" }: { className?: string }) {
  return (
    <svg className={`contour ${className}`} viewBox="0 0 1200 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <path pathLength={1} strokeWidth={1.2} d="M-20 250 C 180 150, 360 300, 600 210 S 980 70, 1220 140" />
        <path pathLength={1} strokeWidth={0.8} opacity={0.6} d="M-20 280 C 200 190, 380 330, 620 248 S 1000 110, 1220 178" />
        <path pathLength={1} strokeWidth={0.8} opacity={0.4} d="M-20 310 C 220 230, 400 360, 640 286 S 1020 150, 1220 216" />
        <path pathLength={1} strokeWidth={0.6} opacity={0.3} strokeDasharray="4 7" d="M-20 340 C 240 270, 420 390, 660 324 S 1040 190, 1220 254" />
      </g>
    </svg>
  );
}
