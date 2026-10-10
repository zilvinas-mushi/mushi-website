import type { Metadata } from "next";
import { Logo } from "@/components/shared/Logo";
import { APP_URL, CONTACT_EMAIL } from "@/lib/site";

/**
 * WHERE STRIPE SENDS A BUYER AFTER PAYING (2026-10-04, the launch; PRD:
 * "Phase 3 requirement: the Thank You page"). It tells them the three things
 * they need: log in at the webapp, use the same email, the code comes by
 * email.
 *
 * REACHED ONLY BY THE REDIRECT from a paid checkout — Stripe appends
 * `?session_id=cs_…`. Anyone arriving without one is sent to /templates by
 * the inline script below, before anything paints. That is a courtesy, not a
 * lock: the site is static and this page grants nothing — the account is
 * created by the webapp, from Stripe's own notice of the payment. When the
 * webapp can confirm a session, this check asks it instead.
 *
 * Not indexed, not in the sitemap, linked from nowhere.
 *
 * NO ARTWORK, so the paint gate has only the fonts to wait for.
 */
export const metadata: Metadata = {
  title: "Thank you",
  description: "Your Mushi account: how to log in.",
  robots: { index: false, follow: false },
};

/** Runs during parsing, ahead of the content below it. */
const REQUIRE_SESSION = `if(!/[?&]session_id=cs_[A-Za-z0-9_]+/.test(location.search))location.replace("/templates")`;

/**
 * PAID IN THE SMALL WINDOW (the sheet's "Pay with Link" opens Stripe's page
 * in a popup): hand this address to the tab that opened it and close, so the
 * buyer ends up on one Thank You page, in the tab they started in. If the
 * opener is out of reach — Stripe's page may sever it — the popup simply
 * shows this page itself.
 */
const RETURN_TO_OPENER = `try{if(window.name==="mushi-checkout"&&window.opener&&!window.opener.closed){window.opener.location.href=location.href;window.close()}}catch(e){}`;

// The site's violet button (Figma 5411:1102 / 5344:174: #a08ade 8% → #7c54b5
// 42% → #6e54b5 93%, at 157.18° on the phone and 167° on the desktop). It
// inverts to white with violet text on hover and on tap (CLAUDE.md,
// Interaction rules), cross-fading through the gradient.
const VIOLET =
  "[--ty-angle:157.18deg] md:[--ty-angle:167deg] bg-[linear-gradient(var(--ty-angle),#a08ade_8.06%,#7c54b5_42.01%,#6e54b5_93.22%)] text-white transition-all duration-300 ease-out hover:bg-[linear-gradient(var(--ty-angle),#fff_8.06%,#fff_42.01%,#fff_93.22%)] hover:text-[#6e54b5] active:bg-[linear-gradient(var(--ty-angle),#fff_8.06%,#fff_42.01%,#fff_93.22%)] active:text-[#6e54b5]";

// Step 3 is worded per frame: "and" on the phone (5411:1098), "&" on the
// desktop (5344:173).
const STEPS: React.ReactNode[] = [
  "Press the button below to open the login page.",
  "Enter the same email address you used when buying.",
  <>
    We’ll email you a 6-digit code to type in <span className="md:hidden">and</span>
    <span className="hidden md:inline">&amp;</span> access the platform.
  </>,
];

/**
 * BUILT 1:1 FROM TWO FIGMA FRAMES (2026-10-10): "Thank you page mobile"
 * (5545:73, 375 × 654) below md, "Thank you page desktop" (5545:72,
 * 1920 × 1080) from md up. Every size and gap is the frame's own, read off
 * the node metadata. The phone's are px, as the phone frame is not scaled;
 * the desktop's are rem — the root font-size is the 1920 scale (globals.css),
 * so a 1920 value ÷ 16 holds its proportion at every width. The page is the
 * frames' own #181818 (the artwork under each is covered by a solid fill),
 * so it is not the site black.
 */
export default function ThankYouPage() {
  return (
    <main className="flex flex-1 flex-col items-center bg-[#181818] px-[15px] pt-[24px] pb-[30px] text-center md:px-0 md:pt-[2.875rem] md:pb-[10.3125rem]">
      <script dangerouslySetInnerHTML={{ __html: `${REQUIRE_SESSION};${RETURN_TO_OPENER}` }} />
      {/* The wordmark is TYPE (Logo.tsx), sized so its ink fills the frame's
          logo slot: 66 × 20 on the phone (5409:1069), 150 × 45 on the desktop
          (5507:268). */}
      <div className="flex h-[20px] items-center justify-center md:h-[2.8125rem]">
        <Logo className="text-[25.5px] md:text-[3.625rem]" />
      </div>
      <h1 className="mt-[25px] w-[337px] text-[28px] font-semibold leading-[31px] text-white md:mt-[8.3125rem] md:w-auto md:text-[4rem] md:leading-[3.9375rem]">
        Thank you!
        <br />
        Your account is ready.
      </h1>
      <p className="mt-[13px] w-[345px] text-[16px] leading-[21px] text-[#969696] md:mt-[1.375rem] md:w-[31.6875rem] md:text-[1.625rem] md:leading-[2.0625rem]">
        Your payment went through.
        <br />
        Here is how to get to your templates.
      </p>
      <ol className="mt-[20px] flex w-[345px] flex-col gap-[10px] text-left md:mt-[1.625rem] md:w-[48.75rem] md:gap-[0.8125rem]">
        {STEPS.map((step, i) => (
          <li
            key={i}
            className="relative flex h-[72px] items-center rounded-[15px] bg-[#222222] pl-[52px] pr-[25px] md:h-[4.25rem] md:rounded-[1.25rem] md:pl-[4.625rem] md:pr-[1.3125rem]"
          >
            <span
              className="absolute left-[11px] top-[21px] grid size-[30px] place-items-center rounded-full bg-[#181818] text-[20px] font-medium leading-none text-white md:left-[0.6875rem] md:top-[0.6875rem] md:size-[2.875rem] md:text-[1.75rem]"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <span className="text-[16px] leading-[21px] tracking-[-0.8px] text-white md:text-[1.5rem] md:leading-[2.25rem] md:tracking-[-0.075rem]">{step}</span>
          </li>
        ))}
      </ol>
      <p className="mt-[10px] w-[207px] text-[15px] leading-[21px] text-[#969696] md:mt-[1.1875rem] md:w-[47.875rem] md:text-[1.5rem] md:leading-[2.25rem] md:tracking-[-0.015rem]">
        (Check your spam folder if you do not see the email.)
      </p>
      <a
        href={`${APP_URL}/login`}
        className={`mt-[13px] flex h-[50px] w-[345px] items-center justify-center rounded-[10px] text-[18px] font-medium uppercase md:mt-[1.5625rem] md:h-[3.875rem] md:w-[48.75rem] md:rounded-[0.9375rem] md:text-[1.5rem] ${VIOLET}`}
      >
        Go to login page
      </a>
      <p className="mt-[13px] w-[345px] text-[14px] leading-[18px] tracking-[-0.14px] text-[#797979] md:mt-[1.4375rem] md:w-[43.25rem] md:text-[1.25rem] md:leading-[1.75rem] md:tracking-[-0.0125rem]">
        If the login page does not recognise your email yet, give it a few minutes and try again, or write to{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </main>
  );
}
