"use client";

import { useEffect, useState, type RefObject } from "react";

/** True while the element overlaps the middle band of the viewport. */
export function useInView(ref: RefObject<Element | null>, rootMargin = "-35% 0px -35% 0px"): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, rootMargin]);
  return inView;
}
