/**
 * THE THREE LEGAL DOCUMENTS — Privacy Policy, Terms & Conditions, Refund
 * Policy — as data. One page template (src/app/legal/[slug]/page.tsx,
 * components/LegalPage.tsx) renders all three; change the layout there and
 * every document follows, change a document here and the layout is untouched.
 *
 * Copy is the Figma "WEB: Legal" page, verbatim (design/LEGAL.md has the
 * nodes), with Figma's manual line wraps removed so the browser wraps for the
 * column it has. Two exceptions, both flagged there: the Terms section 11
 * title reads "Out Intellectual Property" in the file and "Our" here, and the
 * Privacy Scope list is whatever the file has.
 *
 * `updated` is the date shown under the title. Change it when the text does.
 */

export type LegalBlock =
  /** Body copy. `\n` is a line break, a blank line is a blank line. */
  | { kind: "p"; text: string }
  /** A numbered clause: the number in white Medium, the text in the body's 75%.
      `list` is the lettered (a) (b) run some Terms clauses end with. */
  | { kind: "clause"; n: string; text: string; list?: readonly string[] }
  /** A bulleted list, optionally under a plain-text label of its own. */
  | { kind: "ul"; label?: string; items: readonly string[] }
  /** A sub-heading ("3.1 Automatically collected information:") and what
      sits under it, indented one step on desktop. */
  | { kind: "sub"; n: string; title: string; blocks: readonly LegalBlock[] };

export type LegalSection = { title: string; blocks: readonly LegalBlock[] };

export type LegalDoc = {
  slug: string;
  title: string;
  /** The nav's icon for this document — see LegalPage. */
  icon: "lock" | "file" | "refresh";
  /** Shown as "Last updated: …", verbatim. */
  updated: string;
  description: string;
  /** Paragraphs above the first numbered section. */
  intro: readonly string[];
  sections: readonly LegalSection[];
};

const p = (text: string): LegalBlock => ({ kind: "p", text });
const c = (n: string, text: string, list?: readonly string[]): LegalBlock =>
  list ? { kind: "clause", n, text, list } : { kind: "clause", n, text };
const ul = (items: readonly string[], label?: string): LegalBlock =>
  label ? { kind: "ul", label, items } : { kind: "ul", items };
const sub = (n: string, title: string, ...blocks: LegalBlock[]): LegalBlock => ({
  kind: "sub",
  n,
  title,
  blocks,
});

export const CONTACT_ADDRESS = "Šermukšnių g. 1, Giraitės k., LT-54307 Kauno r., Lithuania";

/** The three automatically-collected bullets, used in Scope AND 3.1 — see the note on Scope. */
const AUTOMATIC = [
  "IP address, approximate location derived from it, browser and device type, operating system, language, referring URL",
  "pages viewed, time on page, clicks, scrolling, mouse movement and session recordings (via Microsoft Clarity)",
  "cookie and advertising identifiers",
] as const;

export const PRIVACY_POLICY: LegalDoc = {
  slug: "privacy-policy",
  title: "Privacy Policy",
  icon: "lock",
  updated: "5 October 2026",
  description:
    "How Mushi, MB collects, uses, shares and keeps personal data on mushi.agency and the Mushi Platform, and your rights under the GDPR.",
  intro: [],
  sections: [
    {
      title: "Who We Are",
      blocks: [
        p(
          'Mushi, MB ("Mushi", "we", "us") is a company registered in the Republic of Lithuania, legal entity code 306918185, VAT code LT100019677619, registered address Šermukšnių g. 1, Giraitės k., LT-54307 Kauno r., Lithuania.\n\nWe are the data controller for the personal data described in this policy.\n\nContact for privacy matters: support@mushi.agency',
        ),
      ],
    },
    {
      title: "Scope",
      // The Figma frame lists the same three bullets here as under 3.1
      // (nodes 5506:608 and 5504:477). Reproduced as drawn; see design/LEGAL.md.
      blocks: [sub("2.1", "This policy covers:", ul(AUTOMATIC))],
    },
    {
      title: "What We Collect",
      blocks: [
        sub("3.1", "Automatically collected information:", ul(AUTOMATIC)),
        sub(
          "3.2",
          "Agency enquiries:",
          ul([
            "name, email address, company name, phone number where provided",
            "the content of your enquiry and any subsequent correspondence",
            "booking details when you schedule a call through Calendly, including the date, time and any information you enter in the booking form",
          ]),
        ),
        sub(
          "3.3",
          "Platform customers:",
          ul([
            "email address (used as your account identifier)",
            "one-time sign-in codes we send to your email",
            "purchase records: products bought, amount, currency, date, invoice data",
            "billing country and the information needed for tax and accounting purposes",
            "support messages you send us",
          ]),
        ),
        sub(
          "3.4",
          "Payment data:",
          p(
            "We do not collect or store your card or bank details. Payments are processed by Stripe, Inc., which collects your payment information directly. We receive only confirmation of payment, the last four digits of the card, the card brand and the billing country. Stripe processes this data as an independent controller under its own privacy policy: https://stripe.com/privacy",
          ),
        ),
        sub(
          "3.5",
          "Marketing subscribers:",
          ul([
            "email address, and name where provided",
            "sign-up source and date",
            "email engagement data: opens, clicks, unsubscribes",
          ]),
        ),
      ],
    },
    {
      title: "How We Use Your Data",
      blocks: [
        p(
          [
            "Purpose: providing access to the Platform and the templates you purchased\nLegal basis: performance of a contract (Art. 6(1)(b) GDPR)",
            "Purpose: authenticating you by email code and maintaining your account\nLegal basis: performance of a contract",
            "Purpose: processing payments, issuing invoices, meeting accounting and tax obligations\nLegal basis: legal obligation (Art. 6(1)(c)) and performance of a contract",
            "Purpose: responding to enquiries and scheduling calls about agency services\nLegal basis: steps prior to entering a contract (Art. 6(1)(b)) and our legitimate interest in responding to business enquiries (Art. 6(1)(f))",
            "Purpose: customer support\nLegal basis: performance of a contract and legitimate interest",
            "Purpose: sending marketing emails about our products and services\nLegal basis: your consent (Art. 6(1)(a)), or our legitimate interest where you are an existing customer and we market similar products, subject to your right to opt out at any time",
            "Purpose: analytics, measuring website and campaign performance, session recordings\nLegal basis: your consent",
            "Purpose: advertising, retargeting, building and uploading audience lists to advertising platforms, measuring ad conversions including server-side measurement\nLegal basis: your consent",
            "Purpose: securing our systems, preventing fraud and abuse\nLegal basis: legitimate interest",
            "Purpose: establishing, exercising or defending legal claims\nLegal basis: legitimate interest and legal obligation",
          ].join("\n\n"),
        ),
      ],
    },
    {
      title: "Cookies And Tracking",
      blocks: [
        p(
          "We use cookies and similar technologies (pixels, local storage, SDKs, software development kits and server-side tracking).",
        ),
        sub(
          "5.1",
          "Strictly necessary:",
          ul([
            "Required for the website and Platform to function, including sign-in sessions, security and load balancing. These do not require consent.",
          ]),
        ),
        sub(
          "5.2",
          "Analytics:",
          ul([
            "Google Analytics 4 (Google Ireland Limited) - measures traffic, sources and on-site behaviour.",
            "Microsoft Clarity (Microsoft Corporation) - heatmaps and session recordings, which capture mouse movement, clicks, scrolling and navigation. We configure Clarity to mask text entered into form fields.",
          ]),
        ),
        sub(
          "5.3",
          "Advertising:",
          ul([
            "Meta Pixel (Meta Platforms Ireland Limited) - measures ad performance and enables retargeting.",
            "Meta Conversions API - sends event data about your interactions directly from our servers to Meta, including hashed identifiers such as your email address where available. This supplements the Pixel and serves the same purposes.",
          ]),
        ),
        sub(
          "5.4",
          "Your choices:",
          p(
            "Analytics and advertising technologies are used only with your consent. You can give, refuse or withdraw consent at any time through the cookie settings on our website. You can also block or delete cookies in your browser, and opt out of personalised advertising at:",
          ),
          ul(["Google: https://adssettings.google.com", "Meta: in your Facebook or Instagram ad preferences"]),
          p("Withdrawing consent does not affect processing carried out before withdrawal."),
        ),
      ],
    },
    {
      title: "Advertising Audiences",
      blocks: [
        p(
          "We may upload email addresses to Meta and Google in hashed form to create custom audiences and lookalike audiences, so that we can show ads to existing contacts or to people with similar characteristics. Hashing means the platform receives an irreversible encoded value rather than your email address in plain text.\n\nWe do this on the basis of your consent, or our legitimate interest where you are an existing customer. You can object at any time by emailing support@mushi.agency, and we will remove you from these audiences.",
        ),
      ],
    },
    {
      title: "Who We Share Data With",
      blocks: [
        p(
          "We do not sell your personal data. We share it with the following categories of recipients, who act as our processors unless stated otherwise:",
        ),
        ul(
          [
            "Vercel Inc. (United States) - hosting of the Platform",
            "Cloudflare, Inc. (United States) - website hosting, content delivery and security",
            "Supabase, Inc. (United States) - database and authentication",
          ],
          "Hosting and infrastructure",
        ),
        ul(["Stripe, Inc. (United States) - payment processing, as an independent controller"], "Payments"),
        ul(
          ["Klaviyo, Inc. (United States) - transactional and marketing email, sign-up forms"],
          "Email and marketing",
        ),
        ul(["Intercom, Inc. (United States) - customer support messaging"], "Support"),
        ul(["Calendly LLC (United States) - call booking for agency enquiries"], "Scheduling"),
        ul(
          [
            "Google Ireland Limited - Google Analytics 4, Google Ads",
            "Meta Platforms Ireland Limited - Meta Pixel, Conversions API, advertising",
            "Microsoft Corporation - Clarity",
          ],
          "Analytics and advertising",
        ),
        p(
          "We may also disclose data to our accountants, legal advisers, and to public authorities where required by law.",
        ),
      ],
    },
    {
      title: "International Transfers",
      blocks: [
        p(
          "Some of our processors are established outside the European Economic Area, primarily in the United States. Where data is transferred outside the EEA, we rely on:",
        ),
        ul([
          "the European Commission's adequacy decision for the EU-U.S. Data Privacy Framework, where the recipient is certified under it; or",
          "Standard Contractual Clauses approved by the European Commission, together with supplementary measures where needed.",
        ]),
        p("You can request a copy of the relevant safeguards by emailing support@mushi.agency"),
      ],
    },
    {
      title: "How Long We Keep Data",
      blocks: [
        p(
          [
            "Account and purchase data: for the duration of your account and 10 years after the last transaction, to meet Lithuanian accounting and tax requirements.",
            "Invoices and accounting records: 10 years, as required by Lithuanian law.",
            "Marketing data: until you unsubscribe or withdraw consent, and up to 2 years of inactivity after that.",
            "Agency enquiries and call bookings: 2 years from the last contact, unless a contract results, in which case contract retention periods apply.",
            "Support conversations: 3 years from the last message.",
            "Analytics and advertising data: up to 14 months, or the retention period set by the relevant platform.",
            "Session recordings: up to 30 days.",
            "Server logs: up to 12 months.",
          ].join("\n\n"),
        ),
      ],
    },
    {
      title: "Your Rights",
      blocks: [
        p("Under the GDPR you have the right to:"),
        ul([
          "access the personal data we hold about you",
          "have inaccurate data corrected",
          "have your data erased",
          "restrict how we process your data",
          "receive your data in a portable, machine-readable format",
          "object to processing based on legitimate interest, including profiling",
          "object to direct marketing at any time, with no reason required",
          "withdraw consent at any time, without affecting earlier processing",
          "not be subject to decisions based solely on automated processing that produce legal or similarly significant effects. We do not carry out such decision-making.",
        ]),
        p(
          "To exercise any right, email support@mushi.agency. We respond within one week. We may ask you to confirm your identity before acting on a request.\n\nIf you believe we have handled your data unlawfully, you may lodge a complaint with the Lithuanian State Data Protection Inspectorate (Valstybinė duomenų apsaugos inspekcija), L. Sapiegos g. 17, LT-10312 Vilnius, ada@ada.lt, https://vdai.lrv.lt, or with the supervisory authority in your country of residence.",
        ),
      ],
    },
    {
      title: "Security",
      blocks: [
        p(
          "We use encryption in transit and at rest, access controls, passwordless authentication by one-time email code, and limit access to personal data to those who need it. No system is completely secure, but we take appropriate technical and organisational measures proportionate to the risk, and we will notify you and the supervisory authority of a personal data breach where the law requires it.",
        ),
      ],
    },
    {
      title: "Agency Clients",
      blocks: [
        p(
          "When we provide advertising and creative services to business clients, we may process personal data on their behalf, for example when managing their advertising accounts or uploading their customer lists as advertising audiences. In those cases our client is the data controller and we act as a processor under a separate data processing agreement. This privacy policy does not apply to that processing. If you are a customer of one of our clients, please refer to that company's privacy policy.",
        ),
      ],
    },
    {
      title: "Children",
      blocks: [
        p(
          "The Platform is intended for business users. You must be at least 18 years old to purchase from us. We do not knowingly collect personal data from children. We do not send marketing emails to anyone under 16. If you believe a child has provided us with personal data, email support@mushi.agency and we will delete it.",
        ),
      ],
    },
    {
      title: "Changes To This Policy",
      blocks: [
        p(
          "We may update this policy from time to time. The current version is always published at mushi.agency with the date of the last update at the top. If we make material changes, we will notify registered customers by email before the changes take effect.",
        ),
      ],
    },
    {
      title: "Contact",
      blocks: [p(`Mushi, MB\n${CONTACT_ADDRESS}\nLegal entity code 306918185\nsupport@mushi.agency`)],
    },
  ],
};

export const TERMS_AND_CONDITIONS: LegalDoc = {
  slug: "terms-and-conditions",
  title: "Terms & Conditions",
  icon: "file",
  updated: "6 October 2026",
  description:
    "The terms for the Mushi Platform at app.mushi.agency: subscriptions, the 14-day guarantee, your licence to use the templates, and what you may not do with them.",
  intro: [],
  sections: [
    {
      title: "About Us And These Terms",
      blocks: [
        c(
          "1.1.",
          'The Platform at app.mushi.agency is operated by Mushi, MB, a company registered in the Republic of Lithuania, legal entity code 306918185, VAT code LT100019677619, registered address Šermukšnių g. 1, Giraitės k., LT-54307 Kauno r., Lithuania ("Mushi", "we", "us").',
        ),
        c(
          "1.2.",
          'These Terms and Conditions ("Terms") govern your access to and use of the Platform and the template library available through it. By creating an account or completing a purchase, you agree to these Terms.',
        ),
        c(
          "1.3.",
          "These Terms do not cover our agency services. Advertising, media buying and creative production services are governed by a separate written agreement between Mushi and the client concerned.",
        ),
        c(
          "1.4.",
          "Our Privacy Policy, published at mushi.agency, explains how we handle personal data and forms part of these Terms.",
        ),
      ],
    },
    {
      title: "Definitions",
      blocks: [
        p(
          [
            '"Platform" means the web application at app.mushi.agency.',
            '"Templates" means the static advertising creative templates made available through the Platform, delivered as links to designs hosted on Canva.',
            '"Subscription" means a paid monthly, quarterly or annual plan giving access to the Platform.',
            '"Subscriber", "you" means the person or entity holding an active Subscription.',
            '"Organisation" means the company, agency, team or sole trader on whose behalf the Subscription is held.',
          ].join("\n\n"),
        ),
      ],
    },
    {
      title: "Eligibility",
      blocks: [
        c("3.1.", "You must be at least 18 years old to purchase a Subscription."),
        c(
          "3.2.",
          "If you purchase on behalf of a company or other entity, you confirm that you are authorised to bind that entity to these Terms.",
        ),
        c(
          "3.3.",
          "We sell worldwide. You are responsible for ensuring that your use of the Templates complies with the laws of your own country and with the policies of any advertising platform on which you run them.",
        ),
      ],
    },
    {
      title: "Accounts & Sign-In",
      blocks: [
        c(
          "4.1.",
          "Access requires an account tied to an email address. We do not use passwords. You sign in by entering a one-time code that we send to your email address.",
        ),
        c(
          "4.2.",
          "You are responsible for keeping access to that email address secure. Any person able to receive email at that address can access your account.",
        ),
        c("4.3.", "You must provide accurate information and keep it up to date."),
        c(
          "4.4.",
          "Notify us at support@mushi.agency without delay if you believe your account has been accessed without your authorisation.",
        ),
      ],
    },
    {
      title: "Subscriptions, Pricing & Payment",
      blocks: [
        c(
          "5.1.",
          "Subscriptions are offered on monthly, quarterly and annual plans. The plan and price are shown at checkout before you confirm your purchase.",
        ),
        c(
          "5.2.",
          "Prices are set in US dollars and may be displayed in your local currency, including euro, based on your location.",
        ),
        c(
          "5.3.",
          "All prices shown include value added tax where applicable. VAT is applied at the rate of your country and is calculated automatically at checkout.",
        ),
        c(
          "5.4.",
          "Payments are processed by Stripe, Inc. We do not receive or store your card details. By purchasing, you also accept Stripe's terms.",
        ),
        c(
          "5.5.",
          "You authorise us to charge your payment method for the Subscription fee at the start of each billing period until the Subscription is cancelled.",
        ),
        c(
          "5.6.",
          "If a payment fails, we may retry it. If payment cannot be collected, we may suspend access until the outstanding amount is paid.",
        ),
      ],
    },
    {
      title: "Auto-Renewal, Cancellation & Price Changes",
      blocks: [
        c(
          "6.1.",
          "Subscriptions renew automatically at the end of each billing period for a further period of the same length, at the then-current price, unless cancelled.",
        ),
        c(
          "6.2.",
          "You may cancel at any time through your account or by emailing support@mushi.agency. Cancellation takes effect at the end of the billing period you have already paid for. You keep access until that date. No partial refund is given for the remainder of a period.",
        ),
        c(
          "6.3.",
          "We may change Subscription prices. We will give you at least one month's written notice before a price change applies to your Subscription. If you do not accept the new price, you may cancel before it takes effect, and the change will not apply to any period you have already paid for.",
        ),
      ],
    },
    {
      title: "Fourteen-Day Money-Back Guarantee",
      blocks: [
        c(
          "7.1.",
          "We offer a 14-day money-back guarantee on your first Subscription payment. To claim it, email support@mushi.agency within 14 days of that payment. We will refund the amount paid in full.",
        ),
        c("7.2.", "The guarantee applies to your first payment only. Renewal payments are not covered."),
        c(
          "7.3.",
          "If a refund is issued, your access to the Platform ends immediately and your licence under section 8 terminates. You must stop using any Templates obtained through the Platform.",
        ),
        c(
          "7.4.",
          "Requests made after the 14-day period are considered at our sole discretion. We are under no obligation to grant them.",
        ),
        c(
          "7.5.",
          "Consumers in the European Union have a statutory right to withdraw from a distance contract within 14 days. Where you have expressly requested immediate access to the Platform and acknowledged at checkout that you lose your right of withdrawal once access is granted, that statutory right does not apply. Our guarantee under clause 7.1 applies regardless.",
        ),
        c(
          "7.6.",
          "If you initiate a chargeback or payment dispute, we may suspend or terminate your access immediately pending resolution.",
        ),
      ],
    },
    {
      title: "Your Licence To Use The Templates",
      blocks: [
        c(
          "8.1.",
          "While your Subscription is active, we grant you a non-exclusive, non-transferable, worldwide licence to:",
          [
            "(a) access, edit and adapt the Templates;",
            "(b) use the resulting advertising creatives for your own business and for the businesses of your clients;",
            "(c) publish those creatives on any advertising platform, including Meta, Google, TikTok, LinkedIn, Pinterest and similar channels, and in organic and offline marketing;",
            "(d) use the Templates for an unlimited number of brands, clients and campaigns.",
          ],
        ),
        c(
          "8.2.",
          "Agencies, venture studios, holding companies and businesses operating multiple brands may use the Templates across all of their brands and clients under a single Subscription.",
        ),
        c(
          "8.3.",
          "Access may be shared with up to 10 people within your Organisation, including employees, contractors and team members. It may not be shared outside your Organisation, published, or made available to the general public.",
        ),
        c(
          "8.4.",
          "Advertising creatives you have created and published while your Subscription was active may continue to be used after the Subscription ends. The licence to access, edit or create new creatives from the Templates ends when the Subscription ends.",
        ),
        c(
          "8.5.",
          "Clause 8.4 does not apply where the Subscription ended because of a refund under clause 7.3 or a termination for breach under clause 13.",
        ),
      ],
    },
    {
      title: "Restrictions",
      blocks: [
        c("9.1.", "You may not:", [
          "(a) resell, redistribute, sub-license, lend, rent or give away the Templates, whether as a whole, in parts, or in a modified form;",
          "(b) include the Templates, or derivatives of them, in any template pack, marketplace listing, course, membership, or other product offered to third parties;",
          "(c) share your account credentials, sign-in codes or Canva links outside your Organisation, or post them publicly;",
          "(d) copy, clone or imitate the Platform, its design, structure or functionality;",
          "(e) copy or imitate our website, landing pages, marketing copy or brand assets;",
          "(f) present the Templates as your own product, or claim authorship of them as designs;",
          "(g) use the Templates in any content that is unlawful, defamatory, deceptive, hateful, sexually explicit, or that infringes the rights of others.",
        ]),
        c(
          "9.2.",
          "If you are interested in reselling, bundling or white-labelling our work, contact us at support@mushi.agency to discuss a partnership. Nothing in clause 9.1 prevents an arrangement agreed with us in writing.",
        ),
      ],
    },
    {
      title: "Canva",
      blocks: [
        c(
          "10.1.",
          "The Templates are delivered as links to designs hosted on Canva. To edit or download a Template, you need your own Canva account. A free Canva account is sufficient for editing.",
        ),
        c(
          "10.2.",
          "Some Templates include assets available only under Canva Pro. For those Templates, a Canva Pro subscription may be required in order to download the final creative. Many Templates do not use Pro assets.",
        ),
        c(
          "10.3.",
          "Canva is an independent third party. We do not control its service, pricing, availability or terms, and we are not responsible for changes to them. Your use of Canva is governed by Canva's own terms.",
        ),
      ],
    },
    {
      // "Out Intellectual Property" in the Figma frame (5527:1821) — a typo.
      title: "Our Intellectual Property",
      blocks: [
        c(
          "11.1.",
          "All Templates, designs, layouts, copy, the Platform itself, and our website and brand assets are created by us and remain our exclusive property. Nothing in these Terms transfers ownership to you.",
        ),
        c(
          "11.2.",
          "You own the advertising creatives you produce using the Templates to the extent of your own contributions, including your brand assets, product imagery and copy. The underlying Template designs remain ours.",
        ),
        c(
          "11.3.",
          "We add new Templates on an ongoing basis, currently around 50 per month. Subscribers with an active Subscription receive new Templates at no additional cost. We do not guarantee a specific number of additions in any given month.",
        ),
      ],
    },
    {
      title: "Acceptable Use",
      blocks: [
        c("12.1.", "You may not:", [
          "(a) scrape, crawl, harvest or use automated means to extract content from the Platform;",
          "(b) bulk-download the Templates other than through normal use;",
          "(c) reverse engineer, decompile or attempt to derive the source code of the Platform;",
          "(d) attempt to gain unauthorised access to the Platform, other accounts, or our systems;",
          "(e) interfere with or disrupt the Platform, including by introducing malicious code or placing an unreasonable load on our infrastructure;",
          "(f) circumvent any access restriction, rate limit or security measure.",
        ]),
      ],
    },
    {
      title: "Suspension And Termination",
      blocks: [
        c(
          "13.1.",
          "We may suspend or terminate your access with immediate effect if you breach section 9 or section 12, if we reasonably suspect fraud or unauthorised access, or if you initiate a chargeback.",
        ),
        c(
          "13.2.",
          "Where the breach is capable of being remedied and the circumstances allow, we will give you notice and a reasonable opportunity to remedy it first.",
        ),
        c(
          "13.3.",
          "If we terminate your access under clause 13.1, no refund is due for the remainder of the paid period.",
        ),
        c(
          "13.4.",
          "Termination does not affect any rights or liabilities that accrued before it, and sections 9, 11, 16, 17 and 19 continue to apply.",
        ),
      ],
    },
    {
      title: "Availability & Changes To The Platform",
      blocks: [
        c(
          "14.1.",
          "We aim to keep the Platform available at all times but do not guarantee uninterrupted access. Access may be interrupted for maintenance, updates, or reasons outside our control.",
        ),
        c(
          "14.2.",
          "We may change, improve or remove features of the Platform. We will not make changes that materially reduce the core benefit of an active Subscription without notice.",
        ),
        c(
          "14.3.",
          "If we decide to discontinue the Platform, we will give Subscribers reasonable advance notice. Where the Platform is discontinued before the end of a period you have paid for, and we have not given such notice, we will refund the unused portion of your Subscription fee on a pro rata basis.",
        ),
      ],
    },
    {
      title: "Support",
      blocks: [
        c(
          "15.1.",
          "We respond to in-platform support messages within 24 hours and to email enquiries sent to support@mushi.agency within 7 days.",
        ),
        c(
          "15.2.",
          "Support covers access, billing and use of the Platform. It does not include design services, campaign advice, or support for Canva itself.",
        ),
      ],
    },
    {
      title: "Disclaimers",
      blocks: [
        c(
          "16.1.",
          "The Templates are creative assets. We do not guarantee any advertising result, conversion rate, return on ad spend, reach or sales outcome. Advertising performance depends on your product, pricing, targeting, budget, landing pages and market conditions, all of which are outside our control.",
        ),
        c(
          "16.2.",
          "You are responsible for ensuring that any creative you publish complies with applicable advertising law and with the policies of the platform on which it runs. We are not responsible for ad rejections, account restrictions or policy enforcement by any advertising platform.",
        ),
        c(
          "16.3.",
          "You are responsible for the brand assets, images, claims and copy you add to the Templates, and you warrant that you hold the rights to use them.",
        ),
        c(
          "16.4.",
          'Except as expressly stated in these Terms, the Platform and the Templates are provided on an "as is" basis.',
        ),
      ],
    },
    {
      title: "Liability",
      blocks: [
        c(
          "17.1.",
          "Nothing in these Terms limits liability for death or personal injury caused by negligence, for fraud, or for any liability that cannot lawfully be limited.",
        ),
        c(
          "17.2.",
          "If you are a consumer, nothing in these Terms affects your statutory rights under the law of your country of residence.",
        ),
        c(
          "17.3.",
          "Subject to clauses 17.1 and 17.2, our total aggregate liability arising out of or in connection with these Terms shall not exceed the total Subscription fees you paid to us in the 12 months preceding the event giving rise to the claim.",
        ),
        c(
          "17.4.",
          "Subject to clauses 17.1 and 17.2, we are not liable for indirect or consequential loss, loss of profit, loss of business, loss of advertising spend, or reputational damage.",
        ),
      ],
    },
    {
      title: "Changes To These Terms",
      blocks: [
        c(
          "18.1.",
          "We may update these Terms. The current version is always published at mushi.agency with the date of the last update at the top.",
        ),
        c(
          "18.2.",
          "If we make material changes, we will notify active Subscribers by email at least 30 days before they take effect. If you do not accept the changes, you may cancel before they apply.",
        ),
      ],
    },
    {
      title: "Governing Law & Disputes",
      blocks: [
        c("19.1.", "These Terms are governed by the law of the Republic of Lithuania."),
        c(
          "19.2.",
          "Any dispute shall be resolved by the competent courts of the city of Vilnius, the Republic of Lithuania.",
        ),
        c(
          "19.3.",
          "If you are a consumer resident in the European Union, clauses 19.1 and 19.2 do not deprive you of the protection of the mandatory laws of your country of residence, and you may bring proceedings in the courts of that country.",
        ),
        c(
          "19.4.",
          "Consumers in the European Union may also use the European Commission's online dispute resolution platform at https://ec.europa.eu/consumers/odr",
        ),
      ],
    },
    {
      title: "Contact",
      blocks: [
        p(
          `Mushi, MB\n${CONTACT_ADDRESS}\nLegal entity code 306918185\nVAT code LT100019677619\nsupport@mushi.agency`,
        ),
      ],
    },
  ],
};

export const REFUND_POLICY: LegalDoc = {
  slug: "refund-policy",
  title: "Refund Policy",
  icon: "refresh",
  updated: "7 October 2026",
  description:
    "Mushi's 14-day money-back guarantee on a first subscription payment, what it covers, and how refunds, cancellations and chargebacks are handled.",
  intro: [
    "This Refund Policy applies to subscriptions purchased through the Mushi Platform at app.mushi.agency. It forms part of our Terms and Conditions. Terms defined there have the same meaning here.",
    `Mushi, MB, legal entity code 306918185, ${CONTACT_ADDRESS}.`,
  ],
  sections: [
    {
      title: "14-Day Money-Back Guarantee",
      blocks: [
        c("1.1.", "We offer a 14-day money-back guarantee on your first subscription payment."),
        c(
          "1.2.",
          "The guarantee is unconditional. You do not need to give a reason, and it does not matter how much of the Platform you have used.",
        ),
        c(
          "1.3.",
          "To claim it, email support@mushi.agency within 14 days of your first payment. Send the request from the email address linked to your account, or include that address in your message.",
        ),
        c("1.4.", "We refund the full amount paid."),
      ],
    },
    {
      title: "What The Guarantee Covers",
      blocks: [
        c("2.1.", "The guarantee applies to your first subscription payment only."),
        c(
          "2.2.",
          "Renewal payments are not covered. This includes monthly, quarterly and annual renewals. Once a subscription renews, that payment is non-refundable except under section 4 or section 5.",
        ),
        c(
          "2.3.",
          "If you cancel and later subscribe again, the guarantee does not apply to the new subscription.",
        ),
      ],
    },
    {
      title: "What Happens When We Refund You",
      blocks: [
        c("3.1.", "Your access to the Platform ends immediately."),
        c(
          "3.2.",
          "Your licence to use the Templates terminates. You must stop using any Templates obtained through the Platform, including in advertising creatives you have already produced from them.",
        ),
        c(
          "3.3.",
          "We process refunds to the original payment method through Stripe. The money usually reaches you within 5 to 10 business days, depending on your bank or card issuer.",
        ),
        c(
          "3.4.",
          "Refunds are issued in the currency of the original payment. We are not responsible for differences caused by exchange rate movements or fees charged by your bank.",
        ),
      ],
    },
    {
      title: "Requests After The 14 Days",
      blocks: [
        c(
          "4.1.",
          "Requests made after the 14-day period are considered at our sole discretion. We are under no obligation to grant them, and the standard position is that payments after 14 days are non-refundable.",
        ),
        c(
          "4.2.",
          "Where we do grant a refund after the 14-day period on a quarterly or annual plan, it is calculated pro rata for the unused full months remaining in the paid period. The months already used are not refunded.",
        ),
        c("4.3.", "Section 3 applies to any refund granted under this section."),
      ],
    },
    {
      title: "Cancellation",
      blocks: [
        c("5.1.", "Cancelling a subscription is not the same as requesting a refund."),
        c(
          "5.2.",
          "When you cancel, your subscription stops renewing and you keep access until the end of the period you have already paid for. No refund is due for that remaining time, and no partial refund is given for an unused period.",
        ),
        c("5.3.", "You can cancel at any time in your account or by emailing support@mushi.agency."),
      ],
    },
    {
      title: "If We Discontinue The Platform",
      blocks: [
        c(
          "6.1.",
          "If we discontinue the Platform before the end of a period you have paid for, and we have not given reasonable advance notice, we refund the unused portion of your subscription fee on a pro rata basis.",
        ),
      ],
    },
    {
      title: "Chargebacks",
      blocks: [
        c(
          "7.1.",
          "If you believe a payment is wrong, contact us at support@mushi.agency first. We will look into it.",
        ),
        c(
          "7.2.",
          "If you initiate a chargeback or payment dispute with your bank or card issuer, we may suspend or terminate your access immediately while it is being resolved.",
        ),
        c(
          "7.3.",
          "Where a chargeback is raised for a payment we have already refunded, or for a payment that was validly due, we may recover the amount and any associated fees.",
        ),
      ],
    },
    {
      title: "Consumers In The European Union",
      blocks: [
        c("8.1.", "EU consumers have a statutory right to withdraw from a distance contract within 14 days."),
        c(
          "8.2.",
          "Where you have expressly requested immediate access to the Platform and confirmed at checkout that you lose your right of withdrawal once access is granted, that statutory right does not apply.",
        ),
        c(
          "8.3.",
          "Our money-back guarantee under section 1 applies regardless, and gives you the same 14-day window.",
        ),
        c(
          "8.4.",
          "Nothing in this policy affects any statutory rights you have under the law of your country of residence.",
        ),
      ],
    },
    {
      title: "Contact",
      blocks: [
        p(
          `To request a refund or ask about this policy:\n\nMushi, MB\nsupport@mushi.agency\n${CONTACT_ADDRESS}\nLegal entity code 306918185`,
        ),
      ],
    },
  ],
};

/** In the order the Legal nav lists them — the Figma order. */
export const LEGAL_DOCS = [PRIVACY_POLICY, TERMS_AND_CONDITIONS, REFUND_POLICY] as const;

export const legalHref = (doc: Pick<LegalDoc, "slug">) => `/legal/${doc.slug}`;

/** The id a section's heading carries, which the table of contents links to. */
export const sectionId = (index: number) => `section-${index + 1}`;
