"use client";

import { motion, useReducedMotion } from "motion/react";
import type { TimelineItem } from "@/lib/content";

const STUDENT_TBA: TimelineItem[] = [
  {
    date: "To be announced",
    event: "Undergraduate recruitment",
    body: "Key dates, information sessions, and the application deadline for the 2026 cycle will be posted here.",
  },
];

function Strand({ title, items }: { title: string; items: TimelineItem[] }) {
  const reduce = useReducedMotion();

  return (
    <div className="relative">
      <h3 className="mb-8 font-display text-xl font-semibold tracking-tight text-text">{title}</h3>

      {/* backbone */}
      <div className="absolute left-[7px] top-16 bottom-2 w-px bg-gradient-to-b from-accent/60 via-hairline to-transparent" />

      <ol className="space-y-7">
        {items.map((item, i) => (
          <motion.li
            key={item.event}
            initial={reduce ? false : { opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="relative pl-9"
          >
            {/* base node */}
            <span className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 border-accent bg-bg">
              <span className="absolute inset-[3px] rounded-full bg-accent" />
            </span>

            <p className="text-sm font-medium uppercase tracking-wider text-accent">{item.date}</p>
            <p className="mt-1 font-display text-lg font-medium text-text">{item.event}</p>
            {item.body && <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{item.body}</p>}
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

export default function Timeline() {
  return (
    <section id="timeline" className="bg-bg-elev">
      <div className="mx-auto max-w-content px-5 py-24 md:px-8">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-accent">Recruitment timeline</p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            2026 recruitment timeline
          </h2>
          <p className="mt-5 leading-relaxed text-text-muted">
            Our 2026 recruitment timeline is being finalized. Check back soon for key dates,
            information sessions, and application deadlines.
          </p>
        </div>

        <div className="mt-16 max-w-xl">
          <Strand title="Undergraduate recruitment 2026" items={STUDENT_TBA} />
        </div>
      </div>
    </section>
  );
}
