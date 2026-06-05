"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NAV_LINKS } from "@/lib/content";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-hairline bg-bg/85 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-content items-center justify-between px-5 md:px-8">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight text-text">
          Helix<span className="text-accent">.</span>
        </Link>

        <ul className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-text-muted transition-colors hover:text-text"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/students"
            className="rounded-md px-3 py-2 text-sm text-text-muted transition-colors hover:text-text"
          >
            Students
          </Link>
          <Link
            href="/apply-startups"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg shadow-accent transition-transform duration-150 hover:bg-accent active:translate-y-px"
          >
            Startups
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-md text-text lg:hidden"
        >
          <span className="relative block h-4 w-5">
            <span
              className={`absolute left-0 block h-0.5 w-5 bg-current transition-transform duration-200 ${
                open ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-1.5 block h-0.5 w-5 bg-current transition-opacity duration-200 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 block h-0.5 w-5 bg-current transition-transform duration-200 ${
                open ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
      </nav>

      {open && (
        <div className="border-t border-hairline bg-bg/95 backdrop-blur-md lg:hidden">
          <ul className="mx-auto flex max-w-content flex-col gap-1 px-5 py-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-2 py-2.5 text-text-muted transition-colors hover:bg-surface hover:text-text"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="mt-2 flex gap-3">
              <Link
                href="/students"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-md border border-hairline px-4 py-2.5 text-center text-sm text-text"
              >
                Students
              </Link>
              <Link
                href="/apply-startups"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-md bg-accent px-4 py-2.5 text-center text-sm font-medium text-accent-fg"
              >
                Startups
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
