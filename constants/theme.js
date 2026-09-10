// Eykon design tokens
// Palette pulled from the FYP defense deck (glasses icon #3A506B, alert amber #FF9F1C)
// and extended into a full dark UI system built around "moments" — amber marks
// anything the system has captured or recalled; the rest of the palette stays quiet.

export const colors = {
  // Base
  bg: "#0B132B",        // deepest background — night-glass navy
  bgElevated: "#121A38", // cards resting directly on bg
  surface: "#1C2541",    // primary card / control surface
  surfaceAlt: "#232D4E",  // secondary surface (input fields, chips)
  border: "#2E3A63",

  // Text
  text: "#F4F1EA",
  textMuted: "#9AA5C4",
  textFaint: "#5E699294".slice(0, 7), // fallback safety, see textFaintSolid
  textFaintSolid: "#6C7799",

  // Brand / signal
  accent: "#FF9F1C",      // amber — a captured / recalled moment
  accentSoft: "#3A2A16",  // amber tint background for chips/badges
  accentDeep: "#C97A0E",

  slate: "#3A506B",       // the glasses / hardware color from the deck
  slateSoft: "#26344A",

  // Semantic
  success: "#4ECB86",
  successSoft: "#173626",
  warning: "#FF9F1C",
  danger: "#FF5C5C",
  dangerSoft: "#3A1E22",
  live: "#FF5C5C",        // recording indicator

  // Retrieval / confidence badges (styled after real Eykon backend terms)
  matchSemantic: "#7DA5FF",
  matchBM25: "#C77DFF",
  matchExact: "#4ECB86",

  overlay: "rgba(9,13,30,0.72)",
  white: "#FFFFFF",
  black: "#000000",
};

export const gradients = {
  hero: ["#0B132B", "#16213F", "#0B132B"],
  glass: ["rgba(58,80,107,0.55)", "rgba(28,37,65,0.25)"],
  amberGlow: ["rgba(255,159,28,0.35)", "rgba(255,159,28,0)"],
  card: ["#1C2541", "#161E3A"],
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

export const type = {
  display: { fontSize: 30, fontWeight: "700", letterSpacing: -0.4 },
  title: { fontSize: 22, fontWeight: "700", letterSpacing: -0.2 },
  headline: { fontSize: 18, fontWeight: "600" },
  body: { fontSize: 15, fontWeight: "400", lineHeight: 21 },
  bodyMedium: { fontSize: 15, fontWeight: "500", lineHeight: 21 },
  caption: { fontSize: 13, fontWeight: "500", lineHeight: 17 },
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 0.6 },
  mono: { fontSize: 13, fontFamily: "monospace" },
};

export const shadow = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  glow: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
};
