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

export const NAV = [
  { label: "Agency", href: "#agency" },
  { label: "Case Studies", href: "#case-studies" },
  { label: "Templates", href: "#templates" },
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
  /** One row per bar. `label` is 15px Poppins Medium; `w` is design px. */
  rows: { label: string; w: number }[];
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
    label: "Total Revenue (last 7 days)",
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
    rows: [
      { label: "Video 1", w: 94 },
      { label: "Video 2", w: 137 },
      // TODO(spec): row 3's width was not supplied — 60 is a placeholder.
      { label: "Video 3", w: 60 },
    ],
    ticks: ["0", "2K", "4K", "8K"],
  },
];

export const HERO = {
  eyebrow: "Growth Partner for eCom & AI brands",
  heading: "Your Path to $100M.",
  sub: "Paid ads, banger creatives, landing pages, and strategy - all led by us, under one roof.",
  primaryCta: "15 Minute Fit-Check",
  secondaryCta: "Steal Our Secrets",
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
    { name: "superior care.pet", logo: "superior-care.svg", w: 73, h: 25 },
    { name: "Holo", logo: "holo.svg", w: 62, h: 25 },
    { name: "we interiors", logo: "we-interiors.webp", w: 849, h: 153 },
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
  image: string;
  w: number;
  h: number;
  avatar?: string;
  verified?: boolean;
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
      w: 1320,
      h: 2340,
      avatar: "sintra-logo.svg",
      verified: true,
    },
    {
      handle: "celemi",
      caption: "Minimalistic Skincare Static Ad",
      image: "celemi-pouch.webp",
      w: 1320,
      h: 2340,
      avatar: "celemi-logo.webp",
    },
    {
      handle: "tryholo.ai",
      caption: "AI Marketing UGC Video Ad",
      image: "tryholo-10x.webp",
      w: 1320,
      h: 2340,
      avatar: "tryholo-logo.svg",
      verified: true,
    },
    {
      handle: "tevaplanter",
      caption: "Planter Comparison Static Ad",
      image: "tevaplanter-ad.webp",
      w: 1320,
      h: 2340,
      avatar: "tevaplanter-logo.svg",
    },

    // Exported from Figma at 1320x2340 and converted to WebP (12.9MB -> 0.52MB).
    // Handles are taken from the brand visible inside each ad, so nothing is
    // invented. The last two carry no visible brand — see TODO below.
    {
      handle: "sintra.ai",
      caption: "3D Character Hook Video Ad",
      image: "sintra-soshie.webp",
      w: 1320,
      h: 2340,
      avatar: "sintra-logo.svg",
      verified: true,
    },
    {
      handle: "bluechew",
      caption: "Tablet Benefit Static Ad",
      image: "bluechew.webp",
      w: 1320,
      h: 2340,
      avatar: "bluechew-logo.svg",
      verified: true,
    },
    {
      handle: "unive",
      caption: "Dream College Tool Static Ad",
      image: "unive-dream-college.webp",
      w: 1320,
      h: 2340,
      avatar: "unive-logo.svg",
      verified: true,
    },
    {
      handle: "celemi",
      caption: "Serum Product Video Ad",
      image: "celemi-serum.webp",
      w: 1320,
      h: 2340,
      avatar: "celemi-logo.webp",
    },
    // Owners confirmed against the design's own card headers.
    {
      handle: "SuperiorCarePet",
      caption: "Dog Food Voiceover Video Ad",
      image: "dogfood-real-results.webp",
      w: 1320,
      h: 2340,
      avatar: "superiorcarepet-logo.svg",
      verified: true,
    },
    {
      handle: "PersyBooths",
      caption: "Booth Storytelling Video Ad",
      image: "used-by-10000.webp",
      w: 1320,
      h: 2340,
      avatar: "persybooths-logo.svg",
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
export const CASE_STUDIES = {
  heading: "Not Just Pretty, but Profitable.",
  items: [
    {
      brand: "Breezit",
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
      image: "case-breezit-cut.webp",
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
      result: "From $0k/month to $117k/month\nin 7 months",
      tags: ["AI", "MARKETING", "GENERATOR"],
      // #8A5CF6 is the purple this card already wore as its wash, kept as-is.
      image: "case-holo-cut.webp",
      logo: "holo.svg",
      logoW: 62,
      // Same ramp as Breezit, same 27% near-black share of the square — only
      // the colour changes, so the two cards catch the light identically.
      bg: "radial-gradient(ellipse 114% 114% at 85% 97%, #8a5cf6 0%, #000000 100%)",
    },
    {
      brand: "eany.io",
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
      image: "case-eany-cut.webp",
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
      result: "From $13k/month to $75k/month\nin 3 months.",
      tags: ["ECOM", "FURNITURE", "HOME"],
      // The one card NOT keyed out of its export. Alone among the four, that
      // export's outline was rasterised WITHOUT antialiasing — 73% of its
      // boundary pixels are a hard step against 99-100% on the others — so
      // there is no soft edge to read and every way of cutting it out leaves
      // a saw along the lid.
      //
      // It does not need keying: Žilvinas supplied a clean render of the same
      // laptop, and its device bounding box lands within a few px of the
      // export's, so it drops in at 1:1 with the composition unchanged. The
      // flat we-interiors page is mapped into its transparent screen:
      //
      //   python3 scripts/build-we-interiors-card.py
      image: "case-we-interiors-macbook.webp",
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
  trustLine: "Trusted by 100+ brands",
  moreLabel: "View More",
  /** First three render immediately; the rest sit behind the disclosure. */
  visibleCount: 3,
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

export const FOOTER = {
  giftHeading: "Want a welcome gift?",
  /**
   * No email provider has been chosen and there is no server to post to, so
   * the capture input is deliberately not rendered — a form that silently
   * discards submissions is worse than none. See design/SECTIONS.md.
   */
  giftCta: "15 Minute Fit-Check",
  columns: [
    {
      title: "Product",
      links: [
        { label: "SEO Tools, Templates", href: "#templates" },
        { label: "Agency Services", href: "#agency" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "#privacy" },
        { label: "Terms & Conditions", href: "#terms" },
        { label: "Refund Policy", href: "#refund" },
        { label: "Money Back Guarantee", href: "#guarantee" },
      ],
    },
    {
      title: "Company",
      links: [{ label: "Case Studies", href: "#case-studies" }],
    },
  ],
  trustpilot: { score: "4.0", reviews: "100+ reviews" },
  copyright: "Copyright 2026 © Mushi Agency",
} as const;
