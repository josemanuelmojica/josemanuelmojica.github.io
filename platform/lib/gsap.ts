"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Register in the browser only; static export evaluates modules on the server.
if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Desktop-class viewport with no system reduced-motion preference. */
export const ENHANCED = "(min-width: 900px) and (min-height: 620px) and (prefers-reduced-motion: no-preference)";
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, useGSAP };
