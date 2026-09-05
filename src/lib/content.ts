/**
 * Home page copy.
 *
 * Mirrors design/COPY.md, which is the authoritative deck. Change copy there
 * first, then here — not the other way round.
 *
 * Quotes are reproduced verbatim, including the typos in testimonials 5 and 2
 * ("did on amazing job", "creative, and creative"). They are real customer
 * words; do not silently correct them.
 */

/**
 * Header nav.
 *
 * `href: null` means THE PAGE DOES NOT EXIST YET. Those entries render as
 * plain text at half strength with no hover and no pointer, rather than as
 * links to an anchor that only pretends to be a destination — a live-looking
 * link that goes nowhere is the worse failure. Give one an href and it becomes
 * a link again with no other change (Žilvinas / Noah 2026-08-19).
 *
 * Agency is this page, so it goes to the site root rather than to #agency: the
 * section it used to target IS the top of the home page.
 */
import { BOOKING_ANCHOR } from "@/lib/site";

export const NAV = [
  { label: "Agency", href: "/" },
  { label: "Case Studies", href: null },
  { label: "Templates", href: "/templates" },
] as const;

/**
 * Platform icons that float around the hero artwork in the design.
 *
 * Identified by rendering the extracted assets: image42/43/44/45 are the
 * Instagram, Facebook, Google and TikTok marks. Positions are percentages of
 * the hero box, eyeballed from the design; they are decorative and hidden
 * below the lg breakpoint, where there is no room for them.
 */
/*
  Rotations are all measured now. Each is Figma's figure with the sign flipped,
  since Figma reports rotation counter-clockwise-positive and CSS is
  clockwise-positive:

    Instagram  Figma  19.81  ->  -19.81deg
    Google     Figma -26.63  ->   26.63deg
    TikTok     Figma -12.88  ->   12.88deg
    Facebook   Figma  15.24  ->  -15.24deg   (sign checked against the artwork)

  `x`/`y` are the tile's CENTRE as a percentage of the whole violet hero field
  — not of the hero section, which is shorter. Solved from the Figma frame
  screenshot together with the supplied canvas coordinates (Instagram
  2369,-504; Google 3508,-457; Facebook 3563,-26; TikTok 2349,-51): the frame
  comes out 1915 x 1083, and its origin fits from all four tiles independently
  to within 7px. See design/TOKENS.md for the working.
*/
/**
 * `ink` is the fraction of each asset's canvas its artwork actually covers,
 * measured by decoding the alpha channel — not estimated.
 *
 *   Instagram 100%   Facebook 99.7%   Google 73.7% x 75.4%   TikTok 75.5%
 *
 * Google and TikTok were exported with about 25% transparent padding baked in,
 * so at a common 50px box their marks rendered ~37px and read as smaller and
 * dimmer than the other two. The logo box is divided by this, which sizes every
 * mark by its INK rather than by its canvas. Re-measure with the alpha scan in
 * design/TOKENS.md if an asset is ever replaced.
 */
export const HERO_FLOATERS = [
  { name: "Instagram", image: "image42.webp", ink: 1.0, x: 20.51, y: 24.73, rotate: "-19.81deg" },
  { name: "Google", image: "image44.webp", ink: 0.754, x: 79.98, y: 29.06, rotate: "26.63deg" },
  { name: "TikTok", image: "image45.webp", ink: 0.755, x: 19.46, y: 66.54, rotate: "12.88deg" },
  { name: "Facebook", image: "image43.webp", ink: 0.997, x: 82.86, y: 68.85, rotate: "-15.24deg" },
] as const;

/**
 * The four stat panels that drift in from the left and right edges of the
 * hero, deliberately cropped by the viewport as in the design.
 *
 * All four share the CHROME — 500 x 200, #181818, an inner 3px #222222 border,
 * radius 30 (see design/TOKENS.md "Hero stat panel"). What sits inside does
 * not: the rotation, the type sizes and the layout are all per panel, so the
 * shape is a discriminated union rather than one row of optional fields.
 *
 * The copy is the full string in every case. The reference shows each line
 * cropped mid-word ("Score", "ched 10M+ Views"); that is the viewport crop, not
 * the copy — see the offset note in HeroPanels.tsx.
 *
 * Decorative: the same claims appear as real text elsewhere on the page, so
 * these are aria-hidden rather than duplicated to screen readers.
 *
 * TODO(copy): design/COPY.md carries panels 1 and 2 only (it lists exactly six
 * hero chips = two titles plus four lines). Panel 3's copy came with its
 * measurements and should be added to the deck; panel 4 is still placeholder
 * text an earlier session invented and needs Žilvinas's real wording.
 */
type HeroPanelBase = {
  side: "left" | "right";
  top: string;
  /**
   * CSS rotation — clockwise-positive.
   *
   * NOTE the sign flip against Figma, which reports rotation
   * counter-clockwise-positive. Figma's -9.19 on panel 2 is `9.19deg` here.
   * Panel 1's -5.09159deg came from an SVG export instead, and SVG shares
   * CSS's convention, so that one carries across unchanged.
   */
  rotate: string;
  /**
   * How far the card hangs off the viewport edge, in `--k` units. Defaults to
   * 2, i.e. 200 of its 500 hidden — the measured crop. Raise it to push a card
   * further off.
   */
  edgeOffset?: number;
};

/**
 * The default panel: a 25px title, the divider, two lines, something beside
 * them, and optionally the level meter along the bottom.
 */
type StatPanel = HeroPanelBase & {
  variant: "stat";
  /** Always 25px Poppins Medium. */
  title: string;
  /** Two lines under the divider; `size` is the design px at 1920. */
  lines: [{ text: string; size: number }, { text: string; size: number }];
  /** Gap between the two lines, design px. */
  lineGap: number;
  /**
   * Distance from the card's bottom EDGE to the bottom of line 2, design px.
   *
   * Omit to let the lines centre against whatever sits beside them, which is
   * what panel 1 does. Panel 2 pins it, because its 95-tall chart is taller
   * than its text and centring would leave the lines floating.
   */
  linesFromBottom?: number;
  /** What sits to the right of the lines. */
  aside: "icon" | "chart";
  /** Whether the full-width level meter runs along the bottom. */
  meter: boolean;
};

/**
 * Panel 3's layout, which shares only the card chrome: an arrow in a disc at
 * the top, then a small label over a large figure, with a badge alongside it.
 * No title and no divider.
 */
type RevenuePanel = HeroPanelBase & {
  variant: "revenue";
  /** 15px Poppins Medium, sitting directly above the figure. */
  label: string;
  /** 43px Poppins Medium. Its BOX BOTTOM is pinned by `amountFromBottom`. */
  amount: string;
  /** Distance from the card's bottom edge to the figure's box, design px. */
  amountFromBottom: number;
  /** 25px Poppins Regular in a 50 x 30 badge, set right after the figure. */
  badge: string;
};

/**
 * Panel 4's layout: an icon beside the title, the divider, then a horizontal
 * bar chart with a labelled row per video and a tick axis underneath.
 */
type TrendingPanel = HeroPanelBase & {
  variant: "trending";
  /** 25px Poppins Medium, with the 28.5 icon beside it. */
  title: string;
  /**
   * One row per bar. `label` is 15px Poppins Medium.
   *
   * `k` is the bar's VALUE in thousands, not a width — the chart maps it onto
   * the tick axis below. It used to be a raw design-px width, which meant the
   * bars and the axis were two unrelated sets of numbers and nothing stopped
   * them drifting out of agreement (they had).
   */
  rows: { label: string; k: number }[];
  /** Axis labels, each in a 34 x 12 box. */
  ticks: string[];
};

export type HeroPanel = StatPanel | RevenuePanel | TrendingPanel;

export const HERO_PANELS: HeroPanel[] = [
  {
    variant: "stat",
    side: "left",
    top: "17%",
    rotate: "-5.09159deg",
    title: "Performance Score",
    lines: [
      { text: "Successfully Reached 10M+ Views", size: 20 },
      { text: "Consistently Considered to be Excellent", size: 15 },
    ],
    lineGap: 4,
    aside: "icon",
    meter: true,
  },
  {
    variant: "stat",
    side: "left",
    top: "58%",
    rotate: "9.19deg",
    title: "Growth Performance Analysis",
    lines: [
      { text: "Optimized for the Quarter", size: 15 },
      { text: "Refined, Delivered & Measured", size: 15 },
    ],
    lineGap: 32,
    linesFromBottom: 40,
    aside: "chart",
    meter: false,
  },
  {
    variant: "revenue",
    side: "right",
    top: "14%",
    rotate: "16.97deg",
    // "(today)", not the design's "(last 7 days)". A week's figure invites the
    // reader to divide it down and read the client as small; a daily one does
    // not. Deliberate copy change — see design/COPY.md.
    label: "Total Revenue (today)",
    amount: "$6,240.28",
    amountFromBottom: 32.6,
    badge: "+2",
  },
  {
    variant: "trending",
    side: "right",
    top: "70%",
    // Figma's 15, so -15 here. Confirmed against the reference: "Video 1/2/3"
    // step RIGHT as they go down, which only happens under a counter-clockwise
    // rotation. The icon inherits this and needs none of its own.
    rotate: "-15deg",
    // Pushed a further 40 off the right edge than the other three.
    edgeOffset: 2.4,
    title: "Trending Videos",
    // Values read off the Figma card, in thousands. Note row 2 is 10K against
    // an axis that stops at 8K — its bar is meant to run past the last
    // gridline, which is what the reference shows. This replaces three
    // hand-measured pixel widths, one of which was an admitted placeholder.
    rows: [
      // 6K lands exactly midway between the 4K and 8K gridlines.
      { label: "Video 1", k: 6 },
      { label: "Video 2", k: 10 },
      { label: "Video 3", k: 2 },
    ],
    // The axis DOUBLES at the end — 0, 2, 4, then 8 — while the ticks stay
    // evenly spaced. So it is not a linear scale, and a bar's length has to be
    // interpolated between the ticks it falls between rather than computed as
    // value/max. See barX() in HeroPanels.tsx.
    ticks: ["0", "2K", "4K", "8K"],
  },
];

/**
 * The hero sub breaks in ONE specific place per frame, and the two frames do
 * not agree:
 *
 *   desktop (2 lines)                 phone (3 lines)
 *   Weekly research, scripting,       Weekly research, scripting, creator
 *   creator sourcing, editing,        sourcing, editing, and angle testing
 *   and angle testing for Meta,       for Meta, TikTok, and YouTube ads.
 *   TikTok, and YouTube ads.
 *
 * Left to the browser neither one comes out right — the break shifts with the
 * viewport, and again while the fallback face is showing before Poppins
 * loads — so both breaks are authored, not tuned.
 *
 * PARTS, not lines, because the phone breaks INSIDE the desktop's first line
 * ("...creator / sourcing, editing..."). Cut at every point either frame
 * breaks at and the two orders are the same four pieces with different <br>s
 * between them; a per-frame list of whole lines would repeat the copy twice
 * and let the two drift apart.
 *
 *   desktop:  a b / c d        phone:  a / b c / d
 *
 * `lines` and `sub` are still assembled from the parts, so any consumer that
 * wants the flat sentence gets it without the copy being typed again.
 */
const HERO_SUB_PARTS = {
  a: "Weekly research, scripting, creator",
  b: "sourcing, editing,",
  c: "and angle testing",
  d: "for Meta, TikTok, and YouTube ads.",
} as const;

const HERO_SUB_LINES = [
  `${HERO_SUB_PARTS.a} ${HERO_SUB_PARTS.b}`,
  `${HERO_SUB_PARTS.c} ${HERO_SUB_PARTS.d}`,
] as const;

export const HERO = {
  eyebrow: "Creative Partner for eCom & AI brands",
  heading: "Premium Ads for $1M to $100M Brands.",
  /**
   * TWO LINES, AND THE BREAK IS AUTHORED (Žilvinas 2026-08-26).
   *
   * The headline used to be a single line, so `text-balance` had nothing to
   * do and the h1 carried no break. This one has to break, and left to the
   * browser it breaks in the wrong place: `text-balance` equalises the two
   * lines and lands on "Premium Ads for $1M / to $100M Brands.", which splits
   * the "$1M to $100M" range across the fold of the sentence. The frame breaks
   * after "for" and leaves the range whole.
   *
   * `heading` stays the flat sentence for metadata, JSON-LD and anything else
   * that wants it in one piece; only the h1 renders the lines.
   */
  headingLines: ["Premium Ads for", "$1M to $100M Brands."],
  subLines: HERO_SUB_LINES,
  subParts: HERO_SUB_PARTS,
  sub: HERO_SUB_LINES.join(" "),
  primaryCta: "15 Minute Fit-Check",
  secondaryCta: "Steal Our Secrets",
  /**
   * OFF while there is nothing behind it (Noah 2026-08-19). The copy and the
   * markup both stay — flip this to true and the second pill is back, with its
   * label, its dark variant and its place in the row unchanged. Deleting the
   * pill outright is what would make bringing it back a rebuild.
   */
  secondaryCtaEnabled: false,
  /** Floating proof chips around the hero visual. */
  chips: [
    "Performance Score",
    "Successfully Reached 10M+ Views",
    "Consistently Considered to be Excellent",
    "Growth Performance Analysis",
    "Refined, Delivered & Measured",
    "Optimized for the Quarter",
  ],
} as const;

export const SOCIAL_PROOF = {
  headline: "110+ brands enhanced their ads with Mushi",
  /**
   * Client wordmarks. Rendered as text because no official logo SVGs were
   * supplied — see design/TOKENS.md "Client logotypes". Replace with the
   * clients' own assets when available.
   */
  /**
   * Client wordmarks in the order the design lays them out.
   *
   * Official logo SVGs supplied by Žilvinas on 2026-07-28, in /public/logos.
   * Widths are the artwork's own viewBox width so each mark keeps its true
   * proportions; they are NOT normalised to a common width, which would
   * distort the relative sizing the design intends.
   *
   * TODO(we-interiors): the only brand with no supplied logo. Falls back to
   * Poppins text until its SVG arrives.
   */
  brands: [
    { name: "Sintra", logo: "sintra.svg", w: 80, h: 25 },
    /**
     * The ONE brand mark that is not a vector, and the only one that looked
     * soft on a phone.
     *
     * superior-care.svg is an SVG in name only: no <path> anywhere, just two
     * copies of a 528x183 PNG used as an alpha mask with a white rect painted
     * through it — Figma's export shape for a rastered layer. Inside a
     * <pattern> with objectBoundingBox units, the bitmap gets rasterised
     * against the 73x25 user space rather than the device, so on a DPR-3
     * screen it was being blown back up from 73px of detail. Every other logo
     * in this row is real geometry and stayed crisp, which is what made this
     * one stand out.
     *
     * Shipping it as a better bitmap did not fix it, because the problem is
     * not resolution — it is that a bitmap cannot survive a pinch-zoom next to
     * eight logos that can. Zoomed in on a phone this one turned to mush while
     * Breezit and self.co beside it stayed razor sharp.
     *
     * So it is now REAL GEOMETRY, traced from the 528x183 mask: contours at 4x
     * with OpenCV, simplified to 0.25 source px, 23 subpaths, even-odd fill.
     * 9 KB against the original 101 KB of embedded PNG, and the reconstruction
     * differs from the bitmap by 0.9/255 averaged over the size it actually
     * draws at. Being geometry, it now re-rasterises at whatever zoom the
     * phone is at, like every other mark in the row.
     */
    /**
     * `tall` marks a TWO-LINE lockup. The row draws every mark at one height,
     * which is right for the single-word logotypes either side of it and wrong
     * for this one: at 19px total, "superior" over "care pet" leaves each word
     * about 8px of cap height against their 14-19, and it reads as mush rather
     * than as a logo. It draws a quarter taller.
     */
    { name: "superior care.pet", logo: "superior-care.svg", w: 528, h: 183, tall: true },
    { name: "Holo", logo: "holo.svg", w: 62, h: 25 },
    { name: "we interiors", logo: "we-interiors.webp", w: 400, h: 72 },
    { name: "Breezit", logo: "breezit.svg", w: 98, h: 25 },
    { name: "Unive", logo: "unive.svg", w: 95, h: 26 },
    { name: "SE Ranking", logo: "se-ranking.svg", w: 101, h: 25 },
    { name: "self.co", logo: "selfco.svg", w: 96, h: 25 },
    { name: "eany.io", logo: "eany.svg", w: 96, h: 25 },
    { name: "Kiloverse", logo: "kiloverse.svg", w: 127, h: 25 },
  ] as { name: string; logo: string | null; w: number; h: number }[],
  awards: [
    { name: "Foreplay Best Ad Award", detail: "Winner 2025", logo: "image271.webp" },
    { name: "Trustpilot Reviews", detail: "Rated 4.9", logo: "image272.webp" },
    { name: "FirstPick's VC Mentors", detail: "AI Accelerator", logo: "image274.webp" },
  ],
} as const;

/**
 * One ad creative, framed as an Instagram post.
 *
 * `handle` is the account the ad ran under and `caption` is the line beneath
 * it — both render in the card's account header, matching the design.
 * `avatar` is optional: cards fall back to a neutral initial disc rather than
 * a stand-in photo. Put avatars in /public/creatives, media in /public/images.
 *
 * `w`/`h` are the media's intrinsic pixel size. They are required — every
 * image needs explicit dimensions (CLAUDE.md) so the rail does not reflow as
 * cards load.
 */
export type Creative = {
  handle: string;
  caption: string;
  /**
   * Always present. On a video card this is the poster frame — a real frame
   * lifted from the ad itself, not a separate still, so nothing shifts when
   * playback starts.
   */
  image: string;
  w: number;
  h: number;
  avatar?: string;
  verified?: boolean;
  /**
   * Filename in /public/videos. Present only on the cards whose ad is a film;
   * the rest stay plain stills. Sources are 1080x1920 masters at 8-15 Mbps,
   * transcoded to 720x1280 / ~1 Mbps H.264 (330MB -> 25MB across the four).
   * 720 wide is ~2.4x the card's rendered width, which keeps the ads crisp on
   * a 2x display — this section's whole claim is that the work is premium, so
   * it is the one place not to compress to mush.
   */
  video?: string;
};

export const CREATIVES = {
  heading: "Want Creatives This Premium?",
  /** Pill on the heading row — the answer to the heading's question. */
  cta: "Yes",
  /** Add new creatives here — the card chrome needs no markup changes. */
  items: [
    // Pairings verified by rendering every candidate file:
    //   image143 = "Soshie" on a laptop, Sintra branding
    //   image139 = CELEMI skincare pouch
    //   image140 = "10x more content / STAY consistent"
    //   image141 = tevaplanter vs traditional planter comparison
    //
    // Only these four survived extraction. The design shows roughly ten, but
    // the get_design_context response truncated at 100KB before reaching the
    // rest, so their assets were never exported. Supply the remaining creative
    // files to complete the rail — see public/creatives/README.md.
    {
      handle: "sintra.ai",
      caption: "AI Agents Comparison Video Ad",
      image: "sintra-soshie-ad.webp",
      video: "sintra-soshie-ad.mp4",
      w: 900,
      h: 1595,
      avatar: "sintra-logo.webp",
      verified: true,
    },
    {
      handle: "celemi",
      caption: "Minimalistic Skincare Static Ad",
      image: "celemi-pouch.webp",
      w: 900,
      h: 1595,
      avatar: "celemi-logo.webp",
    },
    {
      handle: "tryholo.ai",
      caption: "AI Marketing UGC Video Ad",
      image: "tryholo-10x.webp",
      video: "tryholo-10x.mp4",
      w: 900,
      h: 1595,
      avatar: "tryholo-logo.webp",
      verified: true,
    },
    {
      handle: "tevaplanter",
      caption: "Planter Comparison Static Ad",
      image: "tevaplanter-ad.webp",
      w: 900,
      h: 1595,
      avatar: "tevaplanter-logo.webp",
    },

    // Exported from Figma at 1320x2340 and converted to WebP (12.9MB -> 0.52MB).
    // Handles are taken from the brand visible inside each ad, so nothing is
    // invented; the owners of the last two were confirmed against the design's
    // own card headers.
    //
    // THIS ARRAY'S ORDER IS THE DESIGN'S ORDER, positions 5-10 set from the
    // Figma frame rather than from how the assets happened to be extracted.
    // The rail steps one card at a time with no drag and no shuffle, so what
    // is written here is exactly the sequence a visitor walks through — moving
    // an entry re-sequences the section. Do not reorder to group brands or to
    // tidy the file.
    //
    //   5 SuperiorCarePet   6 unive   7 celemi
    //   8 bluechew          9 PersyBooths   10 sintra.ai
    {
      handle: "SuperiorCarePet",
      caption: "Dog Food Voiceover Video Ad",
      image: "dogfood-real-results.webp",
      video: "dogfood-real-results.mp4",
      w: 900,
      h: 1595,
      avatar: "superiorcarepet-logo.webp",
      verified: true,
    },
    {
      handle: "unive",
      caption: "Dream College Tool Static Ad",
      image: "unive-dream-college.webp",
      w: 900,
      h: 1595,
      avatar: "unive-logo.webp",
      verified: true,
    },
    {
      handle: "celemi",
      caption: "Serum Product Video Ad",
      image: "celemi-serum.webp",
      video: "celemi-serum.mp4",
      w: 900,
      h: 1595,
      avatar: "celemi-logo.webp",
    },
    {
      handle: "bluechew",
      caption: "Tablet Benefit Static Ad",
      image: "bluechew.webp",
      w: 900,
      h: 1595,
      avatar: "bluechew-logo.webp",
      verified: true,
    },
    {
      handle: "PersyBooths",
      caption: "Booth Storytelling Video Ad",
      image: "used-by-10000.webp",
      video: "used-by-10000.mp4",
      w: 900,
      h: 1595,
      avatar: "persybooths-logo.webp",
      verified: true,
    },
    {
      handle: "sintra.ai",
      caption: "3D Character Hook Video Ad",
      image: "sintra-soshie.webp",
      w: 900,
      h: 1595,
      avatar: "sintra-logo.webp",
      verified: true,
    },
  ] satisfies Creative[],
} as const;

/**
 * Case studies.
 *
 * Brand-to-result pairings were verified against the design on 2026-07-28.
 * The original copy deck attached Breezit's result to Holo — do not reorder.
 *
 * Images are the flattened composites pulled straight from Figma with
 * get_screenshot on the four `Mask group` nodes — 3803:3257 (Breezit),
 * 3803:3218 (Holo), 3803:3240 (eany), 3803:3251 (we interiors) — each 680x680.
 *
 * This matters: in Figma each visual is a device mockup with a screenshot
 * masked INTO it, over a coloured gradient. The earlier flat export split
 * those apart, so what shipped before was the bare screenshot with no device
 * and no gradient, which is why the cards looked unfinished. The mockups
 * export with transparency, so the gradient is reproduced by `bg` below.
 */
/*
 * `phoneOrder` is the ONE-COLUMN reading order, which is not the order the two
 * desktop columns produce. Desktop reads down the left column then the right —
 * Breezit, eany | Holo, we interiors — so stacking those two lists gives
 * Breezit, eany, Holo, we interiors on a phone. The phone artboard wants
 * Holo, Breezit, eany, we interiors, which interleaves them.
 *
 * The numbers are set as a CSS `order` on each card. Within a desktop column
 * they are already ascending (2 < 3 and 1 < 4), so they change nothing there;
 * below sm the two <ul>s become `display: contents` (globals.css) and the four
 * cards order themselves against each other.
 */
export const CASE_STUDIES = {
  heading: "Not Just Premium, but Profitable.",
  /**
   * The phone artboard breaks after the comma and sets the pair on two 24px
   * lines (Figma box 236 x 52). Left to itself the line fits — 342px inside a
   * 345px column at 375 wide — so the break has to be authored or it never
   * happens. Desktop is one line, which is what the reference shows there.
   */
  headingLines: ["Not Just Premium,", "but Profitable."],
  items: [
    {
      brand: "Breezit",
      /** Phone stacking position — see CASE_STUDIES' note on phoneOrder. */
      phoneOrder: 2,
      result: "Generated 700 sales calls & 1500\nleads in 8 months.",
      tags: ["AI", "SALES", "VENUES"],
      // All four artworks have their plate keyed to alpha, so `bg` sits BEHIND
      // the device instead of being washed over it. See
      // scripts/key-case-artwork.py; each card needs a different mode and the
      // exact command is noted beside it.
      //
      // Breezit and Holo take the plain path: alpha is READ from the export's
      // own antialiasing rather than redrawn, which is what finally stopped
      // the edges stair-stepping.
      //
      // SUPERSEDED for the same reason as the other three: 1000 square into a
      // 650px slot is 1.5x, so the site copy on the laptop was soft. Žilvinas
      // supplied this one already composed at 2720 — one render, whole canvas,
      // nothing to arrange:
      //
      //   python3 scripts/build-case-cards.py breezit
      image: "case-breezit-v2.webp",
      logo: "breezit.svg",
      logoW: 98,
      // Figma's fill with the device deleted: ONE radial ramp, #C5611E out of
      // the bottom-right corner to pure black, the handle sitting at ~85%/97%
      // and running up past the top-left corner.
      //
      // The radius is the dial for how much of the card reads as black, and it
      // is tuned to a number rather than by eye: at 114% the near-black band
      // (anything at or below a quarter brightness) covers 27% of the square.
      // Figma's own ~129% only got it to 3%, which left the corner looking
      // like a smudge instead of a side of the card. The dial is steep near
      // here — a point of radius moves the share by about a point — so nudge
      // it rather than redrawing the ramp.
      //
      // `glow` and `bg` carry the same ramp deliberately. The artwork is
      // opaque, so `glow` (screen-blended over it) is what you actually see;
      // screen over the near-black plate reproduces the gradient and its black
      // end leaves the plate alone. `bg` only shows if the image fails.
      bg: "radial-gradient(ellipse 114% 114% at 85% 97%, #c5611e 0%, #000000 100%)",
    },
    {
      brand: "Holo",
      /** Phone stacking position — see CASE_STUDIES' note on phoneOrder. */
      phoneOrder: 1,
      result: "From $0k/month to $117k/month\nin 7 months.",
      tags: ["AI", "MARKETING", "GENERATOR"],
      // #8A5CF6 is the purple this card already wore as its wash, kept as-is.
      // SUPERSEDED, same 1.5x softness. Two renders this time — the phone and
      // the workspace laptop — which register onto the old artwork at scale
      // 0.3676 and rotation 0.00, so they are crops of one 2720 canvas and only
      // have to be re-seated on it:
      //
      //   python3 scripts/build-case-cards.py holo
      image: "case-holo-v2.webp",
      logo: "holo.svg",
      logoW: 62,
      // Same ramp as Breezit, same 27% near-black share of the square — only
      // the colour changes, so the two cards catch the light identically.
      bg: "radial-gradient(ellipse 114% 114% at 85% 97%, #8a5cf6 0%, #000000 100%)",
    },
    {
      brand: "eany.io",
      /** Phone stacking position — see CASE_STUDIES' note on phoneOrder. */
      phoneOrder: 3,
      result: "Helped find 3 evergreen ads for\nan 8 figure company.",
      tags: ["B2B", "MARKETPLACE", "RESELLERS"],
      // This export has a DROP SHADOW baked onto its plate, at values darker
      // than the plate itself, so no plate key removes it — it showed over the
      // gradient as a stepped black blob. It cannot be keyed by brightness
      // either: the phones' own dark bottom bezels sit at exactly those
      // values, so erasing the shadow punched holes in the devices. The
      // outline therefore comes from Žilvinas's clean mockups, which register
      // onto the export as a plain rotation + scale (both phones independently
      // at 0.794 / 60deg). Every visible pixel is still the export's:
      //
      //   python3 scripts/key-case-artwork.py case-eany.webp \
      //     case-eany-cut.webp --silhouette iphone21.webp,iphone11.webp
      //
      // SUPERSEDED, same complaint as we interiors: every pixel of that came
      // from a 1000-square export driving a 650px slot, so the screen copy on
      // the phones was soft at dpr 2 and mush at dpr 3. Žilvinas supplied the
      // two phones as separate transparent PNGs at native resolution, which
      // register onto the old card at scale 0.3676 (= 1000/2720) and rotation
      // 0.00 — i.e. they are two crops of the SAME 2720 canvas and only have
      // to be re-seated on it, not re-fitted. Framing is unchanged; an edge
      // match against Figma puts old and new within 2px of each other.
      //
      // Built once WITHOUT the renders' shadows, on the theory that the other
      // cards had none. Wrong: what the old cards lack is a BAKED shadow that
      // keying could not lift, and dropping the real one here cost the wash
      // phone A casts over phone B — the two stopped reading as a stacked pair
      // and the card no longer matched Figma. Shadows stay.
      //
      //   python3 scripts/build-case-cards.py eany
      image: "case-eany-v2.webp",
      logo: "eany.svg",
      logoW: 96,
      // The only fill here read straight off Figma's own gradient panel rather
      // than fitted from a screenshot: four stops, teal through blue and navy
      // to black, NOT the single flat blue this card wore before.
      //
      // Geometry off the handle line: the centre stop sits at the cyan diamond
      // BELOW AND RIGHT OF THE CARD — 105%/121%, outside its own bounds — and
      // the line runs up to the black stop past the top-left corner, 141% of
      // the card away. The two intermediate diamonds measure 24% and 62% along
      // that line, which matches the panel's 24% and 63% stops, so the reading
      // is confirmed rather than guessed.
      bg: "radial-gradient(ellipse 141% 141% at 105% 121%, #47b19c 0%, #3c6488 24%, #38405b 63%, #000000 100%)",
    },
    {
      brand: "we interiors",
      /** Phone stacking position — see CASE_STUDIES' note on phoneOrder. */
      phoneOrder: 4,
      result: "From $13k/month to $75k/month\nin 3 months.",
      tags: ["ECOM", "FURNITURE", "HOME"],
      // The one card NOT keyed out of its export. Alone among the four, that
      // export's outline was rasterised WITHOUT antialiasing — 73% of its
      // boundary pixels are a hard step against 99-100% on the others — so
      // there is no soft edge to read and every way of cutting it out leaves
      // a saw along the lid. It never needed keying: Žilvinas supplied a clean
      // render of the same laptop, composited by
      //
      //   python3 scripts/build-we-interiors-card.py
      //
      // SUPERSEDED by a straight export. That script's output
      // (case-we-interiors-macbook.webp) is 680 square — 0.7x the pixels the
      // 650px slot needs at dpr 2, i.e. upscaled and soft, which is exactly the
      // quality complaint. Žilvinas then supplied the whole card already
      // composed at 2720 square, so there is nothing left to build: this is
      // that file at 1950, alpha intact so the card's own fill still shows
      // through behind the laptop. Keep the script for reference in case the
      // screen content ever has to be re-mapped.
      image: "case-we-interiors-v4.webp",
      logo: "we-interiors.webp",
      logoW: 133,
      bg: "radial-gradient(ellipse 114% 114% at 85% 97%, #d9a422 0%, #000000 100%)",
    },
  ],
} as const;

export type Testimonial = {
  title: string;
  body: string[];
  date: string;
  /** ISO form for the datetime attribute — machine-readable dates for SEO. */
  iso: string;
  author: string;
  country: string;
  avatar?: string;
  initials?: string;
};

export const TESTIMONIALS = {
  heading: "Reputation is everything. Ours is flawless.",
  /** The design breaks the heading after the first sentence — one line each. */
  headingLines: ["Reputation is everything.", "Ours is flawless."],
  trustLine: "Trusted by 110+ brands",
  moreLabel: "View More",
  /** First three render immediately; the rest sit behind the disclosure. */
  visibleCount: 3,
  /**
   * Whose photos the trust pill shows, by `author`. The faces there are
   * decorative — the span is aria-hidden and no name sits beside them — so
   * which three appear is a design choice, unlike the card avatars, which are
   * bound to the person quoted and must never be swapped.
   *
   * Named explicitly rather than taken as "the first three with an avatar":
   * that rule made the set a side effect of `items` order, and reordering the
   * testimonials silently changed the pill.
   *
   * Each entry must match an `author` below that has an `avatar`.
   */
  pillAvatars: ["Hana Skomra", "Akvilė Želnytė", "Erika Zakarevičiūtė"],
  items: [
    {
      title: "Other marketers ask us who cooks our ads",
      body: [
        "Mushi team is exceptional, no other creative agency has ever met our needs - either because of the speed of execution, ideas or editing.",
        "Mushi delivers on all fronts. Other people & marketers even ask us where we get such creatives because they're top-notch.",
      ],
      date: "November 01, 2024",
      iso: "2024-11-01",
      author: "David Kovger",
      country: "GB",
      avatar: "deividas-kovger2.webp",
    },
    {
      title: "Media Buying Best Kept Secret...",
      body: [
        "...That is yours to discover. Mushi Agency is a collaborator who delivers. The team knows how to turn ideas into numbers and is communicative, analytical, creative, and creative. When they commit to a number, you can be sure they will do everything humanly possible to make it a reality. Mushi has my vote of confidence.",
      ],
      date: "January 23, 2025",
      iso: "2025-01-23",
      author: "Hana Skomra",
      country: "PL",
      avatar: "hana-skomra-budre1.webp",
    },
    {
      title: "They make ads that convert",
      body: [
        "We had a fantastic experience working with Mushi! They were incredibly quick with delivery. From start to finish, the team took full ownership of the project, crafting a compelling narrative that truly resonated with our audience.",
        "Highly recommend them to anyone looking for a top-quality ad experience!",
      ],
      date: "November 11, 2024",
      iso: "2024-11-11",
      author: "Akvilė Želnytė",
      country: "CH",
      avatar: "akvile-zelnyte1.webp",
    },
    {
      title: "Professional and reliable partner",
      body: [
        "I worked with Mushi agency as an internal marketing team member when our company collaborated with them.",
        "What I appreciated most was their professional approach to communication - clear deadlines, transparent project planning, and quick response to inquiries. The agency integrated exceptionally well with our internal team, which isn't always easy with external partners.",
        "I value their technical competence and creativity in solving e-commerce challenges.",
        "While Mushi is still young as an agency, the team's strong experience from previous projects is evident. I would recommend Mushi to those looking for a partner capable of working both independently and seamlessly integrating into an existing team.",
      ],
      date: "January 27, 2025",
      iso: "2025-01-27",
      author: "Erika Zakarevičiūtė",
      country: "LT",
      avatar: "erika-zakareviciute1.webp",
    },
    {
      title: "Amazing quality ads",
      body: [
        "Mushi did on amazing job creating and creatives for our brand. Their ideas were spot-on, and the visuals really captured our brand. Our sales went up, and we couldn't be happier with their work!",
      ],
      date: "January 16, 2025",
      iso: "2025-01-16",
      author: "Žilvinas Juzėnas",
      country: "LT",
      initials: "ŽJ",
    },
    {
      title: "Great experience working with Mushi...",
      body: [
        "Great experience working with Mushi agency. From a growth perspective, their team understands how to create video ads that actually perform on social channels - not just look good. Communication was smooth, turnaround was fast, and the creatives aligned well with performance goals. Solid partner for scaling paid social.",
      ],
      date: "November 01, 2025",
      iso: "2025-11-01",
      author: "Lukas Raščiauskas",
      country: "LT",
      // `initials` stays as the fallback if the file ever goes missing.
      avatar: "lukas-rasciauskas1.webp",
      initials: "LR",
    },
    {
      title: "Young, creative team",
      body: [
        "We worked with Mushi to produce several short videos for advertising on social network. They are a team of young, creative talents who need little management or overseeing. Overall, very easy to work with!",
      ],
      date: "September 12, 2024",
      iso: "2024-09-12",
      author: "Justė Semetaitė",
      country: "LT",
      avatar: "juste-semetaite1.webp",
    },
  ] satisfies Testimonial[],
} as const;

export const FINAL_CTA = {
  heading: "You scrolled so far. You want this. Trust us.",
  /** The design breaks after the first sentence — "You scrolled so far." alone. */
  headingLines: ["You scrolled so far.", "You want this. Trust us."],
  sub: "We have a cap. We don't know if you're the right fit yet. But we'd love to find out in 15 minutes.",
  /**
   * One sentence per line — the phone card's three breaks. The desktop card is
   * wide enough to carry the first two on one line, which is the break the
   * reference shows there, so FinalCta joins them from md up.
   */
  subLines: [
    "We have a cap.",
    "We don't know if you're the right fit yet.",
    "But we'd love to find out in 15 minutes.",
  ],
  cta: "15 Minute Fit-Check",
  scarcity: "2/10 client spots left for 2026",
} as const;

/**
 * /templates page copy. Mirrors design/COPY.md — change there first.
 *
 * Built from the supplied screenshot of the Templates design (no Figma call
 * spent). The badge count was illegible in the reference — "800+" is a
 * placeholder flagged in COPY.md; confirm before launch.
 */
export const TEMPLATES_PAGE = {
  // "500+", not the earlier "800+" guess: the count was illegible in the
  // low-res reference, and every legible source since says 500 — the
  // supplied MacBook artwork's own "500 Results" chip, "500 Winners in Your
  // Drive", and "500 winner static templates".
  badge: "500+ Static Templates",
  heading: "Your 8-Minute Shortcut to High-ROAS Ads",
  cta: "Take the Shortcut",
  login: "Login",
    /**
   * Category tiles beside the window — decorative (aria-hidden). Pattern,
   * size and layering follow the final hero reference (2026-09-03): one
   * tile per side on the top row, two on the second, outer tiles cut by the
   * viewport edge, inner second-row tiles sliding UNDER the MacBook.
   *
   * Positions are anchored to the CENTRE (calc(50% - Npx)), not the
   * viewport edges: on wider screens the field stays put around the MacBook
   * and the extra outer tiles (Food, second Drink) come into view, exactly
   * as the wide-screen example shows. At 1440 those two sit fully outside
   * the clip. Beauty genuinely appears three times in the reference.
   */
  categories: [
    { label: "Drink", image: "templates/cat-drink.webp", pos: "left-[calc(50%_-_915px)] top-[523px]" },
    { label: "Fashion", image: "templates/cat-fashion.webp", pos: "left-[calc(50%_-_692px)] top-[523px]" },
    { label: "Health", image: "templates/cat-health.webp", pos: "left-[calc(50%_-_814px)] top-[719px]" },
    { label: "Beauty", image: "templates/cat-beauty.webp", pos: "left-[calc(50%_-_594px)] top-[719px]" },
    { label: "Beauty", image: "templates/cat-beauty.webp", pos: "right-[calc(50%_-_715px)] top-[523px]" },
    { label: "Food", image: "templates/cat-food.webp", pos: "right-[calc(50%_-_928px)] top-[523px]" },
    { label: "Beauty", image: "templates/cat-beauty.webp", pos: "right-[calc(50%_-_600px)] top-[719px]" },
    { label: "Drink", image: "templates/cat-drink.webp", pos: "right-[calc(50%_-_810px)] top-[719px]" },
  ],
  /**
   * "Difference" comparison section. Rebuilt 2026-09-03 (late) from the
   * real exports: the tilted half-finished ad + trash can composition and
   * the finished fungies ad, the dark card panel, the Mushi wordmark for
   * the white chip, and real Kandy/CreativeOS chip SVGs. Asset paths live
   * in TemplateSections. Konvert's chip is still a drawn stand-in — no
   * official asset was supplied for it.
   */
  difference: {
    eyebrow: "Difference",
    heading: "Not just another Template Library",
    bad: {
      brands: ["Konvert", "Kandy", "CreativeOS"],
      alt: "Competitors' half-finished ad templates dumped in a trash can",
      lead: "Poorly Made Templates.",
      rest: "Sold as a 5x faster way to make ads, ends up unusable once bought.",
    },
    good: {
      alt: "The same ad as a finished, fully editable Mushi template for fungies cordyceps gummies",
      lead: "High Quality Templates.",
      rest: "No more overpromises, only 100% editable designs that are easy to use.",
    },
  },
  /**
   * FAQ. Questions from the design; ANSWERS supplied verbatim by the client
   * (2026-09-04) — reproduce exactly, including "libraries has" and the
   * schedule URL in the last answer.
   */
  faq: {
    eyebrow: "FAQ",
    heading: "Frequently Asked Questions",
    items: [
      {
        q: "What do I get inside?",
        a: "You get access to 500+ static ad templates designed for eCommerce brands, organized inside the Mushi platform and ready to open in Canva.",
      },
      {
        q: "Why are these templates better than other static templates?",
        a: "Most template libraries has beautiful examples, but the actual template is hard to edit and often slower to use than starting from scratch. We know that because we bought those products ourselves while trying to speed up production in our agency. That’s why we built ours differently: the template you open is just as good as the one you saw. Fully editable, production-ready, and made to save time instead of wasting it.",
      },
      {
        q: "Which industries are covered?",
        a: "This pack includes templates for 5 eCommerce industries: Health, Beauty, Food, Drink, and Fashion.",
      },
      {
        q: "Do I need Canva Pro to use the templates?",
        a: "Some templates include Pro assets, so Canva Pro may be needed to fully download the final ad. For editing, the free Canva plan is enough. But a lot of templates do not use Pro assets at all.",
      },
      {
        q: "How do I access the templates after purchase?",
        a: "After purchase, go to app.mushi.agency and enter the same email address you used when buying the subscription. You’ll receive a login code by email. Enter the code, and you’ll get access to the platform.",
      },
      {
        q: "Can I use these even if I’m not a designer?",
        a: "Yes, this product was built to be easy to use, even if you’re not a designer and if you run into any issues, you can always contact our support inside the platform.",
      },
      {
        q: "Do I get new templates over time?",
        a: "Yes, you’ll get 50+ new static templates every month.",
      },
      {
        q: "Is there customer support if I need help?",
        a: "Yes, you can contact support directly inside the platform or email support@mushi.agency.",
      },
      {
        q: "Do you offer a money-back guarantee?",
        a: "Yes, you’re covered by a 14-day money-back guarantee. If there’s anything you don’t like about the product within 14 days of purchase, just contact support inside the platform or email support@mushi.agency, and we’ll refund you.",
      },
      {
        q: "Can you do the creatives for me?",
        a: "Yes, If you want a done-for-you option, that’s exactly what our agency does. We help eCommerce, AI, and SaaS brands with creative production, so instead of getting templates you still need to edit yourself, you get new creatives produced weekly. All you need to do to get started is book a call with us here: https://www.mushi.agency/schedule.",
      },
    ],
  },
  /**
   * "Team" note, from the eighth supplied screenshot (2026-09-03). Copy is
   * transcribed verbatim, hyphens and all. Portraits are 88px crops of the
   * screenshot — they display at their natural size, so unlike the other
   * crops they are NOT upscaled; still, swap in real exports when supplied.
   */
  team: {
    eyebrow: "Team",
    heading: "Note from The Team",
    people: [
      {
        name: "Noah Bakanas",
        role: "Founder",
        image: "templates/team-noah-cut.webp",
        color: "#a78ae0",
        backdrop: "linear-gradient(135deg,#8168d0 0%,#4f3694 100%)",
      },
      {
        name: "Urtė Balevičiūtė",
        role: "Product Developer",
        image: "templates/team-urte-cut.webp",
        color: "#d0737f",
        backdrop: "linear-gradient(135deg,#c98a8c 0%,#96494c 100%)",
      },
    ],
    notes: [
      {
        label: "Why we started",
        body: "When we started building this in 2025, it wasn't because templates were trending. It was because every template product we bought had the same problem: they looked bad, took too long to customize, and often made the process slower than starting from scratch.",
      },
      {
        label: "What we built",
        body: "Over the past year, while running our agency and creating ads for clients every day, we kept testing, improving, and building a collection of 500 winning static creatives - the kind we wish we had the first time we bought templates ourselves.",
      },
      {
        label: "Why it matters",
        body: "We poured our hearts into creating a template product that is genuinely useful, actually makes the production faster, and feels worth paying for. Let's start supporting products that actually solve problems - not the ones that overpromise just to get you to buy.",
      },
    ],
  },
  /**
   * "Comparison" table, from the seventh supplied screenshot (2026-09-03):
   * Mushi as a raised purple column against three competitor template shops.
   * Competitor marks are styled text + drawn glyphs (interim rule, TOKENS.md).
   * `mushi`/`others` hold strings for value rows and booleans for
   * feature rows (true -> check, false -> red cross).
   */
  comparison: {
    eyebrow: "Comparison",
    heading: "Best Deal on The Market",
    competitors: ["CreativeOS", "Kandy", "Konvert"],
    rows: [
      { label: "Trustpilot Review Score", mushi: "4.9", others: ["3.1", "2.3", "3.3"] },
      { label: "Lowest Starting Price", mushi: "$5", others: ["$14", "$17", "$24"] },
      { label: "High-Quality Templates", mushi: true, others: [false, false, false] },
      { label: "24/7 Customer Support", mushi: true, others: [false, false, false] },
      { label: "14-Day Guarantee", mushi: true, others: [false, false, false] },
    ] as { label: string; mushi: string | boolean; others: (string | boolean)[] }[],
    cta: "Get Mushi",
  },
  /**
   * "Access" pricing section, from the sixth supplied screenshot
   * (2026-09-03): from-scratch pain vs the $5 template library, plus the
   * done-for-you banner bridging to the agency. Built entirely in CSS/emoji.
   * Right-list `icon` keys map to inline SVGs in TemplateSections.
   */
  access: {
    eyebrow: "Access",
    heading: "Save 10+ Hours Weekly",
    scratch: {
      emoji: "🥺",
      title: "Ad creation from scratch",
      sub: "This sucks…",
      figure: "-520 hours",
      unit: "/ year",
      items: [
        "Spend hours finding ad ideas",
        "Writing everything from zero",
        "Daily designing disasters",
        "Harder to stay consistent",
        "Slower creative testing",
        "Wasted ad spend",
        "Chaos every day",
      ],
      cta: "Try an Alternative",
    },
    templates: {
      emoji: "😎",
      title: "Ad creation with templates",
      sub: "For the cost of one coffee per month.",
      figure: "$5",
      unit: "/ month",
      chip: "50% Discount",
      items: [
        { icon: "icon-layers", label: "500 winner static templates" },
        { icon: "icon-sparkles", label: "50+ new templates monthly" },
        { icon: "icon-card", label: "14-day money-back guarantee" },
        { icon: "icon-headset", label: "24/7 customer support" },
        { icon: "icon-target", label: "5 industries covered" },
        { icon: "icon-tools", label: "Editable in Canva" },
        { icon: "icon-shield", label: "Secure Checkout" },
      ],
      cta: "Buy Now",
    },
    banner: {
      emoji: "🤩",
      title: "Done-for-you premium creatives",
      sub: "Growth partner for eCommerce, AI, SaaS.",
      cta: "Book Your Discovery Call",
    },
  },
  /**
   * "Showcase" section. The wall itself ships as the design's own baked
   * composition (templates/showcase-wall.webp, supplied 2026-09-04) — no
   * per-tile data needed anymore.
   */
  showcase: {
    eyebrow: "Showcase",
    heading: "1 cent = 1 design",
  },
  /**
   * "Process" three-step section. `card` is each step's real gradient
   * panel export (2026-09-04); `gradient` stays as its sampled CSS loading
   * fallback. The step VISUALS are still ~250px screenshot crops (soft on
   * retina) — real exports for those are still wanted.
   */
  /**
   * "Inside" bento section, from the fourth supplied screenshot (2026-09-03).
   * Unlike Difference/Process this one ships NO screenshot crops — every
   * visual (memoji circles, industry chips, star tiles, laurel sprigs, the
   * template collage) is rebuilt from CSS, emoji and the existing thumbs.
   * The Trustpilot mark is a styled-text stand-in, same interim rule as the
   * client logotypes in TOKENS.md.
   */
  inside: {
    eyebrow: "Inside",
    heading: "500 Winners in Your Drive",
    support: { big: "24/7", small: "support" },
    industries: { big: "5", small: "industries" },
    reviews: { caption: "5 star reviews" },
    monthly: { big: "50+ NEW", small: "templates monthly" },
  },
  process: {
    eyebrow: "Process",
    heading: "Quick to Launch, Hard to Miss",
    steps: [
      {
        step: "Step One",
        title: "Pick a Template",
        chip: "Easy Peasy!",
        image: "templates/process-pick.webp",
        card: "process-card-1.webp",
        alt: "Cursor picking a Back In Stock ad template from the Mushi library",
        gradient: "linear-gradient(150deg,#5e3d8a 0%,#53347b 45%,#512e7e 100%)",
      },
      {
        step: "Step Two",
        title: "Customize in Canva",
        chip: "Super fast!",
        image: "templates/process-canva.webp",
        card: "process-card-2.webp",
        alt: "The same template being edited in Canva",
        gradient: "linear-gradient(150deg,#8f3287 0%,#82296f 55%,#6d1a72 100%)",
      },
      {
        step: "Step Three",
        title: "Time to Test",
        chip: "Smashhh!",
        image: "templates/process-test.webp",
        card: "process-card-3.webp",
        alt: "Meta Ads Manager campaign list running A/B tests of the finished ad",
        gradient: "linear-gradient(160deg,#9b5b18 0%,#a95f14 55%,#b56815 100%)",
      },
    ],
  },
} as const;

/**
 * Footer, redesigned per the ninth supplied screenshot (2026-09-03).
 *
 * The design shows an email capture ("Enter your email*" + Redeem). No email
 * provider has been chosen and there is no server to post to, so the input
 * is deliberately not rendered — a form that silently discards submissions
 * is worse than none (design/SECTIONS.md). The Redeem CTA points at booking
 * until a provider exists; see the enablement note in SiteFooter.
 */

/** The bottom bar's links, declared once and ordered per frame below. */
/**
 * None of these documents exist yet, so every one carries `href: null` and the
 * footer renders it as text rather than as a link — see the note on NAV. The
 * hrefs they used to carry (#privacy, #terms, ...) pointed at anchors that are
 * nowhere on the page.
 */
const LEGAL = {
  privacy: { label: "Privacy Policy", href: null },
  terms: { label: "Terms & Conditions", href: null },
  refund: { label: "Refund Policy", href: null },
  guarantee: { label: "Money-Back Guarantee", href: null },
} as const;

/**
 * Footer, measured off the desktop reference (Žilvinas 2026-08-19).
 *
 * The CONTACT column is not a link list like the other two — it is an address
 * plus the social row — so it is modelled separately rather than being forced
 * into `columns` with an empty `links`.
 */
export const FOOTER = {
  /**
   * OFF for now (Žilvinas 2026-08-20). The heading, the field and the Redeem
   * button all stay in SiteFooter behind this flag, along with the
   * NEWSLETTER_ACTION wiring that turns the control back into a real POST —
   * flip it to true and the block returns exactly as it was. There is nothing
   * to redeem yet, and a capture that goes nowhere is worse than no capture.
   */
  giftEnabled: false,
  giftHeading: "Want a mystery gift?",
  emailPlaceholder: "Enter your email*",
  emailCta: "Redeem",
  columns: [
    {
      /**
       * Singular on the phone artboard, PLURAL on the desktop node — its head
       * `4134:627` sets "PRODUCTS", 143 wide. The frames disagree, so each
       * renders its own rather than one being applied to both.
       */
      title: "Product",
      titleDesktop: "Products",
      links: [
        { label: "500+ Static Templates", href: null },
        /**
         * Agency Services IS this page, so from here it goes to the final
         * card — the "You scrolled so far" one — rather than nowhere. From any
         * other page it will simply load the home page, which is the same
         * behaviour by another name.
         */
        { label: "Agency Services", href: `#${BOOKING_ANCHOR}` },
      ],
    },
    {
      title: "Company",
      titleDesktop: "Company",
      links: [{ label: "Case Studies", href: null }],
    },
  ],
  contactTitle: "Contact",
  /** 4.9 is the score the awards row already carries — see TrustBadges. */
  trustpilot: { label: "Trustpilot", score: "4.9" },
  /**
   * The bottom bar's four links. The two frames list them in DIFFERENT orders,
   * so the sequence cannot be shared even though the entries are:
   *
   *   phone  (node `4167:278`)  Money-Back · Terms · Refund · Privacy
   *   desktop (node `4167:280`) Privacy · Terms · Refund · Money-Back
   *
   * The desktop order is not an assumption — it is that node's own x positions,
   * 869 / 1040 / 1264 / 1434, and the reference screenshot reads the same way.
   * Both arrays hold the SAME objects, so a copy or href change lands in both
   * and the two can never drift into being different links.
   */
  legal: [LEGAL.guarantee, LEGAL.terms, LEGAL.refund, LEGAL.privacy],
  legalDesktop: [LEGAL.privacy, LEGAL.terms, LEGAL.refund, LEGAL.guarantee],
  /**
   * Also per frame: the phone artboard sets a comma and no symbol, the desktop
   * node `4134:633` sets "Copyright © 2026 All Rights Reserved". Verbatim from
   * each, rather than one of them applied to both.
   */
  copyright: "Copyright 2026, All Rights Reserved",
  copyrightDesktop: "Copyright \u00a9 2026 All Rights Reserved",
} as const;
