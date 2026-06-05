"use client";

import { motion, useReducedMotion } from "motion/react";
import { FEATURES_LINES } from "@/lib/content";

export default function Features() {
  const reduce = useReducedMotion();

  return (
    <section className="mx-auto max-w-content px-5 py-28 md:px-8 md:py-40">
      <div className="font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl md:text-7xl">
        {FEATURES_LINES.map((line, i) => {
          const accent = i === 1 || i === 3;
          return (
            <motion.div
              key={line}
              initial={reduce ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className={accent ? "text-accent" : "text-text"}
            >
              {line}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
