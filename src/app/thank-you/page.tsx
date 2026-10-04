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

// The site's violet button: it inverts to white with violet text on hover and
// on tap (CLAUDE.md, Interaction rules), cross-fading through the gradient.
const VIOLET =
  "bg-[linear-gradient(117.51deg,#a08ade_10.47%,#7c54b5_45.54%,#6e54b5_98.13%)] text-white transition-all duration-300 ease-out hover:bg-[linear-gradient(117.51deg,#fff_10.47%,#fff_45.54%,#fff_98.13%)] hover:text-[#6e54b5] active:bg-[linear-gradient(117.51deg,#fff_10.47%,#fff_45.54%,#fff_98.13%)] active:text-[#6e54b5]";

const STEPS = [
  "Press the button below to open the login page.",
  "Enter the same email address you used when buying.",
  "We email you a 6-digit access code. Type it in and you are in.",
];

export default function ThankYouPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <script dangerouslySetInnerHTML={{ __html: `${REQUIRE_SESSION};${RETURN_TO_OPENER}` }} />
      {/* The wordmark is TYPE, so it is sized with a font-size: 38 on the
          phone, as in the phone header, and 48 from md up. */}
      <Logo className="text-[2.375rem] md:text-[3rem]" />
      <h1 className="mt-10 text-[32px] font-semibold leading-tight text-white md:text-[44px]">
        Thank you. Your account is ready.
      </h1>
      <p className="mt-4 max-w-[520px] text-[16px] leading-relaxed text-white/60 md:text-[18px]">
        Your payment went through. Here is how to get to your templates.
      </p>
      <ol className="mt-8 flex w-full max-w-[520px] flex-col gap-3 text-left">
        {STEPS.map((step, i) => (
          <li key={step} className="flex items-start gap-4 rounded-[14px] bg-[#181818] px-5 py-4 text-[16px] leading-snug text-white md:text-[18px]">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#222222] text-[14px] font-medium text-white/70" aria-hidden="true">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
      <p className="mt-4 max-w-[520px] text-[14px] leading-relaxed text-white/50 md:text-[16px]">
        (Check your spam folder if you do not see the email.)
      </p>
      <a
        href={`${APP_URL}/login`}
        className={`mt-8 flex h-[56px] w-full max-w-[520px] items-center justify-center rounded-[12px] text-[18px] font-medium ${VIOLET}`}
      >
        Go to login
      </a>
      <p className="mt-6 max-w-[520px] text-[14px] leading-relaxed text-white/50">
        If the login page does not recognise your email yet, give it a few minutes and try again, or write to{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-white/70 underline underline-offset-2">
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </main>
  );
}
