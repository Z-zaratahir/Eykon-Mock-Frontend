import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing, type } from "../../constants/theme";
import { retrievalStats, phoneCaptureStats } from "../../data/mockData";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [localOnly, setLocalOnly] = useState(true);
  const [redactSensitive, setRedactSensitive] = useState(true);
  const [peopleMemory, setPeopleMemory] = useState(false);
  const [multilingual, setMultilingual] = useState("English + Urdu");

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 140 }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: spacing.lg }}>
        <Text style={styles.eyebrow}>YOUR PROFILE</Text>
        <Text style={styles.title}>You</Text>
      </View>

      <View style={styles.profileCard}>
        <LinearGradient colors={[colors.accent, colors.accentDeep]} style={styles.avatar}>
          <Text style={styles.avatarInitial}>Z</Text>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>Zara</Text>
          <Text style={styles.profileSub}>{multilingual} · on-device profile</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={styles.statPillNumber}>{phoneCaptureStats.eventsToday}</Text>
          <Text style={styles.statPillLabel}>today</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statBoxNumber}>{retrievalStats.memoriesStored}</Text>
          <Text style={styles.statBoxLabel}>memories stored</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statBoxNumber}>{retrievalStats.hitAt1}%</Text>
          <Text style={styles.statBoxLabel}>Hit@1 accuracy</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statBoxNumber}>{phoneCaptureStats.hoursActive}h</Text>
          <Text style={styles.statBoxLabel}>active today</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Privacy — by design</Text>

        <ToggleRow
          icon="lock-closed-outline"
          title="Local-first storage"
          desc="Your memory archive stays on this device. Nothing is required to leave for the assistant to work."
          value={localOnly}
          onChange={setLocalOnly}
        />
        <ToggleRow
          icon="shield-checkmark-outline"
          title="Auto-redact sensitive content"
          desc="Flag things that look like passwords or IDs and handle them with extra care."
          value={redactSensitive}
          onChange={setRedactSensitive}
        />
        <ToggleRow
          icon="people-outline"
          title="Remember other people"
          desc="Off by default — bystanders in frame aren't retained unless you turn this on."
          value={peopleMemory}
          onChange={setPeopleMemory}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Language</Text>
        <View style={styles.langRow}>
          {["English", "Urdu", "English + Urdu"].map((l) => {
            const active = multilingual === l;
            return (
              <Pressable key={l} onPress={() => setMultilingual(l)} style={[styles.langChip, active && styles.langChipActive]}>
                <Text style={[styles.langChipText, active && { color: colors.bg }]}>{l}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.hintText}>Voice conversations adapt to mixed Urdu-English, hands-free.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.aboutCard}>
          <Row icon="git-branch-outline" label="Retrieval pipeline" value="Hybrid dense + BM25 + RRF" />
          <Row icon="hardware-chip-outline" label="On-device LLM" value="llama.cpp via Termux" />
          <Row icon="eye-outline" label="Vision model" value="Moondream (baseline)" />
          <Row icon="git-network-outline" label="Version" value="0.4.0 — FYP prototype" last />
        </View>
      </View>
    </ScrollView>
  );
}

function ToggleRow({ icon, title, desc, value, onChange }) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleIconWrap}>
        <Ionicons name={icon} size={17} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleDesc}>{desc}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: colors.surfaceAlt, true: colors.accentDeep }} thumbColor={colors.text} />
    </View>
  );
}

function Row({ icon, label, value, last }) {
  return (
    <View style={[styles.aboutRow, !last && styles.aboutRowBorder]}>
      <Ionicons name={icon} size={15} color={colors.textMuted} />
      <Text style={styles.aboutLabel}>{label}</Text>
      <Text style={styles.aboutValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: { color: colors.accent, ...type.label, textTransform: "uppercase" },
  title: { color: colors.text, ...type.display, marginTop: 4, marginBottom: spacing.md },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  avatarInitial: { color: colors.bg, fontSize: 22, fontWeight: "800" },
  profileName: { color: colors.text, fontSize: 17, fontWeight: "700" },
  profileSub: { color: colors.textFaintSolid, fontSize: 12, marginTop: 2 },
  statPill: { alignItems: "center", backgroundColor: colors.accentSoft, borderRadius: radius.md, paddingVertical: 8, paddingHorizontal: 12 },
  statPillNumber: { color: colors.accent, fontSize: 16, fontWeight: "800" },
  statPillLabel: { color: colors.accent, fontSize: 9.5 },
  statsGrid: { flexDirection: "row", gap: 10, marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  statBox: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: colors.border },
  statBoxNumber: { color: colors.text, fontSize: 18, fontWeight: "800" },
  statBoxLabel: { color: colors.textFaintSolid, fontSize: 10, marginTop: 3, textAlign: "center", paddingHorizontal: 6 },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionLabel: { color: colors.textFaintSolid, ...type.label, textTransform: "uppercase", marginBottom: spacing.sm },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  toggleIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accentSoft, alignItems: "center", justifyContent: "center" },
  toggleTitle: { color: colors.text, fontSize: 13.5, fontWeight: "700" },
  toggleDesc: { color: colors.textFaintSolid, fontSize: 11, marginTop: 2, lineHeight: 15 },
  langRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  langChip: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  langChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  langChipText: { color: colors.textMuted, fontSize: 12, fontWeight: "700" },
  hintText: { color: colors.textFaintSolid, fontSize: 11.5 },
  aboutCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  aboutRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  aboutRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  aboutLabel: { color: colors.textMuted, fontSize: 12.5, flex: 1 },
  aboutValue: { color: colors.text, fontSize: 12, fontWeight: "600" },
});
