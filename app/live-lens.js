import { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Animated, Switch, AccessibilityInfo } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { colors, radius, spacing, type } from "../constants/theme";

// Live Lens is the concrete answer to "the phone is its own eye too" (UX
// plan, Section 4) — distinct from Capture: nothing is saved by default,
// this is a real-time "point and ask right now" flow (your proposal's
// secondary mode: "what is this plant," "translate this sign").
const SAMPLE_ANSWERS = [
  { q: "What is this?", a: "That looks like a ceramic mug on a wooden desk — nothing else notable in frame." },
  { q: "What is this plant?", a: "This looks like a peace lily — likes indirect light and a weekly watering." },
  { q: "Translate this sign", a: "The sign reads \"Exit\" — خروج in Urdu." },
  { q: "What does this say?", a: "It's a warning label: \"Caution — hot surface. Do not touch.\"" },
];

export default function LiveLens() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState("idle"); // idle | listening | thinking | answered
  const [answerIndex, setAnswerIndex] = useState(0);
  const [keepAnswer, setKeepAnswer] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;
  const sheetY = useRef(new Animated.Value(220)).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (state === "listening" && !reduceMotion) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.3, duration: 480, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 480, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulse.stopAnimation();
      pulse.setValue(1);
    }
  }, [state, reduceMotion]);

  useEffect(() => {
    Animated.timing(sheetY, {
      toValue: state === "answered" ? 0 : 220,
      duration: reduceMotion ? 0 : 260,
      useNativeDriver: true,
    }).start();
  }, [state, reduceMotion]);

  const ask = () => {
    if (state !== "idle" && state !== "answered") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaved(false);
    setState("listening");
    setTimeout(() => {
      setState("thinking");
      setTimeout(() => {
        setAnswerIndex((i) => (i + 1) % SAMPLE_ANSWERS.length);
        setState("answered");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (keepAnswer) {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
      }, 900);
    }, 1100);
  };

  const dismiss = () => setState("idle");

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.permissionWrap, { paddingTop: insets.top }]}>
        <Ionicons name="eye-outline" size={40} color={colors.textSecondary} />
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionText}>Live Lens needs your camera to answer questions about what's in front of you, right now.</Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant access</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.textFaint }}>Cancel</Text>
        </Pressable>
      </View>
    );
  }

  const answer = SAMPLE_ANSWERS[answerIndex];

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFill} facing="back" />

      <LinearGradient colors={["rgba(20,20,20,0.55)", "transparent"]} style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={styles.iconButton} accessibilityLabel="Close Live Lens">
          <Ionicons name="close" size={24} color={colors.white} />
        </Pressable>
        <View style={styles.titlePill}>
          <Ionicons name="eye" size={13} color={colors.white} />
          <Text style={styles.titlePillText}>Live Lens</Text>
        </View>
        <View style={styles.keepToggleWrap}>
          <Text style={styles.keepToggleLabel}>Keep</Text>
          <Switch
            value={keepAnswer}
            onValueChange={setKeepAnswer}
            trackColor={{ false: "rgba(255,255,255,0.3)", true: colors.tealDark }}
            thumbColor={colors.white}
          />
        </View>
      </LinearGradient>

      {state === "idle" && (
        <View style={styles.hintWrap} pointerEvents="none">
          <Text style={styles.hintText}>Point at something, then tap to ask</Text>
        </View>
      )}

      <View style={[styles.askRow, { paddingBottom: insets.bottom + 28 }]}>
        <Pressable onPress={ask} style={styles.askButtonWrap} accessibilityLabel="Ask about what you see">
          <Animated.View style={[styles.askButton, state === "listening" && { backgroundColor: colors.live, transform: [{ scale: pulse }] }]}>
            {state === "thinking" ? (
              <Ionicons name="ellipsis-horizontal" size={22} color={colors.white} />
            ) : (
              <Ionicons name={state === "listening" ? "mic" : "mic-outline"} size={24} color={colors.white} />
            )}
          </Animated.View>
        </Pressable>
        <Text style={styles.askCaption}>
          {state === "listening" && "Listening…"}
          {state === "thinking" && "Looking…"}
          {(state === "idle" || state === "answered") && "Tap to ask"}
        </Text>
      </View>

      <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + 20, transform: [{ translateY: sheetY }] }]}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetQRow}>
          <Ionicons name="help-circle-outline" size={14} color={colors.textFaint} />
          <Text style={styles.sheetQ}>{answer.q}</Text>
        </View>
        <Text style={styles.sheetAnswer}>{answer.a}</Text>
        <View style={styles.sheetActions}>
          <Pressable onPress={dismiss} style={styles.sheetActionGhost}>
            <Text style={styles.sheetActionGhostText}>Dismiss</Text>
          </Pressable>
          <Pressable onPress={ask} style={styles.sheetActionPrimary}>
            <Ionicons name="mic-outline" size={15} color={colors.white} />
            <Text style={styles.sheetActionPrimaryText}>Ask again</Text>
          </Pressable>
        </View>
        {saved ? (
          <View style={styles.savedRow}>
            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
            <Text style={styles.savedText}>Saved as a memory</Text>
          </View>
        ) : (
          <Text style={styles.notSavedText}>Not saved — turn on "Keep" to remember this answer.</Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.textPrimary },
  permissionWrap: { alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl, gap: 8, backgroundColor: colors.background },
  permissionTitle: { color: colors.textPrimary, ...type.headline, marginTop: 8 },
  permissionText: { color: colors.textSecondary, ...type.body, textAlign: "center" },
  permissionButton: { backgroundColor: colors.teal, borderRadius: radius.pill, paddingVertical: 14, paddingHorizontal: 28, marginTop: 16, minHeight: 44, justifyContent: "center" },
  permissionButtonText: { color: colors.white, fontWeight: "700" },
  topBar: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, zIndex: 2 },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(20,20,20,0.4)", alignItems: "center", justifyContent: "center" },
  titlePill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(20,20,20,0.4)", borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 14 },
  titlePillText: { color: colors.white, fontSize: 13, fontWeight: "700" },
  keepToggleWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  keepToggleLabel: { color: colors.white, fontSize: 13, fontWeight: "600" },
  hintWrap: { position: "absolute", top: "42%", alignSelf: "center" },
  hintText: { color: "rgba(255,255,255,0.85)", fontSize: 13.5, fontWeight: "600", backgroundColor: "rgba(20,20,20,0.35)", paddingVertical: 8, paddingHorizontal: 16, borderRadius: radius.pill },
  askRow: { position: "absolute", bottom: 200, alignSelf: "center", alignItems: "center", gap: 8 },
  askButtonWrap: {},
  askButton: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.teal, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "rgba(255,255,255,0.85)" },
  askCaption: { color: colors.white, fontSize: 13, fontWeight: "600" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.hairline, alignSelf: "center", marginBottom: spacing.sm },
  sheetQRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  sheetQ: { color: colors.textFaint, fontSize: 13, fontStyle: "italic" },
  sheetAnswer: { color: colors.textPrimary, ...type.headline, marginBottom: spacing.md },
  sheetActions: { flexDirection: "row", gap: 10, marginBottom: spacing.sm },
  sheetActionGhost: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 44, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.hairline },
  sheetActionGhostText: { color: colors.textSecondary, fontWeight: "700", fontSize: 13.5 },
  sheetActionPrimary: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 44, borderRadius: radius.pill, backgroundColor: colors.teal },
  sheetActionPrimaryText: { color: colors.white, fontWeight: "700", fontSize: 13.5 },
  savedRow: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center", paddingBottom: 4 },
  savedText: { color: colors.success, fontSize: 13, fontWeight: "600" },
  notSavedText: { color: colors.textFaint, fontSize: 13, textAlign: "center", paddingBottom: 4 },
});
