/**
 * The desktop header CTA's two liveries, shared between the static button
 * (SiteHeader) and the scroll-driven Login/Buy Now swap on /templates
 * (HeaderCtaSwap). One place, so the swap's two faces can never drift from
 * the button they replace.
 *
 * Both variants invert their OWN two colours on hover (CLAUDE.md), with a
 * gradient on both states so the fill cross-fades instead of snapping.
 */
export type HeaderCta = {
  label: string;
  href: string;
  variant?: "purple" | "light";
};

export const CTA_FILL = {
  purple:
    "bg-[linear-gradient(117.51deg,#a08ade_10.47%,#7c54b5_45.54%,#6e54b5_98.13%)] text-white hover:bg-[linear-gradient(117.51deg,#fff_10.47%,#fff_45.54%,#fff_98.13%)] hover:text-[#6e54b5]",
  light:
    "bg-[linear-gradient(117.51deg,#fdfdfd_10.47%,#ececec_98.13%)] text-black hover:bg-[linear-gradient(117.51deg,#000_10.47%,#000_98.13%)] hover:text-white",
} as const;
