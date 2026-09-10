import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing, type } from "../../constants/theme";
import { Badge } from "../../components/ui";
import { memoryEvents } from "../../data/mockData";

export default function MemoryDetail() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const event = memoryEvents.find((e) => e.id === id) || memoryEvents[0];
  const date = new Date(event.timestamp);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <LinearGradient colors={[event.thumbnailColor, colors.bg]} style={[styles.hero, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.heroIconWrap}>
          <Ionicons name={event.icon} size={40} color={colors.text} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 60 }}>
        <View style={styles.badgeRow}>
          <Badge label={event.source === "glasses" ? "Captured via Glasses" : "Captured via Phone"} tone="accent" />
          <Badge label={`${Math.round(event.confidence * 100)}% confidence`} tone="success" />
        </View>

        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.timestamp}>
          {date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} · {date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <Text style={styles.metaText}>{event.location}</Text>
        </View>

        <Text style={styles.sectionLabel}>What Eykon saw</Text>
        <View style={styles.card}>
          <Text style={styles.summaryText}>{event.summary}</Text>
        </View>

        {event.ocrText ? (
          <>
            <Text style={styles.sectionLabel}>Extracted text (OCR)</Text>
            <View style={[styles.card, styles.ocrCard]}>
              <Ionicons name="scan-outline" size={16} color={colors.accent} />
              <Text style={styles.ocrText}>{event.ocrText}</Text>
            </View>
          </>
        ) : null}

        <Text style={styles.sectionLabel}>Tags</Text>
        <View style={styles.tagWrap}>
          {event.tags.map((t) => (
            <Badge key={t} label={t} tone="neutral" />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Memory record</Text>
        <View style={styles.card}>
          <Row label="Event ID" value={event.id} mono />
          <Row label="Type" value={event.type} />
          <Row label="Embedding space" value="bge-small-en-v1.5 · 384d" mono />
          <Row label="Retrieval index" value="hybrid (dense + BM25 + RRF)" />
          <Row label="Eviction status" value="Retained — pattern-matched as high-value" last />
        </View>

        <Pressable style={styles.askButton} onPress={() => router.push("/(tabs)")}>
          <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.bg} />
          <Text style={styles.askButtonText}>Ask a follow-up about this</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Row({ label, value, mono, last }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, mono && { fontFamily: "monospace" }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 190, justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroIconWrap: {
    alignSelf: "center",
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: -10,
  },
  badgeRow: { flexDirection: "row", gap: 8, marginBottom: spacing.md },
  title: { color: colors.text, ...type.title, marginBottom: 4 },
  timestamp: { color: colors.textMuted, fontSize: 13, marginBottom: 10 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: spacing.lg },
  metaText: { color: colors.textMuted, fontSize: 13.5 },
  sectionLabel: { color: colors.textFaintSolid, ...type.label, textTransform: "uppercase", marginBottom: 8, marginTop: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryText: { color: colors.text, ...type.body },
  ocrCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.accentSoft, borderColor: "transparent" },
  ocrText: { color: colors.accent, fontFamily: "monospace", fontSize: 15, fontWeight: "600" },
  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { color: colors.textMuted, fontSize: 12.5 },
  rowValue: { color: colors.text, fontSize: 12.5, flexShrink: 1, textAlign: "right" },
  askButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: 14,
    marginTop: spacing.xl,
  },
  askButtonText: { color: colors.bg, fontWeight: "700", fontSize: 14.5 },
});
