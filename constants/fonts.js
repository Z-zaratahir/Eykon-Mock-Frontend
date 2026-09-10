// Two-typeface system (UX plan, Section 3.3):
// - Display/voice typeface (Sora): wordmark, splash, screen hero titles, the
//   first-message-of-a-session animated greeting in Chat. Used sparingly.
// - UI/body typeface (Inter): everything else — bubbles, cards, buttons, labels.
//
// Import FONT_ASSETS into a single useFonts() call in app/_layout.js and gate
// content behind it (paired with the custom splash in components/Splash.js).
// Until fonts finish loading, these family names simply fall back to the
// platform default — nothing crashes if a screen renders one tick early.

import {
  Sora_600SemiBold,
  Sora_700Bold,
} from "@expo-google-fonts/sora";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export const FONT_ASSETS = {
  Sora_600SemiBold,
  Sora_700Bold,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
};

export const fonts = {
  displaySemibold: "Sora_600SemiBold",
  displayBold: "Sora_700Bold",
  bodyRegular: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemibold: "Inter_600SemiBold",
  bodyBold: "Inter_700Bold",
};
