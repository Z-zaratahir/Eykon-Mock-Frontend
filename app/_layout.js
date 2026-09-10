import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { colors } from "../constants/theme";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="light" />
      <Stack
        initialRouteName="onboarding"
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}
      >
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="memory/[id]" options={{ presentation: "card" }} />
        <Stack.Screen name="capture" options={{ presentation: "fullScreenModal", animation: "fade" }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
