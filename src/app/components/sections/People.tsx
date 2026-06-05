import { ADVISORY_BOARD } from "@/lib/content";

export function AdvisoryBoard() {
  return (
    <section id="advisory" className="border-t border-hairline bg-bg-elev">
      <div className="mx-auto max-w-content px-5 py-24 md:px-8">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-accent">Advisory board</p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            Guidance from across industry and academia
          </h2>
        </div>

        <ul className="mt-12 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {ADVISORY_BOARD.map((advisor) => (
            <li key={advisor.name} className="border-t border-hairline pt-5">
              <p className="font-display text-lg font-medium text-text">{advisor.name}</p>
              <p className="mt-1 text-sm text-text-muted">{advisor.title}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Fellows() {
  return (
    <section id="fellows" className="border-t border-hairline">
      <div className="mx-auto max-w-content px-5 py-24 md:px-8">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-accent">Fellows</p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            Meet our 2026 fellows soon
          </h2>
          <p className="mt-5 leading-relaxed text-text-muted">
            Our 2026 cohort will be selected in September, following the undergraduate recruitment and
            application process. Check back then to meet the new fellows.
          </p>
        </div>
      </div>
    </section>
  );
}
