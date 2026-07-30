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
export const HERO_FLOATERS = [
  { name: "Instagram", image: "image42.webp", pos: "left-[4%] top-[18%]", size: 58, rotate: "-8deg" },
  { name: "Google", image: "image44.webp", pos: "right-[6%] top-[12%]", size: 62, rotate: "7deg" },
  { name: "TikTok", image: "image45.webp", pos: "left-[8%] bottom-[16%]", size: 54, rotate: "6deg" },
  { name: "Facebook", image: "image43.webp", pos: "right-[4%] bottom-[20%]", size: 58, rotate: "-6deg" },
] as const;

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
    { name: "we interiors", logo: null, w: 0, h: 0 },
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
      image: "image143.webp",
      w: 538,
      h: 952,
      verified: true,
    },
    {
      handle: "celemi",
      caption: "Minimalistic Skincare Static Ad",
      image: "image139.webp",
      w: 631,
      h: 1125,
    },
    {
      handle: "tryholo.ai",
      caption: "AI Marketing UGC Video Ad",
      image: "image140.webp",
      w: 444,
      h: 792,
      verified: true,
    },
    {
      handle: "tevaplanter",
      caption: "Planter Comparison Static Ad",
      image: "image141.webp",
      w: 633,
      h: 1127,
    },
  ] satisfies Creative[],
} as const;

/**
 * Case studies.
 *
 * Brand-to-result pairings were verified against the design on 2026-07-28.
 * The original copy deck attached Breezit's result to Holo — do not reorder.
 *
 * Images: three were confirmed by opening the files. The `rectangle1611257xx`
 * series holds the real client screenshots, already perspective-warped to
 * match the design's tilted-device look. The separately-named device mockups
 * (`12-macbook-pro-…`, `iphone21`, `iphone-front1`) are EMPTY frames — in
 * Figma the visual is a frame plus a screenshot masked into it, and the flat
 * export split them apart. Using a frame alone renders a blank device.
 *
 * TODO(holo-image): no Holo screenshot exists in the export. Its card is a
 * composite that could not be reassembled from the pieces. Fix by exporting
 * that one node from Figma as a flattened image (1 get_screenshot call), or by
 * supplying a Holo screenshot directly.
 */
export const CASE_STUDIES = {
  heading: "Not Just Pretty, but Profitable.",
  items: [
    {
      brand: "Breezit",
      result: "Generated 700 sales calls & 1500 leads in 8 months.",
      tags: ["AI", "SALES", "VENUES"],
      image: "rectangle161125751.webp", // confirmed: Breezit landing page
    },
    {
      brand: "Holo",
      result: "From $0k/month to $117k/month in 7 months",
      tags: ["AI", "MARKETING", "GENERATOR"],
      image: "image239.webp", // UNCONFIRMED — see TODO(holo-image) above
    },
    {
      brand: "eany.io",
      result: "Helped find 3 evergreen ads for an 8 figure company.",
      tags: ["B2B", "MARKETPLACE", "RESELLERS"],
      image: "rectangle161125765.webp", // confirmed: eany.io catalogue
    },
    {
      brand: "we interiors",
      result: "From $13k/month to $75k/month in 3 months.",
      tags: ["ECOM", "FURNITURE", "HOME"],
      image: "rectangle161125747.webp", // confirmed: we interiors storefront
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
      date: "January 23, 2025",
      iso: "2025-01-23",
      author: "Hana Skomra",
      country: "PL",
      avatar: "hana-skomra-budre1.webp",
    },
    {
      title: "Media Buying Best Kept Secret...",
      body: [
        "...That is yours to discover. Mushi Agency is a collaborator who delivers. The team knows how to turn ideas into numbers and is communicative, analytical, creative, and creative. When they commit to a number, you can be sure they will do everything humanly possible to make it a reality. Mushi has my vote of confidence.",
      ],
      date: "November 01, 2024",
      iso: "2024-11-01",
      author: "David Kovger",
      country: "GB",
      avatar: "deividas-kovger2.webp",
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
  sub: "We have a cap. We don't know if you're the right fit yet. But we'd love to find out in 15 minutes.",
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
