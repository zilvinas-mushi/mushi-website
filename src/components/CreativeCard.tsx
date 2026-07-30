import type { Creative } from "@/lib/content";

/**
 * Instagram-post card used in the creatives rail.
 *
 * The design frames every ad creative as a real IG post: white card, account
 * header with avatar + handle + verified tick + caption, the media, then the
 * action bar. Keeping that chrome in one component means adding a creative is
 * a data entry in content.ts, not new markup.
 *
 * Icons are inline SVG rather than an icon package — the site is a static
 * export and this avoids shipping a dependency for six glyphs.
 */

function Verified() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[13px] shrink-0"
      aria-label="Verified account"
      role="img"
    >
      <path
        fill="#0095F6"
        d="M12 1.5l2.6 2.1 3.3-.3.9 3.2 2.9 1.7-1.3 3.1 1.3 3.1-2.9 1.7-.9 3.2-3.3-.3L12 22.5l-2.6-2.1-3.3.3-.9-3.2-2.9-1.7 1.3-3.1-1.3-3.1 2.9-1.7.9-3.2 3.3.3L12 1.5z"
      />
      <path
        fill="#fff"
        d="M10.8 15.3l-3-3 1.1-1.1 1.9 1.9 4.3-4.3 1.1 1.1-5.4 5.4z"
      />
    </svg>
  );
}

/** Stroke icons matching Instagram's action row. */
const ICON = "size-[22px] stroke-black";

function Heart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" className={ICON} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20.3l-1.4-1.3C5.6 14.5 2.5 11.7 2.5 8.2 2.5 5.4 4.7 3.2 7.5 3.2c1.6 0 3.1.7 4.1 1.9l.4.5.4-.5c1-1.2 2.5-1.9 4.1-1.9 2.8 0 5 2.2 5 5 0 3.5-3.1 6.3-8.1 10.8L12 20.3z"
      />
    </svg>
  );
}

function Comment() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" className={ICON} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 11.5c0 4.1-3.9 7.5-8.7 7.5-1.1 0-2.2-.2-3.2-.5L3.5 20.5l1.6-4.1C4 15 3.3 13.3 3.3 11.5 3.3 7.4 7.2 4 12 4s9 3.4 9 7.5z"
      />
    </svg>
  );
}

function Share() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" className={ICON} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.5 3.5L2.8 9.9l6.6 2.6 2.6 6.6 9.5-15.6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.5 3.5L9.4 12.5" />
    </svg>
  );
}

function Bookmark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" className={ICON} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V4.5A1.5 1.5 0 016.5 3h11A1.5 1.5 0 0119 4.5V21z" />
    </svg>
  );
}

export function CreativeCard({ item }: { item: Creative }) {
  return (
    <article className="w-[280px] shrink-0 snap-start overflow-hidden rounded-[15px] bg-white sm:w-[300px]">
      <header className="flex items-center gap-2.5 px-3 py-2.5">
        {item.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/creatives/${item.avatar}`}
            alt=""
            width={32}
            height={32}
            loading="lazy"
            decoding="async"
            className="size-8 shrink-0 rounded-full object-cover"
          />
        ) : (
          // Placeholder until account avatars are supplied — a neutral disc
          // with the handle's initial, never a stand-in photo.
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[13px] font-semibold text-zinc-600"
          >
            {item.handle.charAt(0).toUpperCase()}
          </span>
        )}

        <div className="min-w-0">
          <p className="flex items-center gap-1 text-[13px] font-semibold leading-tight text-black">
            <span className="truncate">{item.handle}</span>
            {item.verified && <Verified />}
          </p>
          <h3 className="truncate text-[12px] leading-tight text-black/70">
            {item.caption}
          </h3>
        </div>
      </header>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/images/${item.image}`}
        alt={`${item.caption} — ad creative for ${item.handle}`}
        width={item.w}
        height={item.h}
        loading="lazy"
        decoding="async"
        // Creatives are portrait ads; a 4:5 crop cut the tops and bottoms off.
        // 9:16 matches the source material, so the whole ad stays visible.
        className="aspect-[9/16] w-full bg-zinc-100 object-cover"
      />

      <footer className="flex items-center justify-between px-3 py-2.5">
        <span className="flex items-center gap-3.5">
          <Heart />
          <Comment />
          <Share />
        </span>
        <Bookmark />
      </footer>
    </article>
  );
}
