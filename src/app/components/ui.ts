// Shared Tailwind class strings for the application form pages,
// so every input/button stays visually consistent with the design tokens.

export const ui = {
  page: "min-h-[100dvh] bg-bg text-text",
  container: "mx-auto max-w-3xl px-5 py-16 md:px-8",
  returnButton:
    "inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text",
  eyebrow: "text-[11px] uppercase tracking-[0.22em] text-accent",
  title: "mt-4 font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl",
  subtitle: "mt-3 leading-relaxed text-text-muted",
  sectionTitle: "font-display text-lg font-semibold tracking-tight",
  sectionRule: "mt-3 h-px w-full bg-hairline",
  label: "mb-2 block text-sm font-medium text-text",
  required: "text-accent",
  input:
    "w-full rounded-md border border-hairline bg-surface px-4 py-2.5 text-text placeholder:text-text-muted/60 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/40",
  textarea:
    "w-full resize-y rounded-md border border-hairline bg-surface px-4 py-2.5 text-text placeholder:text-text-muted/60 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/40",
  select:
    "w-full appearance-none rounded-md border border-hairline bg-surface px-4 py-2.5 text-text outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/40",
  primaryButton:
    "inline-flex items-center justify-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-medium text-accent-fg shadow-accent transition-transform duration-150 hover:bg-accent active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none",
  secondaryButton:
    "inline-flex items-center justify-center rounded-md border border-hairline px-6 py-3 text-sm font-medium text-text transition-colors hover:bg-surface active:translate-y-px",
  spinner:
    "h-4 w-4 animate-spin rounded-full border-2 border-accent-fg/40 border-t-accent-fg",
  note: "mt-4 text-sm leading-relaxed text-text-muted",
  link: "text-accent transition-colors hover:text-text",
};
