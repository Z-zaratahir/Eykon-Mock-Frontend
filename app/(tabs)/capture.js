import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, radius, spacing, type } from "../../constants/theme";
import { glassesDevice, phoneCaptureStats } from "../../data/mockData";

const MODES = [
  { key: "photo", label: "Snapshot", icon: "camera", desc: "Capture a single still moment" },
  { key: "video", label: "Video", icon: "videocam", desc: "Record a short clip" },
  { key: "voice", label: "Voice note", icon: "mic", desc: "Send a spoken memory" },
];

export default function CaptureTab() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: spacing.lg }}>
        <Text style={styles.eyebrow}>MANUAL CAPTURE</Text>
        <Text style={styles.title}>Add to memory</Text>
        <Text style={styles.subtitle}>
          Your glasses already capture continuously. Use your phone when you're not wearing them, or to log something right now.
        </Text>
      </View>

      <View style={styles.heroWrap}>
        <LinearGradient colors={["#20294A", "#12172E"]} style={styles.heroCard}>
          <View style={styles.heroTextWrap}>
            <View style={styles.sourceIndicator}>
              <Ionicons
                name={glassesDevice.connected ? "glasses" : "phone-portrait"}
                size={14}
                color={colors.accent}
              />
              <Text style={styles.sourceIndicatorText}>
                {glassesDevice.connected ? "Glasses recording continuously" : "Phone is your active source"}
              </Text>
            </View>
            <Text style={styles.heroStat}>{phoneCaptureStats.eventsToday}</Text>
            <Text style={styles.heroStatLabel}>moments captured today</Text>
          </View>
          <Pressable onPress={() => router.push("/capture")} style={styles.bigCaptureButton}>
            <LinearGradient colors={[colors.accent, colors.accentDeep]} style={styles.bigCaptureInner}>
              <Ionicons name="aperture" size={30} color={colors.bg} />
            </LinearGradient>
          </Pressable>
        </LinearGradient>
      </View>

      <View style={styles.modesRow}>
        {MODES.map((m) => (
          <Pressable key={m.key} style={styles.modeCard} onPress={() => router.push({ pathname: "/capture", params: { mode: m.key } })}>
            <View style={styles.modeIconWrap}>
              <Ionicons name={m.icon} size={20} color={colors.accent} />
            </View>
            <Text style={styles.modeLabel}>{m.label}</Text>
            <Text style={styles.modeDesc}>{m.desc}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={18} color={colors.textMuted} />
        <Text style={styles.infoText}>
          Anything you capture here is processed through the same pipeline as your glasses — detected, OCR'd, embedded, and stored as a searchable memory in Echoes.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: { color: colors.accent, ...type.label, textTransform: "uppercase" },
  title: { color: colors.text, ...type.display, marginTop: 4 },
  subtitle: { color: colors.textMuted, ...type.body, marginTop: 6, marginBottom: spacing.md },
  heroWrap: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  heroCard: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  heroTextWrap: { flex: 1 },
  sourceIndicator: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  sourceIndicatorText: { color: colors.accent, fontSize: 12, fontWeight: "600" },
  heroStat: { color: colors.text, fontSize: 40, fontWeight: "800" },
  heroStatLabel: { color: colors.textMuted, fontSize: 12.5, marginTop: 2 },
  bigCaptureButton: { marginLeft: spacing.md },
  bigCaptureInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  modesRow: { flexDirection: "row", gap: 10, paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  modeCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  modeIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  modeLabel: { color: colors.text, fontSize: 13.5, fontWeight: "700" },
  modeDesc: { color: colors.textFaintSolid, fontSize: 11, lineHeight: 14 },
  infoCard: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoText: { color: colors.textMuted, fontSize: 12.5, flex: 1, lineHeight: 18 },
});
