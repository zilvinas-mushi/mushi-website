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
 * Anchors are root-relative so the header works from /templates too — a bare
 * "#agency" would dead-end there. On the home page the browser still treats
 * "/#agency" as a same-document jump, so smooth scrolling is unaffected.
 */
export const NAV = [
  { label: "Agency", href: "/#agency" },
  { label: "Case Studies", href: "/#case-studies" },
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
export const HERO_FLOATERS = [
  { name: "Instagram", image: "image42.webp", pos: "left-[13%] top-[15%]", size: 90, rotate: "-10deg" },
  { name: "Google", image: "image44.webp", pos: "right-[13%] top-[12%]", size: 94, rotate: "8deg" },
  { name: "TikTok", image: "image45.webp", pos: "left-[10%] bottom-[26%]", size: 86, rotate: "7deg" },
  { name: "Facebook", image: "image43.webp", pos: "right-[10%] bottom-[24%]", size: 90, rotate: "-7deg" },
] as const;

/**
 * Stat panels that drift in from the left and right edges of the hero,
 * deliberately cropped by the viewport as in the design. They carry the same
 * proof copy the chips did — the chips only ever made sense as this artwork.
 *
 * Decorative: the same claims appear as real text elsewhere on the page, so
 * these are aria-hidden rather than duplicated to screen readers.
 */
export const HERO_PANELS = [
  {
    side: "left" as const,
    top: "17%",
    rotate: "-9deg",
    title: "Performance Score",
    lines: ["Successfully Reached 10M+ Views", "Consistently Considered to be Excellent"],
    emoji: "😎",
    /** Level-meter style: many thin segments, rising to the right. */
    meter: 14,
    bars: [],
  },
  {
    side: "left" as const,
    top: "58%",
    rotate: "-7deg",
    title: "Growth Performance Analysis",
    lines: ["Optimized for the Quarter", "Refined, Delivered & Measured"],
    /** Chart style: a few tall columns. */
    meter: 0,
    bars: [34, 58, 46, 76],
  },
  // Left side only. The design puts stat panels exclusively on the left; the
  // right edge carries just the platform marks. Mirroring them across both
  // sides made the hero symmetrical in a way the design deliberately is not.
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
      avatar: "celemi-logo.svg",
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
      avatar: "celemi-logo.svg",
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
      result: "Generated 700 sales calls & 1500 leads in 8 months.",
      tags: ["AI", "SALES", "VENUES"],
      image: "case-breezit.webp",
      logo: "breezit.svg",
      logoW: 98,
      glow: "radial-gradient(ellipse 62% 50% at 100% 0%, #e0621f66 0%, #e0621f21 45%, transparent 70%), radial-gradient(ellipse 56% 47% at 0% 100%, #e0621f59 0%, transparent 67%)",
      bg: "linear-gradient(158deg,#4a2c15 0%,#2a1a10 52%,#150e0a 100%)",
    },
    {
      brand: "Holo",
      result: "From $0k/month to $117k/month in 7 months",
      tags: ["AI", "MARKETING", "GENERATOR"],
      image: "case-holo.webp",
      logo: "holo.svg",
      logoW: 62,
      glow: "radial-gradient(ellipse 62% 50% at 100% 0%, #8a5cf673 0%, #8a5cf626 46%, transparent 72%), radial-gradient(ellipse 56% 47% at 0% 100%, #8a5cf659 0%, transparent 68%)",
      bg: "linear-gradient(158deg,#5a4a9a 0%,#33285e 50%,#191430 100%)",
    },
    {
      brand: "eany.io",
      result: "Helped find 3 evergreen ads for an 8 figure company.",
      tags: ["B2B", "MARKETPLACE", "RESELLERS"],
      image: "case-eany.webp",
      logo: "eany.svg",
      logoW: 96,
      glow: "radial-gradient(ellipse 72% 61% at 100% 100%, #3b82f666 0%, #3b82f621 45%, transparent 72%)",
      bg: "linear-gradient(158deg,#1c1f28 0%,#12141a 55%,#0a0b0e 100%)",
    },
    {
      brand: "we interiors",
      result: "From $13k/month to $75k/month in 3 months.",
      tags: ["ECOM", "FURNITURE", "HOME"],
      image: "case-we-interiors-v2.webp",
      logo: "we-interiors.webp",
      logoW: 133,
      // Near-black card with a warm yellow glow spilling from the
      // bottom-right behind the laptop; the label stays white.
      glow: "radial-gradient(ellipse 88% 72% at 58% 40%, #d9a42259 0%, #d9a42626 46%, transparent 74%)",
      bg: "linear-gradient(158deg,#1a1410 0%,#100d09 55%,#0a0908 100%)",
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
  sub: "We have a cap. We don't know if you're the right fit yet. But we'd love to find out in 15 minutes.",
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
export const FOOTER = {
  giftHeading: "Want a mystery gift?",
  emailPlaceholder: "Enter your email*",
  giftCta: "Redeem",
  trustpilot: { score: "4.9" },
  columns: [
    {
      title: "Products",
      links: [
        { label: "500+ Static Templates", href: "/templates" },
        { label: "Agency Services", href: "/#agency" },
      ],
    },
    {
      title: "Company",
      links: [{ label: "Case Studies", href: "/#case-studies" }],
    },
  ],
  contact: { title: "Contact", email: "support@mushi.agency" },
  /** Placeholder anchors until the legal pages exist. */
  legal: [
    { label: "Privacy Policy", href: "#privacy" },
    { label: "Terms & Conditions", href: "#terms" },
    { label: "Refund Policy", href: "#refund" },
    { label: "Money-Back Guarantee", href: "#guarantee" },
  ],
  copyright: "Copyright © 2026 All Rights Reserved",
} as const;
