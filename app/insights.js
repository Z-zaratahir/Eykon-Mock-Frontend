import { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing, type } from "../constants/theme";
import { memoryEvents, chatMessages, phoneCaptureStats, TYPE_META, EVENT_TYPES } from "../data/mockData";

function relativeAge(iso) {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 31) return `${Math.round(days / 7)} week${Math.round(days / 7) === 1 ? "" : "s"} ago`;
  if (days < 365) return `${Math.round(days / 30)} month${Math.round(days / 30) === 1 ? "" : "s"} ago`;
  return `${Math.round(days / 365)} year${Math.round(days / 365) === 1 ? "" : "s"} ago`;
}

// "Most recalled memory" — counted from how often each event actually shows
// up as a retrieval source across the chat history, not a hardcoded stat.
function mostRecalled() {
  const counts = new Map();
  chatMessages.forEach((m) => {
    m.retrieval?.sources?.forEach((s) => counts.set(s.eventId, (counts.get(s.eventId) || 0) + 1));
  });
  let bestId = null;
  let bestCount = 0;
  counts.forEach((count, id) => {
    if (count > bestCount) {
      bestCount = count;
      bestId = id;
    }
  });
  const event = bestId ? memoryEvents.find((e) => e.id === bestId) : null;
  return event ? { event, count: bestCount } : null;
}

const FIRST_WEEK_DAYS = 7;

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const recalled = useMemo(mostRecalled, []);
  const onThisDay = useMemo(() => memoryEvents.slice().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))[0], []);

  // "Still learning" first-week state (build brief T16) — Insights needs real
  // history to be meaningful, so below a week of data (or almost no memories
  // yet) it says so honestly instead of showing a hollow "On this day" for a
  // memory from yesterday.
  const historyDays = onThisDay ? Math.round((Date.now() - new Date(onThisDay.timestamp).getTime()) / 86400000) : 0;
  const stillLearning = memoryEvents.length < 3 || historyDays < FIRST_WEEK_DAYS;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: spacing.lg }}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>RECALL DIGEST</Text>
            <Text style={styles.title}>Insights</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>A quick look at what Eykon's been noticing — and remembering — for you.</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="today-outline" size={18} color={colors.teal} />
          <Text style={styles.statNumber}>{phoneCaptureStats.eventsToday}</Text>
          <Text style={styles.statLabel}>moments today</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="calendar-outline" size={18} color={colors.teal} />
          <Text style={styles.statNumber}>{phoneCaptureStats.eventsThisWeek}</Text>
          <Text style={styles.statLabel}>this week</Text>
        </View>
      </View>

      {stillLearning ? (
        <View style={styles.learningWrap}>
          <View style={styles.learningIconWrap}>
            <Ionicons name="hourglass-outline" size={26} color={colors.teal} />
          </View>
          <Text style={styles.learningTitle}>Still learning</Text>
          <Text style={styles.learningText}>
            Eykon needs about a week of moments before recall stats and "On this day" resurfacing are worth showing. Keep
            capturing — this fills in on its own.
          </Text>
        </View>
      ) : (
        <>
          {recalled && (
            <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
              <Text style={styles.sectionLabel}>Most recalled</Text>
              <Pressable onPress={() => router.push(`/memory/${recalled.event.id}`)} style={styles.card}>
                <View style={[styles.cardIconWrap, { backgroundColor: (TYPE_META[recalled.event.type] || TYPE_META[EVENT_TYPES.SCENE]).tint }]}>
                  <Ionicons name={recalled.event.icon} size={20} color={(TYPE_META[recalled.event.type] || TYPE_META[EVENT_TYPES.SCENE]).color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{recalled.event.title}</Text>
                  <Text style={styles.cardMeta}>
                    Asked about {recalled.count} time{recalled.count === 1 ? "" : "s"} this session
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
              </Pressable>
            </View>
          )}

          {onThisDay && (
            <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
              <Text style={styles.sectionLabel}>On this day</Text>
              <Pressable onPress={() => router.push(`/memory/${onThisDay.id}`)} style={[styles.card, styles.onThisDayCard]}>
                <View style={styles.cardIconWrap}>
                  <Ionicons name="sparkles" size={18} color={colors.white} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{onThisDay.title}</Text>
                  <Text style={styles.cardMeta}>From {relativeAge(onThisDay.timestamp)} — {onThisDay.location}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
              </Pressable>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.backgroundAlt, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.hairline },
  eyebrow: { color: colors.teal, ...type.label, textTransform: "uppercase" },
  title: { color: colors.textPrimary, ...type.display },
  subtitle: { color: colors.textSecondary, ...type.body, marginTop: 6, marginBottom: spacing.sm },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: spacing.lg, marginTop: spacing.sm },
  statCard: { flex: 1, backgroundColor: colors.backgroundAlt, borderRadius: radius.lg, padding: spacing.md, alignItems: "center", gap: 4, borderWidth: 1, borderColor: colors.hairline },
  statNumber: { color: colors.textPrimary, fontSize: 22, fontWeight: "800" },
  statLabel: { color: colors.textFaint, fontSize: 13 },
  sectionLabel: { color: colors.textFaint, ...type.label, textTransform: "uppercase", marginBottom: spacing.sm },
  card: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.backgroundAlt, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.hairline },
  onThisDayCard: { backgroundColor: colors.tealTintFaint },
  cardIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: colors.teal },
  cardTitle: { color: colors.textPrimary, fontSize: 14.5, fontWeight: "700" },
  cardMeta: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  learningWrap: { alignItems: "center", paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: 8 },
  learningIconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.tealTintFaint, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  learningTitle: { color: colors.textPrimary, ...type.headline },
  learningText: { color: colors.textSecondary, ...type.body, textAlign: "center" },
});
