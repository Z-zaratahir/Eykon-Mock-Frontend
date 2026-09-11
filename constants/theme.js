// Eykon design tokens
// White / near-black / teal — calm, minimal, and built to the numbers in
// Eykon_Frontend_UX_Revamp_Plan.md (Section 2-3): 60% white, 30% near-black,
// 10% teal. Teal is reserved for actions and active states, not decoration.
// Every screen imports from this one file, so retheming here cascades everywhere.

import { fonts } from "./fonts";

export const colors = {
  // Base
  background: "#FFFFFF",
  backgroundAlt: "#FAFAF8", // elevated cards/sections — stands in for a shadow on white
  hairline: "#EAEAE6", // card/list borders instead of a heavy shadow

  // Text — never pure #000 (glare on a white background, UX plan 3.1)
  textPrimary: "#141414",
  textSecondary: "#5C5C5C",
  textFaint: "#8C8C8C", // icons/timestamps only, never body copy

  // Brand
  teal: "#008080",
  tealDark: "#006666", // pressed states, small text/links, text on tealTint
  tealTint: "#E6F2F1", // selected chip/bubble backgrounds
  tealTintFaint: "#F3FAF9", // very subtle section backgrounds

  // Signal — used sparingly, see the 60/30/10 rule above
  live: "#E5484D", // recording indicator
  liveTint: "#FBE9EA",
  success: "#1E8E5A",
  successTint: "#E7F4ED",
  warning: "#B98900",
  warningTint: "#FBF1DC",

  // Utility
  white: "#FFFFFF",
  overlay: "rgba(20,20,20,0.55)", // scrims over camera/photo content only

  // Retrieval / confidence badges (kept as teal-family tones so the match
  // taxonomy reads as "shades of trust" rather than a fourth accent color)
  matchExact: "#1E8E5A",
  matchSemantic: "#008080",
  matchKeyword: "#5C5C5C",
};

export const gradients = {
  heroTeal: ["rgba(0,128,128,0.14)", "rgba(0,128,128,0)"],
  scrimTop: ["rgba(20,20,20,0.55)", "rgba(20,20,20,0)"],
  scrimBottom: ["rgba(20,20,20,0)", "rgba(20,20,20,0.75)"],
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
};

// Type scale — Display/Title/Headline in Sora (display voice), Body/Caption in
// Inter (UI workhorse). Body floors at 16px, Caption at 13px — the absolute
// minimum per the accessibility baseline in the UX plan; never go smaller.
export const type = {
  display: { fontFamily: fonts.displayBold, fontSize: 32, fontWeight: "700", letterSpacing: -0.4 },
  title: { fontFamily: fonts.displayBold, fontSize: 24, fontWeight: "700", letterSpacing: -0.2 },
  headline: { fontFamily: fonts.displaySemibold, fontSize: 18, fontWeight: "600" },
  body: { fontFamily: fonts.bodyRegular, fontSize: 16, fontWeight: "400", lineHeight: 22 },
  bodyMedium: { fontFamily: fonts.bodyMedium, fontSize: 16, fontWeight: "500", lineHeight: 22 },
  caption: { fontFamily: fonts.bodyMedium, fontSize: 13, fontWeight: "500", lineHeight: 17 },
  label: { fontFamily: fonts.bodySemibold, fontSize: 13, fontWeight: "700", letterSpacing: 0.6 },
  mono: { fontSize: 13, fontFamily: "monospace" },
};

// Light-mode elevation: a 1px hairline border + a soft, low-opacity shadow.
// The old dark-tuned shadow.card (black, 0.25 opacity) reads as a dirty
// smudge on white — this is the standard light-mode replacement.
export const shadow = {
  card: {
    shadowColor: "#141414",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  glow: {
    shadowColor: "#008080",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 6,
  },
};

export { fonts };
