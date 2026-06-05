import { SERVICES, HERO } from "@/lib/content";

export default function WhatWeDo() {
  return (
    <section
      id="what-we-do"
      className="rounded-t-[2.5rem] text-ink"
      style={{
        background:
          "radial-gradient(75% 55% at 90% 0%, rgba(66,104,255,0.12) 0%, transparent 60%), #f4f4f2",
      }}
    >
      <div className="mx-auto max-w-content px-5 py-24 md:px-8">
        <div className="max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-accent">What we do</p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-ink md:text-5xl">
            This is how we help ambitious companies succeed.
          </h2>
          <p className="mt-5 leading-relaxed text-ink-muted">{HERO.mission}</p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {SERVICES.map((service, i) => (
            <div
              key={service.title}
              className="rounded-xl border border-light-line bg-light-surface p-7 transition-colors hover:border-accent/50"
            >
              <p className="font-display text-sm font-medium text-accent">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-ink">
                {service.title}
              </h3>
              <p className="mt-2 leading-relaxed text-ink-muted">{service.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
