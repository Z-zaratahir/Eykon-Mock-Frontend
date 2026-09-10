import { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { colors, radius, spacing } from "../constants/theme";

const MODE_ORDER = ["photo", "video", "voice"];

export default function CaptureModal() {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState("back");
  const [mode, setMode] = useState(MODE_ORDER.includes(params.mode) ? params.mode : "photo");
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [savedToast, setSavedToast] = useState(false);
  const timerRef = useRef(null);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.4, duration: 500, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      clearInterval(timerRef.current);
      pulse.stopAnimation();
      pulse.setValue(1);
      setElapsed(0);
    }
    return () => clearInterval(timerRef.current);
  }, [recording]);

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
      showSaved();
    } else {
      setRecording(true);
    }
  };

  const showSaved = () => {
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      router.back();
    }, 900);
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted && mode !== "voice") {
    return (
      <View style={[styles.container, styles.permissionWrap, { paddingTop: insets.top }]}>
        <Ionicons name="camera-outline" size={40} color={colors.textMuted} />
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionText}>
          Eykon needs your camera to demo capturing a moment the way your glasses would.
        </Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant access</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.textFaintSolid }}>Cancel</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {mode === "voice" ? (
        <VoiceCapture recording={recording} elapsed={formatElapsed()} pulse={pulse} />
      ) : (
        <CameraView style={StyleSheet.absoluteFill} facing={facing} mode={mode === "video" ? "video" : "picture"} />
      )}

      <LinearGradient colors={["rgba(0,0,0,0.55)", "transparent"]} style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.white} />
        </Pressable>
        {recording && (
          <View style={styles.recIndicator}>
            <Animated.View style={[styles.recDot, { transform: [{ scale: pulse }] }]} />
            <Text style={styles.recTimer}>{formatElapsed()}</Text>
          </View>
        )}
        {mode !== "voice" && (
          <Pressable onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))} style={styles.closeButton}>
            <Ionicons name="camera-reverse-outline" size={22} color={colors.white} />
          </Pressable>
        )}
        {mode === "voice" && <View style={{ width: 40 }} />}
      </LinearGradient>

      <LinearGradient colors={["transparent", "rgba(0,0,0,0.75)"]} style={[styles.bottomBar, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.modeSwitchRow}>
          {MODE_ORDER.map((m) => (
            <Pressable key={m} onPress={() => !recording && setMode(m)} style={styles.modeSwitchItem}>
              <Text style={[styles.modeSwitchText, mode === m && styles.modeSwitchTextActive]}>
                {m === "photo" ? "SNAPSHOT" : m === "video" ? "VIDEO" : "VOICE"}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.shutterRow}>
          <View style={{ width: 50 }} />
          <Pressable onPress={handlePrimaryPress} style={styles.shutterOuter}>
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
            {mode !== "voice" && (
              <Ionicons name="images-outline" size={26} color="rgba(255,255,255,0.7)" />
            )}
          </View>
        </View>
        <Text style={styles.hintText}>
          {mode === "photo" && "Tap to capture what your glasses would have seen"}
          {mode === "video" && (recording ? "Recording — tap to stop" : "Tap to start a short clip")}
          {mode === "voice" && (recording ? "Listening — tap to finish" : "Tap to record a voice memory")}
        </Text>
      </LinearGradient>

      {savedToast && (
        <View style={styles.toast}>
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          <Text style={styles.toastText}>Saved to Echoes — extracting memory…</Text>
        </View>
      )}
    </View>
  );
}

function VoiceCapture({ recording, elapsed, pulse }) {
  return (
    <LinearGradient colors={["#1C2541", "#0B132B"]} style={styles.voiceWrap}>
      <Animated.View style={[styles.voiceOrb, recording && { transform: [{ scale: pulse }], backgroundColor: colors.danger }]}>
        <Ionicons name="mic" size={44} color={colors.bg} />
      </Animated.View>
      <Text style={styles.voiceStatus}>{recording ? "Listening…" : "Ready when you are"}</Text>
      {recording && <Text style={styles.voiceTimer}>{elapsed}</Text>}
      <View style={styles.waveformRow}>
        {Array.from({ length: 24 }).map((_, i) => (
          <WaveBar key={i} active={recording} index={i} />
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
  container: { flex: 1, backgroundColor: colors.bg },
  permissionWrap: { alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl, gap: 8 },
  permissionTitle: { color: colors.text, fontSize: 18, fontWeight: "700", marginTop: 8 },
  permissionText: { color: colors.textMuted, fontSize: 13.5, textAlign: "center", lineHeight: 19 },
  permissionButton: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingVertical: 12, paddingHorizontal: 28, marginTop: 16 },
  permissionButtonText: { color: colors.bg, fontWeight: "700" },
  topBar: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
  recIndicator: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.4)", borderRadius: radius.pill, paddingVertical: 6, paddingHorizontal: 12 },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
  recTimer: { color: colors.white, fontSize: 13, fontWeight: "600", fontFamily: "monospace" },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, paddingTop: spacing.xl, alignItems: "center" },
  modeSwitchRow: { flexDirection: "row", gap: 20, marginBottom: spacing.lg },
  modeSwitchItem: { paddingVertical: 4 },
  modeSwitchText: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  modeSwitchTextActive: { color: colors.accent },
  shutterRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 30, width: "100%", paddingHorizontal: spacing.xl },
  shutterOuter: { width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: "rgba(255,255,255,0.85)", alignItems: "center", justifyContent: "center" },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.white },
  shutterPhoto: {},
  shutterRecordReady: { backgroundColor: colors.danger },
  shutterRecording: { backgroundColor: colors.danger, width: 28, height: 28, borderRadius: 6 },
  hintText: { color: "rgba(255,255,255,0.65)", fontSize: 12.5, marginTop: spacing.md },
  toast: {
    position: "absolute",
    top: "45%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toastText: { color: colors.text, fontSize: 13, fontWeight: "600" },
  voiceWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  voiceOrb: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  voiceStatus: { color: colors.text, fontSize: 16, fontWeight: "600" },
  voiceTimer: { color: colors.textMuted, fontFamily: "monospace", fontSize: 14 },
  waveformRow: { flexDirection: "row", alignItems: "center", gap: 4, height: 40, marginTop: 10 },
  waveBar: { width: 3, borderRadius: 2, backgroundColor: colors.accent },
});
