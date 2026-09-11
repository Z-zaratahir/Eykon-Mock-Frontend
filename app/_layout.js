import { useCallback, useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { colors } from "../constants/theme";
import { FONT_ASSETS } from "../constants/fonts";
import Splash from "../components/Splash";

// Keep the native (static, blank) splash up while fonts load, then hand off
// to our own animated "First focus" splash (components/Splash.js) — the
// native splash-screen API only supports a static image, not the spring/
// saccade motion the UX plan asks for, so this is a deliberate two-stage
// handoff rather than one screen doing both jobs.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(FONT_ASSETS);
  const [customSplashDone, setCustomSplashDone] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  const finishSplash = useCallback(() => setCustomSplashDone(true), []);

  if (!fontsLoaded && !fontError) {
    return null; // native splash still visible
  }

  if (!customSplashDone) {
    return <Splash onDone={finishSplash} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />
      <Stack
        initialRouteName="onboarding"
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
      >
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="memory/[id]" options={{ presentation: "card" }} />
        <Stack.Screen name="capture" options={{ presentation: "fullScreenModal", animation: "fade" }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
