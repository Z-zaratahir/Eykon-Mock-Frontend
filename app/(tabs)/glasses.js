import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing, type } from "../../constants/theme";
import { Badge } from "../../components/ui";
import { glassesDevice as initialDevice } from "../../data/mockData";

function BatteryRing({ pct }) {
  const color = pct > 40 ? colors.success : pct > 15 ? colors.accent : colors.danger;
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
  const [asPrimary, setAsPrimary] = useState(true);

  const captureModes = [
    { key: "continuous", label: "Continuous", desc: "Always watching, YOLO-gated" },
    { key: "standby", label: "Standby", desc: "Only on wake word or tap" },
    { key: "off", label: "Off", desc: "Glasses camera disabled" },
  ];

  const storagePct = Math.round((device.storageUsedGb / device.storageTotalGb) * 100);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 140 }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: spacing.lg }}>
        <Text style={styles.eyebrow}>PAIRED DEVICE</Text>
        <Text style={styles.title}>Glasses</Text>
      </View>

      <View style={styles.heroWrap}>
        <LinearGradient colors={["#2A3A5C", "#141C38"]} style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <View style={styles.connectionRow}>
                <View style={[styles.connectionDot, { backgroundColor: device.connected ? colors.success : colors.danger }]} />
                <Text style={styles.connectionText}>{device.connected ? "Connected" : "Disconnected"}</Text>
              </View>
              <Text style={styles.deviceName}>{device.name}</Text>
              <Text style={styles.deviceMeta}>Firmware {device.firmware} · synced {device.lastSync}</Text>
            </View>
            <Ionicons name="glasses" size={46} color="rgba(255,159,28,0.9)" />
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
                  color={device.temperature === "nominal" ? colors.success : colors.accent}
                />
                <Text style={styles.tempText}>
                  {device.temperature === "nominal" ? "Running cool" : "Running warm — throttling extraction"}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
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
                  <Text style={[styles.modeRowLabel, active && { color: colors.accent }]}>{m.label}</Text>
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
            trackColor={{ false: colors.surfaceAlt, true: colors.accentDeep }}
            thumbColor={colors.text}
          />
        </View>
        <View style={styles.toggleCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>Glasses as primary source</Text>
            <Text style={styles.toggleDesc}>
              When off, your phone camera becomes the main capture source instead.
            </Text>
          </View>
          <Switch
            value={asPrimary}
            onValueChange={setAsPrimary}
            trackColor={{ false: colors.surfaceAlt, true: colors.accentDeep }}
            thumbColor={colors.text}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Pipeline health</Text>
        <View style={styles.pipelineRow}>
          <PipelineStage icon="camera-outline" label="Capture" ok />
          <PipelineArrow />
          <PipelineStage icon="scan-outline" label="YOLO" ok />
          <PipelineArrow />
          <PipelineStage icon="albums-outline" label="Extract" ok />
          <PipelineArrow />
          <PipelineStage icon="server-outline" label="Store" ok />
        </View>
      </View>
    </ScrollView>
  );
}

function PipelineStage({ icon, label, ok }) {
  return (
    <View style={styles.pipelineStage}>
      <View style={[styles.pipelineIconWrap, { borderColor: ok ? colors.success : colors.danger }]}>
        <Ionicons name={icon} size={16} color={ok ? colors.success : colors.danger} />
      </View>
      <Text style={styles.pipelineLabel}>{label}</Text>
    </View>
  );
}
function PipelineArrow() {
  return <Ionicons name="chevron-forward" size={14} color={colors.textFaintSolid} style={{ marginTop: -14 }} />;
}

const styles = StyleSheet.create({
  eyebrow: { color: colors.accent, ...type.label, textTransform: "uppercase" },
  title: { color: colors.text, ...type.display, marginTop: 4, marginBottom: spacing.md },
  heroWrap: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  heroCard: { borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.lg },
  connectionRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  connectionDot: { width: 7, height: 7, borderRadius: 3.5 },
  connectionText: { color: colors.textMuted, fontSize: 12, fontWeight: "600" },
  deviceName: { color: colors.text, fontSize: 19, fontWeight: "700" },
  deviceMeta: { color: colors.textFaintSolid, fontSize: 11.5, marginTop: 2 },
  heroStatsRow: { flexDirection: "row", gap: spacing.md, alignItems: "center" },
  batteryRingOuter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceAlt,
    overflow: "hidden",
    justifyContent: "flex-end",
    borderWidth: 1,
    borderColor: colors.border,
  },
  batteryRingFill: { width: "100%", position: "absolute", bottom: 0 },
  batteryRingLabelWrap: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  batteryRingLabel: { color: colors.text, fontSize: 12, fontWeight: "800" },
  storageBarWrap: {},
  storageBarHeaderRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  storageLabel: { color: colors.textMuted, fontSize: 11.5 },
  storageValue: { color: colors.textFaintSolid, fontSize: 11 },
  storageBarTrack: { height: 6, borderRadius: 3, backgroundColor: colors.surfaceAlt, overflow: "hidden" },
  storageBarFill: { height: "100%", backgroundColor: colors.slate, borderRadius: 3 },
  tempRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  tempText: { color: colors.textMuted, fontSize: 11.5 },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionLabel: { color: colors.textFaintSolid, ...type.label, textTransform: "uppercase", marginBottom: spacing.sm },
  modeList: { gap: 8 },
  modeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeRowActive: { borderColor: colors.accent, backgroundColor: colors.bgElevated },
  modeRowLabel: { color: colors.text, fontSize: 14.5, fontWeight: "700" },
  modeRowDesc: { color: colors.textFaintSolid, fontSize: 11.5, marginTop: 2 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  radioOuterActive: { borderColor: colors.accent },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  toggleTitle: { color: colors.text, fontSize: 13.5, fontWeight: "700" },
  toggleDesc: { color: colors.textFaintSolid, fontSize: 11.5, marginTop: 3, lineHeight: 15 },
  pipelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
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
  pipelineLabel: { color: colors.textMuted, fontSize: 10.5, fontWeight: "600" },
});
