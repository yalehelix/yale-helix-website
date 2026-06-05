"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { STATS } from "@/lib/content";

function StatNumber({ value, suffix }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const format = (n: number) => `${Math.round(n).toLocaleString()}${suffix ?? ""}`;

    if (reduce) {
      el.textContent = format(value);
      return;
    }
    if (!inView) return;

    // Count up by updating the DOM node directly, so we don't re-render every frame.
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = format(v);
      },
    });
    return () => controls.stop();
  }, [inView, reduce, value, suffix]);

  return <span ref={ref}>0{suffix ?? ""}</span>;
}

export default function Stats() {
  return (
    <section
      id="numbers"
      className="rounded-b-[2.5rem] border-t border-light-line text-ink"
      style={{
        background:
          "radial-gradient(70% 55% at 8% 100%, rgba(66,104,255,0.10) 0%, transparent 60%), #f4f4f2",
      }}
    >
      <div className="mx-auto max-w-content px-5 py-24 md:px-8">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-accent">Helix by the numbers</p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-ink md:text-5xl">
            A decade of building
          </h2>
          <p className="mt-5 leading-relaxed text-ink-muted">
            Empowering the Yale biotech innovation space for over a decade, supporting founders and
            students as they take on real-world problems.
          </p>
        </div>

        <dl className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-light-line bg-light-line sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-light-surface p-7">
              <dd className="font-display text-5xl font-bold tracking-tight text-accent">
                <StatNumber value={stat.value} suffix={stat.suffix} />
              </dd>
              <dt className="mt-3 font-medium text-ink">{stat.label}</dt>
              <p className="mt-1 text-sm text-ink-muted">{stat.sublabel}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
