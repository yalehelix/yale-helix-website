"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { PORTFOLIO, type Startup } from "@/lib/content";

function StartupCard({ startup, index }: { startup: Startup; index: number }) {
  const reduce = useReducedMotion();
  const tint = startup.category === "software" ? "text-accent" : "text-[#7fb0a8]";
  const Wrapper = startup.link ? "a" : "div";

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Wrapper
        {...(startup.link ? { href: startup.link, target: "_blank", rel: "noreferrer" } : {})}
        className="group flex h-full flex-col overflow-hidden rounded-xl border border-hairline bg-surface transition-colors hover:border-accent/40"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-bg-elev">
          <Image
            src={startup.image}
            alt={`${startup.name} preview`}
            fill
            sizes="(max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg/70 to-transparent" />
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className={`text-[11px] uppercase tracking-[0.18em] ${tint}`}>
            {startup.category === "software" ? "Health software" : "Therapeutics"}
          </p>
          <h3 className="mt-1.5 flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
            {startup.name}
            {startup.link && (
              <span className="text-accent transition-transform duration-200 group-hover:translate-x-0.5">
                &rarr;
              </span>
            )}
          </h3>
          <ul className="mt-3 space-y-1.5">
            {startup.blurbs.map((b) => (
              <li key={b} className="text-sm leading-snug text-text-muted">
                {b}
              </li>
            ))}
          </ul>
        </div>
      </Wrapper>
    </motion.div>
  );
}

export default function Portfolio() {
  const software = PORTFOLIO.filter((s) => s.category === "software");
  const therapeutics = PORTFOLIO.filter((s) => s.category === "therapeutics");

  return (
    <section id="portfolio" className="border-t border-hairline bg-bg">
      <div className="mx-auto max-w-content px-5 py-24 md:px-8">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-accent">Selected portfolio</p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            Startups we have partnered with
          </h2>
          <p className="mt-5 leading-relaxed text-text-muted">
            A look at past startups across health software and therapeutics that Helix students have
            helped build.
          </p>
        </div>

        <div className="mt-14">
          <h3 className="mb-6 font-display text-sm font-medium uppercase tracking-[0.18em] text-text-muted">
            Health software
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {software.map((s, i) => (
              <StartupCard key={s.name} startup={s} index={i} />
            ))}
          </div>
        </div>

        <div className="mt-14">
          <h3 className="mb-6 font-display text-sm font-medium uppercase tracking-[0.18em] text-text-muted">
            Biotech and therapeutics
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {therapeutics.map((s, i) => (
              <StartupCard key={s.name} startup={s} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
