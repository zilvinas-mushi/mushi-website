# Creative assets

Drop-zone for the ad creatives shown in the "Want Creatives This Premium?"
rail, and the account avatars that go with them.

## Adding a creative

1. Put the media in `public/images/` (WebP, see CLAUDE.md — optimization is
   off, so export it at the size you want served).
2. Put the account avatar here, in `public/creatives/`. Square, ideally 96×96
   or larger; it renders at 32×32.
3. Add one entry to `CREATIVES.items` in `src/lib/content.ts`:

```ts
{
  handle: "sintra.ai",                      // account name in the card header
  caption: "AI Agents Comparison Video Ad", // line beneath the handle
  image: "your-file.webp",                  // in public/images
  w: 1080, h: 1350,                         // the media's real pixel size
  avatar: "sintra.webp",                    // optional, in public/creatives
  verified: true,                           // optional blue tick
}
```

No markup changes are needed — `CreativeCard` renders the post chrome (avatar,
handle, tick, caption, media, action bar) and the rail picks up new entries
automatically.

## Notes

- **`w`/`h` are required.** Every image needs explicit dimensions so the rail
  does not reflow while cards load.
- Media is cropped to a 4:5 box (`aspect-[4/5] object-cover`), matching the
  design. Portrait sources fit best; a landscape source will be centre-cropped.
- Without an `avatar` the card shows a neutral disc with the handle's initial.
  That is deliberate — better an obvious placeholder than a stand-in photo
  implying an account that isn't theirs.
- The rail is CSS scroll-snap with smooth scrolling and no JavaScript, so it
  keeps native trackpad and touch momentum and works before hydration.
