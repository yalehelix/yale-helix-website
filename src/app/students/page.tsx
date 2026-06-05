import Link from "next/link";
import { ui } from "../components/ui";

export default function StudentLandingPage() {
  return (
    <div className={ui.page}>
      <div className="mx-auto max-w-content px-5 py-16 md:px-8">
        <Link href="/" className={ui.returnButton}>
          &larr; Return to homepage
        </Link>

        <div className="mt-16 max-w-2xl">
          <p className={ui.eyebrow}>For students</p>
          <h1 className={ui.title}>Join Yale Helix!</h1>
          <p className={ui.subtitle}>
            Student fellowship applications open in August. Get ready to apply!
          </p>
        </div>

        <div className="mt-10 max-w-2xl rounded-xl border border-hairline bg-surface p-8">
          <span className="inline-block rounded-full border border-accent/40 bg-accent-soft px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-accent">
            Opening in August!
          </span>
          <p className="mt-4 leading-relaxed text-text-muted">
            Applications for the Yale Helix student fellowship open in <strong className="text-text">AUGUST</strong>.
            Mark your calendar, check back then, and come build something incredible with us!
          </p>
        </div>
      </div>
    </div>
  );
}
