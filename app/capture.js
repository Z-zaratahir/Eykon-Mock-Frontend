import { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Animated, AccessibilityInfo } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { colors, radius, spacing, type } from "../constants/theme";
import { glassesDevice } from "../data/mockData";

// This is the ONE real capture screen (expo-camera) — the tab bar's center FAB
// and the Capture tab both route here now. See components/TabBar.js.
const MODE_ORDER = ["photo", "video", "voice"];
const UNDO_WINDOW_MS = 2200;

export default function CaptureModal() {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState("back");
  const [mode, setMode] = useState(MODE_ORDER.includes(params.mode) ? params.mode : "photo");
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [saved, setSaved] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const timerRef = useRef(null);
  const dismissRef = useRef(null);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
      if (!reduceMotion) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulse, { toValue: 1.4, duration: 500, useNativeDriver: true }),
            Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true }),
          ])
        ).start();
      }
    } else {
      clearInterval(timerRef.current);
      pulse.stopAnimation();
      pulse.setValue(1);
      setElapsed(0);
    }
    return () => clearInterval(timerRef.current);
  }, [recording, reduceMotion]);

  useEffect(() => () => clearTimeout(dismissRef.current), []);

  const formatElapsed = () => {
    const m = Math.floor(elapsed / 60).toString().padStart(2, "0");
    const s = (elapsed % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handlePrimaryPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (mode === "photo") {
      showSaved();
      return;
    }
    // video or voice — toggle recording
    if (recording) {
      setRecording(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showSaved();
    } else {
      setRecording(true);
    }
  };

  const showSaved = () => {
    setSaved(true);
    dismissRef.current = setTimeout(() => {
      setSaved(false);
      router.back();
    }, UNDO_WINDOW_MS);
  };

  const undoSave = () => {
    clearTimeout(dismissRef.current);
    setSaved(false);
    Haptics.selectionAsync();
  };

  const askAboutThis = () => {
    clearTimeout(dismissRef.current);
    setSaved(false);
    router.replace("/(tabs)");
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted && mode !== "voice") {
    return (
      <View style={[styles.container, styles.permissionWrap, { paddingTop: insets.top }]}>
        <Ionicons name="camera-outline" size={40} color={colors.textSecondary} />
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionText}>
          Eykon needs your camera to capture a moment the way your glasses would.
        </Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant access</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.textFaint }}>Cancel</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {mode === "voice" ? (
        <VoiceCapture recording={recording} elapsed={formatElapsed()} pulse={pulse} reduceMotion={reduceMotion} />
      ) : (
        <CameraView style={StyleSheet.absoluteFill} facing={facing} mode={mode === "video" ? "video" : "picture"} />
      )}

      <LinearGradient colors={["rgba(20,20,20,0.55)", "transparent"]} style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={styles.closeButton} accessibilityLabel="Close camera">
          <Ionicons name="close" size={24} color={colors.white} />
        </Pressable>

        {recording ? (
          <View style={styles.recIndicator}>
            <Animated.View style={[styles.recDot, !reduceMotion && { transform: [{ scale: pulse }] }]} />
            <Text style={styles.recTimer}>{formatElapsed()}</Text>
          </View>
        ) : (
          <View style={styles.sourceBadge}>
            <Ionicons name={glassesDevice.connected ? "glasses-outline" : "phone-portrait-outline"} size={13} color={colors.white} />
            <Text style={styles.sourceBadgeText}>
              {glassesDevice.connected ? "Recording via phone — glasses stay connected" : "Recording via phone"}
            </Text>
          </View>
        )}

        {mode !== "voice" ? (
          <Pressable onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))} style={styles.closeButton} accessibilityLabel="Flip camera">
            <Ionicons name="camera-reverse-outline" size={22} color={colors.white} />
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </LinearGradient>

      <LinearGradient colors={["transparent", "rgba(20,20,20,0.78)"]} style={[styles.bottomBar, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.modeSwitchRow}>
          {MODE_ORDER.map((m) => (
            <Pressable key={m} onPress={() => !recording && setMode(m)} style={styles.modeSwitchItem} hitSlop={8}>
              <Text style={[styles.modeSwitchText, mode === m && styles.modeSwitchTextActive]}>
                {m === "photo" ? "SNAPSHOT" : m === "video" ? "VIDEO" : "VOICE"}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.shutterRow}>
          <View style={{ width: 50 }} />
          <Pressable onPress={handlePrimaryPress} style={styles.shutterOuter} accessibilityLabel="Capture">
            <View
              style={[
                styles.shutterInner,
                mode === "photo" && styles.shutterPhoto,
                mode !== "photo" && !recording && styles.shutterRecordReady,
                recording && styles.shutterRecording,
              ]}
            />
          </Pressable>
          <View style={{ width: 50, alignItems: "center" }}>
            {mode !== "voice" && <Ionicons name="images-outline" size={26} color="rgba(255,255,255,0.7)" />}
          </View>
        </View>
        <Text style={styles.hintText}>
          {mode === "photo" && "Tap to capture what your glasses would have seen"}
          {mode === "video" && (recording ? "Recording — tap to stop" : "Tap to start a short clip")}
          {mode === "voice" && (recording ? "Listening — tap to finish" : "Tap to record a voice memory")}
        </Text>
      </LinearGradient>

      {saved && (
        <View style={styles.toast}>
          <View style={styles.toastRow}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={styles.toastText}>Saved as a memory</Text>
          </View>
          <View style={styles.toastActions}>
            <Pressable onPress={undoSave} hitSlop={8}>
              <Text style={styles.toastAction}>Undo</Text>
            </Pressable>
            <View style={styles.toastDivider} />
            <Pressable onPress={askAboutThis} hitSlop={8}>
              <Text style={[styles.toastAction, { color: colors.tealDark }]}>Ask about this now</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

function VoiceCapture({ recording, elapsed, pulse, reduceMotion }) {
  return (
    <LinearGradient colors={[colors.tealTintFaint, colors.background]} style={styles.voiceWrap}>
      <Animated.View
        style={[
          styles.voiceOrb,
          recording && { backgroundColor: colors.live, ...(reduceMotion ? {} : { transform: [{ scale: pulse }] }) },
        ]}
      >
        <Ionicons name="mic" size={44} color={colors.white} />
      </Animated.View>
      <Text style={styles.voiceStatus}>{recording ? "Listening…" : "Ready when you are"}</Text>
      {recording && <Text style={styles.voiceTimer}>{elapsed}</Text>}
      <View style={styles.waveformRow}>
        {Array.from({ length: 24 }).map((_, i) => (
          <WaveBar key={i} active={recording && !reduceMotion} index={i} />
        ))}
      </View>
    </LinearGradient>
  );
}

function WaveBar({ active, index }) {
  const val = useRef(new Animated.Value(6)).current;
  useEffect(() => {
    if (active) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: 8 + Math.random() * 26, duration: 260 + (index % 5) * 40, useNativeDriver: false }),
          Animated.timing(val, { toValue: 6, duration: 260 + (index % 5) * 40, useNativeDriver: false }),
        ])
      ).start();
    } else {
      val.setValue(6);
    }
  }, [active]);
  return <Animated.View style={[styles.waveBar, { height: val }]} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.textPrimary },
  permissionWrap: { alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl, gap: 8, backgroundColor: colors.background },
  permissionTitle: { color: colors.textPrimary, ...type.headline, marginTop: 8 },
  permissionText: { color: colors.textSecondary, ...type.body, textAlign: "center" },
  permissionButton: { backgroundColor: colors.teal, borderRadius: radius.pill, paddingVertical: 14, paddingHorizontal: 28, marginTop: 16, minHeight: 44, justifyContent: "center" },
  permissionButtonText: { color: colors.white, fontWeight: "700" },
  topBar: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  closeButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(20,20,20,0.4)", alignItems: "center", justifyContent: "center" },
  sourceBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(20,20,20,0.45)", borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 12, maxWidth: 220 },
  sourceBadgeText: { color: colors.white, fontSize: 11.5, fontWeight: "600", flexShrink: 1 },
  recIndicator: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(20,20,20,0.45)", borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 12 },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.live },
  recTimer: { color: colors.white, fontSize: 13, fontWeight: "600", fontFamily: "monospace" },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, paddingTop: spacing.xl, alignItems: "center" },
  modeSwitchRow: { flexDirection: "row", gap: 20, marginBottom: spacing.lg },
  modeSwitchItem: { paddingVertical: 4 },
  modeSwitchText: { color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  modeSwitchTextActive: { color: colors.white },
  shutterRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 30, width: "100%", paddingHorizontal: spacing.xl },
  shutterOuter: { width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.white },
  shutterPhoto: {},
  shutterRecordReady: { backgroundColor: colors.live },
  shutterRecording: { backgroundColor: colors.live, width: 28, height: 28, borderRadius: 6 },
  hintText: { color: "rgba(255,255,255,0.7)", fontSize: 12.5, marginTop: spacing.md },
  toast: {
    position: "absolute",
    top: "42%",
    alignSelf: "center",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.background,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radius.lg,
    minWidth: 240,
  },
  toastRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  toastText: { color: colors.textPrimary, ...type.bodyMedium },
  toastActions: { flexDirection: "row", alignItems: "center", gap: 14 },
  toastAction: { color: colors.textSecondary, fontSize: 13, fontWeight: "700" },
  toastDivider: { width: 1, height: 14, backgroundColor: colors.hairline },
  voiceWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  voiceOrb: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.teal, alignItems: "center", justifyContent: "center" },
  voiceStatus: { color: colors.textPrimary, ...type.headline },
  voiceTimer: { color: colors.textSecondary, fontFamily: "monospace", fontSize: 14 },
  waveformRow: { flexDirection: "row", alignItems: "center", gap: 4, height: 40, marginTop: 10 },
  waveBar: { width: 3, borderRadius: 2, backgroundColor: colors.teal },
});
