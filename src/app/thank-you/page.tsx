import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
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

// The site's violet button (Figma 5411:1102: 157.18deg, #a08ade 8% → #7c54b5
// 42% → #6e54b5 93%). It inverts to white with violet text on hover and on
// tap (CLAUDE.md, Interaction rules), cross-fading through the gradient.
const VIOLET =
  "bg-[linear-gradient(157.18deg,#a08ade_8.06%,#7c54b5_42.01%,#6e54b5_93.22%)] text-white transition-all duration-300 ease-out hover:bg-[linear-gradient(157.18deg,#fff_8.06%,#fff_42.01%,#fff_93.22%)] hover:text-[#6e54b5] active:bg-[linear-gradient(157.18deg,#fff_8.06%,#fff_42.01%,#fff_93.22%)] active:text-[#6e54b5]";

const STEPS = [
  "Press the button below to open the login page.",
  "Enter the same email address you used when buying.",
  "We\u2019ll email you a 6-digit code to type in and access the platform.",
];

/**
 * BUILT 1:1 FROM FIGMA "Thank you page mobile" (5545:73, 375 × 654,
 * 2026-10-10). Every size and gap below is that frame's, read off the
 * node metadata; the desktop frame is still to come. The page is the
 * frame's own #181818 (the artwork under it is covered by a solid fill),
 * so it is not the site black.
 */
export default function ThankYouPage() {
  return (
    <main className="flex flex-1 flex-col items-center bg-[#181818] px-[15px] pt-[24px] pb-[30px] text-center">
      <script dangerouslySetInnerHTML={{ __html: `${REQUIRE_SESSION};${RETURN_TO_OPENER}` }} />
      {/* The wordmark is TYPE (Logo.tsx), sized so its ink fills the frame's
          66 × 20 logo slot (5409:1069). */}
      <div className="flex h-[20px] items-center justify-center">
        <Logo className="text-[25.5px]" />
      </div>
      <h1 className="mt-[25px] w-[337px] text-[28px] font-semibold leading-[31px] text-white">
        Thank you!
        <br />
        Your account is ready.
      </h1>
      <p className="mt-[13px] w-[345px] text-[16px] leading-[21px] text-[#969696]">
        Your payment went through.
        <br />
        Here is how to get to your templates.
      </p>
      <ol className="mt-[20px] flex w-[345px] flex-col gap-[10px] text-left">
        {STEPS.map((step, i) => (
          <li key={step} className="relative flex h-[72px] items-center rounded-[15px] bg-[#222222] pl-[52px] pr-[25px]">
            <span className="absolute left-[11px] top-[21px] grid size-[30px] place-items-center rounded-full bg-[#181818] text-[20px] font-medium leading-none text-white" aria-hidden="true">
              {i + 1}
            </span>
            <span className="text-[16px] leading-[21px] tracking-[-0.8px] text-white">{step}</span>
          </li>
        ))}
      </ol>
      <p className="mt-[10px] w-[207px] text-[15px] leading-[21px] text-[#969696]">
        (Check your spam folder if you do not see the email.)
      </p>
      <a
        href={`${APP_URL}/login`}
        className={`mt-[13px] flex h-[50px] w-[345px] items-center justify-center rounded-[10px] text-[18px] font-medium uppercase ${VIOLET}`}
      >
        Go to login page
      </a>
      <p className="mt-[13px] w-[345px] text-[14px] leading-[18px] tracking-[-0.14px] text-[#797979]">
        If the login page does not recognise your email yet, give it a few minutes and try again, or write to{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </main>
  );
}
