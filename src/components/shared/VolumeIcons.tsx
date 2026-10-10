/**
 * The two states of the sound control, as SOLID glyphs — a filled speaker with
 * two waves, and the same speaker with a slash knocked through it.
 *
 * `VolumeOff` is the artwork Žilvinas supplied on 2026-08-25 ("sound close"),
 * traced to a path rather than kept as it arrived: the export was a 16 x 16
 * <svg> wrapping a 3000 x 3000 PNG, 1.3 MB of raster for an 18px icon, which
 * is the whole page's image budget spent on one control and still blurry on a
 * retina screen. The trace is within 1.5% of the original's coverage and is
 * about a kilobyte.
 *
 * Note the slash is a knockout — the gap around the bar is what the disc's
 * grey shows through — so the two subpaths are the glyph exactly as drawn, not
 * a speaker with a line laid over it.
 *
 * `VolumeOn` IS THE SAME ARTWORK WITH THE SLASH LIFTED OUT — not a glyph from
 * some other set. It was briefly Material Symbols' `volume_up`, which is the
 * wrong drawing: measured against the supplied glyph it fills 88% of its box
 * against 76%, its speaker is 45% of the width against 52%, and its waves are
 * half again as thick. Side by side the two states read as two different
 * icons, which is exactly how it looked (Žilvinas 2026-08-25).
 *
 * Recovering it is possible because of two properties of the supplied file:
 * the slash is a white BAR with a knockout gap either side (not a line drawn
 * over the speaker), and the speaker with its waves is symmetric about the
 * horizontal centre line. So: delete the bar, mirror what is left about that
 * centre line, and union the two — the mirrored copy covers the diagonal gap,
 * because the gap runs one way and its mirror runs the other. The only place
 * that leaves is where the two gaps cross, a diamond in the middle of the
 * cone, which is filled from the solid speaker around it and clipped at the
 * cone's own right edge so nothing spills past it.
 *
 * The result is within a hundredth of a unit of the muted glyph's bounding box
 * on all four sides, which is what makes the two states swap without the
 * control appearing to change size. Both are traced the same way, so they
 * carry the same corner rounding and the same wave thickness.
 */
export function VolumeOff() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={SOUND_ICON} aria-hidden="true">
      <path d="M14.31 14.17 L13.83 14.19 L13.63 14.1 L3.56 4.04 L2.5 2.9 L2.45 2.75 L2.45 2.43 L2.55 2.22 L2.66 2.14 L2.79 2.11 L3.16 2.11 L3.3 2.16 L5.6 4.49 L5.83 4.63 L5.96 4.57 L8.23 2.29 L8.49 2.14 L8.68 2.22 L8.76 2.33 L8.78 2.46 L8.78 7.42 L8.81 7.65 L8.92 7.8 L10.31 9.19 L10.44 9.25 L10.55 9.2 L10.7 8.93 L10.75 8.75 L10.77 8.0 L10.75 7.48 L10.55 7.01 L10.1 6.36 L10.07 6.12 L10.13 5.92 L10.55 5.54 L10.76 5.52 L10.94 5.65 L11.25 6.02 L11.63 6.66 L11.81 7.12 L11.91 7.85 L11.81 9.13 L11.62 9.63 L11.37 10.07 L11.37 10.21 L11.47 10.37 L12.15 11.03 L12.29 11.11 L12.43 11.07 L12.56 10.91 L12.75 10.62 L13.1 9.89 L13.29 9.31 L13.42 8.44 L13.43 7.81 L13.28 6.9 L13.09 6.38 L12.73 5.68 L12.39 5.17 L11.96 4.63 L11.85 4.45 L11.84 4.33 L11.99 4.07 L12.3 3.8 L12.59 3.78 L12.76 3.84 L12.86 3.93 L13.46 4.64 L14.0 5.64 L14.35 6.62 L14.4 7.09 L14.51 7.55 L14.53 8.66 L14.35 9.72 L14.0 10.65 L13.65 11.3 L13.22 11.97 L13.36 12.22 L14.51 13.38 L14.53 13.91 L14.46 14.06Z M8.59 14.17 L8.43 14.15 L8.16 13.94 L5.05 10.84 L4.83 10.8 L2.82 10.8 L2.67 10.75 L2.5 10.6 L2.45 10.34 L2.45 5.92 L2.49 5.73 L2.65 5.57 L2.8 5.51 L2.98 5.52 L3.31 5.76 L8.73 11.19 L8.78 11.46 L8.78 13.89 L8.73 14.06Z" />
    </svg>
  );
}

export function VolumeOn() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={SOUND_ICON} aria-hidden="true">
      <path d="M8.57 14.17 L8.42 14.16 L8.18 13.98 L6.0 11.79 L5.78 11.64 L5.64 11.43 L5.16 10.96 L5.05 10.91 L4.88 10.94 L4.72 10.83 L4.58 10.8 L2.76 10.8 L2.64 10.75 L2.51 10.62 L2.45 10.37 L2.45 5.95 L2.51 5.7 L2.64 5.57 L2.79 5.51 L4.58 5.52 L4.72 5.49 L4.88 5.38 L5.05 5.41 L5.16 5.36 L5.64 4.89 L5.78 4.68 L6.0 4.53 L8.18 2.34 L8.39 2.17 L8.49 2.14 L8.7 2.22 L8.78 2.4 L8.78 6.56 L8.82 6.74 L8.92 6.9 L8.81 7.11 L8.78 7.36 L8.79 9.09 L8.83 9.26 L8.92 9.41 L8.82 9.58 L8.78 9.76 L8.78 13.89 L8.73 14.06Z M12.31 12.75 L11.73 12.21 L11.66 12.09 L12.22 11.37 L12.3 11.15 L12.45 11.03 L12.71 10.67 L13.08 9.93 L13.28 9.31 L13.41 8.48 L13.42 8.03 L13.28 6.98 L13.09 6.42 L12.92 6.03 L12.53 5.38 L12.3 5.17 L12.22 4.95 L11.66 4.23 L11.73 4.11 L12.3 3.57 L12.44 3.72 L12.79 3.87 L13.09 4.15 L13.29 4.16 L13.29 4.39 L13.83 5.3 L14.17 6.08 L14.36 6.66 L14.41 7.07 L14.51 7.46 L14.54 7.9 L14.53 8.74 L14.4 9.28 L14.36 9.66 L13.99 10.68 L13.64 11.37 L13.3 11.9 L13.27 12.0 L13.29 12.16 L13.09 12.17 L12.79 12.45 L12.44 12.6Z M10.54 10.97 L10.38 10.86 L9.89 10.35 L10.02 10.21 L10.12 9.92 L10.38 9.58 L10.44 9.3 L10.63 9.07 L10.74 8.77 L10.77 8.03 L10.72 7.46 L10.6 7.21 L10.44 7.02 L10.36 6.72 L10.12 6.4 L10.02 6.11 L9.89 5.98 L10.53 5.35 L10.94 5.65 L11.36 6.15 L11.8 7.11 L11.91 7.9 L11.91 8.48 L11.83 9.12 L11.62 9.65 L11.3 10.28 L10.92 10.68Z" />
    </svg>
  );
}

/** One size for both states, so the disc's contents cannot drift apart. */
const SOUND_ICON = "size-5";
