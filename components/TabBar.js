import { View, Pressable, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, shadow } from "../constants/theme";

const ICONS = {
  index: { active: "chatbubble-ellipses", inactive: "chatbubble-ellipses-outline" },
  echoes: { active: "albums", inactive: "albums-outline" },
  glasses: { active: "glasses", inactive: "glasses-outline" },
  profile: { active: "person-circle", inactive: "person-circle-outline" },
};

export default function TabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 14) }]} pointerEvents="box-none">
      <BlurView intensity={50} tint="dark" style={styles.bar}>
        <View style={styles.barInner}>
          {state.routes
            .filter((r) => r.name !== "capture-tab")
            .map((route, index) => {
              const routeIndex = state.routes.findIndex((r) => r.key === route.key);
              const isFocused = state.index === routeIndex;
              const meta = ICONS[route.name] || ICONS.index;
              const label = descriptors[route.key]?.options?.title ?? route.name;

              const onPress = () => {
                Haptics.selectionAsync();
                const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
              };

              if (route.name === "capture") {
                return (
                  <Pressable key={route.key} onPress={onPress} style={styles.captureButtonWrap} hitSlop={10}>
                    <LinearGradient
                      colors={[colors.accent, colors.accentDeep]}
                      style={[styles.captureButton, shadow.glow]}
                    >
                      <Ionicons name="aperture" size={26} color={colors.bg} />
                    </LinearGradient>
                  </Pressable>
                );
              }

              return (
                <Pressable key={route.key} onPress={onPress} style={styles.tabItem} hitSlop={8}>
                  <Ionicons
                    name={isFocused ? meta.active : meta.inactive}
                    size={23}
                    color={isFocused ? colors.accent : colors.textFaintSolid}
                  />
                  {isFocused && <View style={styles.dot} />}
                </Pressable>
              );
            })}
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
    borderColor: "rgba(255,255,255,0.08)",
    width: "100%",
  },
  barInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "rgba(18,26,56,0.55)",
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
    backgroundColor: colors.accent,
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
    borderColor: colors.bg,
  },
});
