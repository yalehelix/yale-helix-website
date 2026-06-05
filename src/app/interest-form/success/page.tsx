"use client";

import Link from "next/link";
import { ui } from "../../components/ui";

export default function InterestFormSuccessPage() {
  return (
    <div className={ui.page}>
      <div className={ui.container}>
        <Link href="/" className={ui.returnButton}>
          &larr; Return to homepage
        </Link>

        <div className="mt-16 text-center">
          <p className={ui.eyebrow}>Interest received</p>
          <h1 className={ui.title}>Thank you for your interest in Yale Helix</h1>
          <p className="mx-auto mt-4 max-w-xl text-text-muted">
            We have received your contact information and will be in touch soon. Student fellow
            applications open August 15.
          </p>

          <div className="mx-auto mt-10 max-w-md rounded-xl border border-hairline bg-surface p-7 text-left">
            <h2 className={ui.sectionTitle}>Questions?</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">
              For any questions about your submission or the incubator program, reach out to us at{" "}
              <a href="mailto:admin@yalehelix.org" className={ui.link}>
                admin@yalehelix.org
              </a>
              .
            </p>
          </div>

          <div className="mt-8">
            <Link href="/interest-form" className={ui.secondaryButton}>
              Submit another interest form
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
