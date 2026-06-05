import Image from "next/image";

export default function Sponsors() {
  return (
    <section id="sponsors" className="border-t border-hairline bg-bg-elev">
      <div className="mx-auto max-w-content px-5 py-24 md:px-8">
        <div className="flex flex-col items-start gap-3">
          <p className="text-[11px] uppercase tracking-[0.22em] text-accent">Partners</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Supporting the next generation
          </h2>
          <p className="max-w-xl text-text-muted">
            Backing student-led innovation across healthcare and biotech.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-16 gap-y-10">
          <Image
            src="/assets/img/red-bull-logo-fixed.png"
            alt="Red Bull"
            width={140}
            height={56}
            className="h-10 w-auto object-contain"
          />
          <span className="text-sm text-text-muted">More partners joining soon!</span>
        </div>
      </div>
    </section>
  );
}
