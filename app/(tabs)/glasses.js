import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, radius, spacing, type } from "../../constants/theme";
import { glassesDevice as initialDevice } from "../../data/mockData";

function BatteryRing({ pct }) {
  const color = pct > 40 ? colors.success : pct > 15 ? colors.teal : colors.live;
  return (
    <View style={styles.batteryRingOuter}>
      <View style={[styles.batteryRingFill, { height: `${pct}%`, backgroundColor: color }]} />
      <View style={styles.batteryRingLabelWrap}>
        <Text style={styles.batteryRingLabel}>{pct}%</Text>
      </View>
    </View>
  );
}

export default function GlassesScreen() {
  const insets = useSafeAreaInsets();
  const [device, setDevice] = useState(initialDevice);
  const [adaptive, setAdaptive] = useState(true);
  // "source" is the first-class answer to "glasses aren't the only recording
  // source" (UX plan, Glasses & Devices Hub) — a visible switch, not a buried
  // toggle, so it reads instantly whether the glasses or the phone is live.
  const [source, setSource] = useState(device.connected ? "glasses" : "phone");

  const captureModes = [
    { key: "continuous", label: "Continuous", desc: "Always watching, only saves what matters" },
    { key: "standby", label: "Standby", desc: "Only on wake word or tap" },
    { key: "off", label: "Off", desc: "Glasses camera disabled" },
  ];

  const storagePct = Math.round((device.storageUsedGb / device.storageTotalGb) * 100);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: 140 }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: spacing.lg }}>
        <Text style={styles.eyebrow}>PAIRED DEVICE</Text>
        <Text style={styles.title}>Glasses</Text>
      </View>

      {/* Visibility of system status is the top heuristic for this whole app
          (UX plan, Section 2) — connection state gets its own unmissable banner,
          not just a small dot buried in the hero card. */}
      {!device.connected && (
        <View style={styles.disconnectedBanner}>
          <Ionicons name="alert-circle" size={18} color={colors.live} />
          <View style={{ flex: 1 }}>
            <Text style={styles.disconnectedTitle}>Glasses disconnected</Text>
            <Text style={styles.disconnectedText}>Your phone is capturing instead. Nothing is being missed.</Text>
          </View>
        </View>
      )}

      <View style={styles.heroWrap}>
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <View style={styles.connectionRow}>
                <View style={[styles.connectionDot, { backgroundColor: device.connected ? colors.success : colors.live }]} />
                <Text style={[styles.connectionText, { color: device.connected ? colors.success : colors.live }]}>
                  {device.connected ? "Connected" : "Disconnected"}
                </Text>
              </View>
              <Text style={styles.deviceName}>{device.name}</Text>
              <Text style={styles.deviceMeta}>Firmware {device.firmware} · synced {device.lastSync}</Text>
            </View>
            <Ionicons name="glasses" size={46} color={colors.teal} />
          </View>

          <View style={styles.heroStatsRow}>
            <BatteryRing pct={device.battery} />
            <View style={{ flex: 1, gap: 10 }}>
              <View style={styles.storageBarWrap}>
                <View style={styles.storageBarHeaderRow}>
                  <Text style={styles.storageLabel}>On-device storage</Text>
                  <Text style={styles.storageValue}>
                    {device.storageUsedGb}GB / {device.storageTotalGb}GB
                  </Text>
                </View>
                <View style={styles.storageBarTrack}>
                  <View style={[styles.storageBarFill, { width: `${storagePct}%` }]} />
                </View>
              </View>
              <View style={styles.tempRow}>
                <Ionicons
                  name={device.temperature === "nominal" ? "thermometer-outline" : "flame-outline"}
                  size={14}
                  color={device.temperature === "nominal" ? colors.success : colors.warning}
                />
                <Text style={styles.tempText}>
                  {device.temperature === "nominal" ? "Running cool" : "Running warm — throttling extraction"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Active capture source</Text>
        <View style={styles.sourceSwitcher}>
          <Pressable
            style={[styles.sourceOption, source === "glasses" && styles.sourceOptionActive]}
            onPress={() => setSource("glasses")}
            disabled={!device.connected}
          >
            <Ionicons name="glasses-outline" size={18} color={source === "glasses" ? colors.white : colors.textFaint} />
            <Text style={[styles.sourceOptionText, source === "glasses" && styles.sourceOptionTextActive]}>Glasses</Text>
            {!device.connected && <Text style={styles.sourceOptionSub}>unavailable</Text>}
          </Pressable>
          <Pressable
            style={[styles.sourceOption, source === "phone" && styles.sourceOptionActive]}
            onPress={() => setSource("phone")}
          >
            <Ionicons name="phone-portrait-outline" size={18} color={source === "phone" ? colors.white : colors.textFaint} />
            <Text style={[styles.sourceOptionText, source === "phone" && styles.sourceOptionTextActive]}>Phone</Text>
          </Pressable>
        </View>
        <Text style={styles.sourceHint}>
          {source === "phone"
            ? "Your phone camera is the active source — use it when you're not wearing your glasses."
            : "Your glasses are capturing continuously. Switch to your phone any time they're off."}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Capture mode</Text>
        <View style={styles.modeList}>
          {captureModes.map((m) => {
            const active = device.captureMode === m.key;
            return (
              <Pressable
                key={m.key}
                style={[styles.modeRow, active && styles.modeRowActive]}
                onPress={() => setDevice((d) => ({ ...d, captureMode: m.key }))}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modeRowLabel, active && { color: colors.tealDark }]}>{m.label}</Text>
                  <Text style={styles.modeRowDesc}>{m.desc}</Text>
                </View>
                <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
                  {active && <View style={styles.radioInner} />}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Resource-adaptive operation</Text>
        <View style={styles.toggleCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>Adapt to battery & thermal state</Text>
            <Text style={styles.toggleDesc}>
              Automatically reduce extraction frequency or switch to a lighter model when the device is under strain.
            </Text>
          </View>
          <Switch
            value={adaptive}
            onValueChange={setAdaptive}
            trackColor={{ false: colors.hairline, true: colors.tealDark }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>System status</Text>
        <View style={styles.pipelineRow}>
          <PipelineStage icon="camera-outline" label="Capture" ok />
          <PipelineArrow />
          <PipelineStage icon="scan-outline" label="Detect" ok />
          <PipelineArrow />
          <PipelineStage icon="albums-outline" label="Understand" ok />
          <PipelineArrow />
          <PipelineStage icon="server-outline" label="Save" ok />
        </View>
      </View>

      <View style={styles.ctaRow}>
        <Pressable style={styles.captureCta} onPress={() => router.push("/capture")}>
          <Ionicons name="aperture-outline" size={18} color={colors.white} />
          <Text style={styles.captureCtaText}>Capture a moment</Text>
        </Pressable>
        <Pressable style={styles.liveLensCta} onPress={() => router.push("/live-lens")}>
          <Ionicons name="eye-outline" size={18} color={colors.tealDark} />
          <Text style={styles.liveLensCtaText}>Live Lens</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function PipelineStage({ icon, label, ok }) {
  return (
    <View style={styles.pipelineStage}>
      <View style={[styles.pipelineIconWrap, { borderColor: ok ? colors.success : colors.live }]}>
        <Ionicons name={icon} size={16} color={ok ? colors.success : colors.live} />
      </View>
      <Text style={styles.pipelineLabel}>{label}</Text>
    </View>
  );
}
function PipelineArrow() {
  return <Ionicons name="chevron-forward" size={14} color={colors.textFaint} style={{ marginTop: -14 }} />;
}

const styles = StyleSheet.create({
  eyebrow: { color: colors.teal, ...type.label, textTransform: "uppercase" },
  title: { color: colors.textPrimary, ...type.display, marginTop: 4, marginBottom: spacing.md },
  disconnectedBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: colors.liveTint,
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  disconnectedTitle: { color: colors.textPrimary, fontSize: 13.5, fontWeight: "700" },
  disconnectedText: { color: colors.textSecondary, fontSize: 13, marginTop: 2, lineHeight: 16 },
  heroWrap: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  heroCard: { backgroundColor: colors.backgroundAlt, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.hairline },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.lg },
  connectionRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  connectionDot: { width: 7, height: 7, borderRadius: 3.5 },
  connectionText: { fontSize: 13, fontWeight: "700" },
  deviceName: { color: colors.textPrimary, fontSize: 19, fontWeight: "700" },
  deviceMeta: { color: colors.textFaint, fontSize: 13, marginTop: 2 },
  heroStatsRow: { flexDirection: "row", gap: spacing.md, alignItems: "center" },
  batteryRingOuter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background,
    overflow: "hidden",
    justifyContent: "flex-end",
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  batteryRingFill: { width: "100%", position: "absolute", bottom: 0 },
  batteryRingLabelWrap: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  batteryRingLabel: { color: colors.textPrimary, fontSize: 13, fontWeight: "800" },
  storageBarWrap: {},
  storageBarHeaderRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  storageLabel: { color: colors.textSecondary, fontSize: 13 },
  storageValue: { color: colors.textFaint, fontSize: 13 },
  storageBarTrack: { height: 6, borderRadius: 3, backgroundColor: colors.background, overflow: "hidden" },
  storageBarFill: { height: "100%", backgroundColor: colors.teal, borderRadius: 3 },
  tempRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  tempText: { color: colors.textSecondary, fontSize: 13 },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionLabel: { color: colors.textFaint, ...type.label, textTransform: "uppercase", marginBottom: spacing.sm },
  sourceSwitcher: { flexDirection: "row", gap: 8, backgroundColor: colors.backgroundAlt, borderRadius: radius.lg, padding: 6, borderWidth: 1, borderColor: colors.hairline },
  sourceOption: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: radius.md, minHeight: 44 },
  sourceOptionActive: { backgroundColor: colors.teal },
  sourceOptionText: { color: colors.textSecondary, fontSize: 13.5, fontWeight: "700" },
  sourceOptionTextActive: { color: colors.white },
  sourceOptionSub: { color: colors.textFaint, fontSize: 13 },
  sourceHint: { color: colors.textFaint, fontSize: 13, marginTop: 8, lineHeight: 16 },
  modeList: { gap: 8 },
  modeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  modeRowActive: { borderColor: colors.teal },
  modeRowLabel: { color: colors.textPrimary, fontSize: 14.5, fontWeight: "700" },
  modeRowDesc: { color: colors.textFaint, fontSize: 13, marginTop: 2 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.hairline, alignItems: "center", justifyContent: "center" },
  radioOuterActive: { borderColor: colors.teal },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.teal },
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    marginBottom: 10,
  },
  toggleTitle: { color: colors.textPrimary, fontSize: 13.5, fontWeight: "700" },
  toggleDesc: { color: colors.textFaint, fontSize: 13, marginTop: 3, lineHeight: 15 },
  pipelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  pipelineStage: { alignItems: "center", gap: 6, flex: 1 },
  pipelineIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  pipelineLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: "600" },
  ctaRow: { flexDirection: "row", gap: 10, marginHorizontal: spacing.lg },
  captureCta: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.teal,
    borderRadius: radius.pill,
    paddingVertical: 14,
    minHeight: 44,
  },
  captureCtaText: { color: colors.white, fontWeight: "700", fontSize: 14.5 },
  liveLensCta: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.tealTint,
    borderRadius: radius.pill,
    paddingVertical: 14,
    minHeight: 44,
  },
  liveLensCtaText: { color: colors.tealDark, fontWeight: "700", fontSize: 14.5 },
});
