"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Route transitions animate opacity only: a transform here would become the
// containing block for GSAP's fixed-position pins on the story page.
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}
