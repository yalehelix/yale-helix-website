import Link from "next/link";
import { FOOTER, NAV_LINKS } from "@/lib/content";

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-hairline bg-bg">
      <div className="mx-auto max-w-content px-5 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <p className="font-display text-xl font-semibold">
              Helix<span className="text-accent">.</span>
            </p>
            <address className="mt-4 not-italic text-sm leading-relaxed text-text-muted">
              {FOOTER.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              <a
                href={`mailto:${FOOTER.email}`}
                className="mt-3 inline-block text-accent transition-colors hover:text-text"
              >
                {FOOTER.email}
              </a>
            </address>
          </div>

          <div>
            <p className="text-sm font-medium text-text">Explore</p>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-text-muted transition-colors hover:text-text">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium text-text">Apply</p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/apply" className="text-sm text-text-muted transition-colors hover:text-text">
                  Student fellowship
                </Link>
              </li>
              <li>
                <Link
                  href="/apply-startups"
                  className="text-sm text-text-muted transition-colors hover:text-text"
                >
                  Startup application
                </Link>
              </li>
              <li>
                <Link
                  href="/interest-form"
                  className="text-sm text-text-muted transition-colors hover:text-text"
                >
                  Interest form
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-hairline pt-6 text-sm text-text-muted">
          <p>&copy; {new Date().getFullYear()} Yale Helix. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
