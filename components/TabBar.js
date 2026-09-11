import { View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, radius, shadow } from "../constants/theme";

const ICONS = {
  index: { active: "chatbubble-ellipses", inactive: "chatbubble-ellipses-outline" },
  echoes: { active: "albums", inactive: "albums-outline" },
  glasses: { active: "glasses", inactive: "glasses-outline" },
  profile: { active: "person-circle", inactive: "person-circle-outline" },
};

// This TabBar floats via position:absolute (see styles.wrap below) so it
// overlays screen content instead of pushing it up — React Navigation gives
// a fully-custom tabBar zero automatic layout reservation. Any fixed
// (non-scrolling) element pinned to a tab screen's bottom edge — like Chat's
// input bar — MUST add this much clearance on top of the safe-area inset, or
// it renders directly behind the floating bar. Scrollable screens (Echoes,
// Glasses, Profile) already clear it with generous contentContainer padding.
export const TAB_BAR_CLEARANCE = 100;

// Only 4 real tab routes are registered (see app/(tabs)/_layout.js) — Capture
// is not a tab screen at all anymore. The center button below is the single,
// unified entry point into the real camera at app/capture.js: one capture
// flow, reachable the same way whether you tap or long-press (Consistency &
// standards heuristic, UX plan Section 2). This is the fix for the routing
// bug where the FAB used to resolve to a fake tab stub instead of the camera.
export default function TabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  const openCapture = (mode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(mode ? { pathname: "/capture", params: { mode } } : "/capture");
  };

  const renderTab = (route) => {
    const routeIndex = state.routes.findIndex((r) => r.key === route.key);
    const isFocused = state.index === routeIndex;
    const meta = ICONS[route.name] || ICONS.index;

    const onPress = () => {
      Haptics.selectionAsync();
      const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
      if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
    };

    return (
      <Pressable key={route.key} onPress={onPress} style={styles.tabItem} hitSlop={8} accessibilityRole="tab" accessibilityState={{ selected: isFocused }}>
        <Ionicons name={isFocused ? meta.active : meta.inactive} size={23} color={isFocused ? colors.teal : colors.textFaint} />
        {isFocused && <View style={styles.dot} />}
      </Pressable>
    );
  };

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 14) }]} pointerEvents="box-none">
      <BlurView intensity={60} tint="light" style={styles.bar}>
        <View style={styles.barInner}>
          {state.routes.slice(0, 2).map(renderTab)}

          <Pressable
            onPress={() => openCapture()}
            onLongPress={() => openCapture("voice")}
            style={styles.captureButtonWrap}
            hitSlop={10}
            accessibilityLabel="Open camera"
            accessibilityHint="Long-press to jump straight to a voice note"
          >
            <View style={[styles.captureButton, shadow.glow]}>
              <Ionicons name="aperture" size={26} color={colors.white} />
            </View>
          </Pressable>

          {state.routes.slice(2).map(renderTab)}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  bar: {
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.hairline,
    width: "100%",
  },
  barInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.82)",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    width: 52,
    height: 44,
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.teal,
  },
  captureButtonWrap: {
    marginTop: -30,
  },
  captureButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.background,
    backgroundColor: colors.teal,
  },
});
