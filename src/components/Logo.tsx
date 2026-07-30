/**
 * Mushi wordmark — ported verbatim from mushi-app so the mark is identical on
 * both properties.
 *
 * Set in Dutch801 Rm WGL4 BT (Roman / 400), wired up as the `font-serif` token
 * in globals.css. Dutch801 ships a single Roman weight, so the wordmark keeps
 * its natural weight — adding font-medium/bold would make the browser
 * synthesise a faux bold.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-baseline font-serif leading-none tracking-tight text-white ${
        className ?? "text-5xl"
      }`}
    >
      Mushi
    </span>
  );
}
