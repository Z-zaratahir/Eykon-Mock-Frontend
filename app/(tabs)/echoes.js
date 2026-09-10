import { useMemo, useState } from "react";
import { View, Text, StyleSheet, SectionList, Pressable, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, radius, spacing, type } from "../../constants/theme";
import { Badge } from "../../components/ui";
import { memoryEvents, EVENT_TYPES, retrievalStats } from "../../data/mockData";

const FILTERS = [
  { key: "all", label: "All", icon: "apps-outline" },
  { key: EVENT_TYPES.TEXT, label: "Text", icon: "text-outline" },
  { key: EVENT_TYPES.OBJECT, label: "Objects", icon: "cube-outline" },
  { key: EVENT_TYPES.PERSON, label: "People", icon: "person-outline" },
  { key: EVENT_TYPES.SCENE, label: "Scenes", icon: "image-outline" },
];

function dayLabel(iso) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

function groupByDay(events) {
  const map = new Map();
  events
    .slice()
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .forEach((e) => {
      const label = dayLabel(e.timestamp);
      if (!map.has(label)) map.set(label, []);
      map.get(label).push(e);
    });
  return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
}

function EventCard({ event }) {
  const time = new Date(event.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return (
    <Pressable onPress={() => router.push(`/memory/${event.id}`)} style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
      <View style={[styles.thumb, { backgroundColor: event.thumbnailColor }]}>
        <Ionicons name={event.icon} size={22} color={colors.textPrimary} />
        {event.source === "glasses" ? (
          <View style={styles.sourcePip}>
            <Ionicons name="glasses" size={9} color={colors.background} />
          </View>
        ) : (
          <View style={[styles.sourcePip, { backgroundColor: colors.textSecondary }]}>
            <Ionicons name="phone-portrait" size={9} color={colors.textPrimary} />
          </View>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {event.title}
          </Text>
          <Text style={styles.cardTime}>{time}</Text>
        </View>
        <Text style={styles.cardSummary} numberOfLines={2}>
          {event.summary}
        </Text>
        {event.ocrText ? (
          <View style={styles.ocrPill}>
            <Ionicons name="scan-outline" size={11} color={colors.teal} />
            <Text style={styles.ocrText} numberOfLines={1}>
              {event.ocrText}
            </Text>
          </View>
        ) : null}
        <View style={styles.tagRow}>
          <Ionicons name="location-outline" size={11} color={colors.textFaint} />
          <Text style={styles.locationText}>{event.location}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function EchoesScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return memoryEvents.filter((e) => {
      const matchesFilter = filter === "all" || e.type === filter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        (e.ocrText && e.ocrText.toLowerCase().includes(q)) ||
        e.tags.some((t) => t.includes(q));
      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  const sections = useMemo(() => groupByDay(filtered), [filtered]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: spacing.lg }}>
        <Text style={styles.eyebrow}>YOUR MEMORY, INDEXED</Text>
        <Text style={styles.title}>Echoes</Text>
        <Text style={styles.subtitle}>Every moment worth keeping, laid out by when it happened.</Text>

        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={styles.statNumber}>{memoryEvents.length}</Text>
            <Text style={styles.statLabel}>moments</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statNumber}>{retrievalStats.hitAt5}%</Text>
            <Text style={styles.statLabel}>Hit@5</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statNumber}>{retrievalStats.avgLatencyMs}ms</Text>
            <Text style={styles.statLabel}>avg recall</Text>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.textFaint} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search your memory…"
            placeholderTextColor={colors.textFaint}
            style={styles.searchInput}
          />
        </View>

        <SectionList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={
            <View style={styles.filterRow}>
              {FILTERS.map((f) => {
                const active = filter === f.key;
                return (
                  <Pressable
                    key={f.key}
                    onPress={() => setFilter(f.key)}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                  >
                    <Ionicons name={f.icon} size={13} color={active ? colors.background : colors.textSecondary} />
                    <Text style={[styles.filterChipText, active && { color: colors.background }]}>{f.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          }
        />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventCard event={item} />}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionHeader}>{section.title}</Text>
            <View style={styles.sectionLine} />
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 140, paddingTop: spacing.sm }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="moon-outline" size={28} color={colors.textFaint} />
            <Text style={styles.emptyText}>Nothing matches yet. Try a different search or filter.</Text>
          </View>
        }
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: { color: colors.teal, ...type.label, textTransform: "uppercase" },
  title: { color: colors.textPrimary, ...type.display, marginTop: 4 },
  subtitle: { color: colors.textSecondary, ...type.body, marginTop: 4, marginBottom: spacing.md },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: spacing.md },
  statChip: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  statNumber: { color: colors.teal, fontSize: 17, fontWeight: "700" },
  statLabel: { color: colors.textFaint, fontSize: 10.5, marginTop: 2 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    height: 42,
    borderWidth: 1,
    borderColor: colors.hairline,
    marginBottom: spacing.sm,
  },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: 14 },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: spacing.sm },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  filterChipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  filterChipText: { color: colors.textSecondary, fontSize: 12.5, fontWeight: "600" },
  sectionHeaderWrap: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10, marginTop: 6 },
  sectionHeader: { color: colors.textSecondary, fontSize: 13, fontWeight: "700" },
  sectionLine: { flex: 1, height: 1, backgroundColor: colors.hairline },
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  sourcePip: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.backgroundAlt,
  },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  cardTitle: { color: colors.textPrimary, fontSize: 14.5, fontWeight: "700", flexShrink: 1 },
  cardTime: { color: colors.textFaint, fontSize: 11 },
  cardSummary: { color: colors.textSecondary, fontSize: 12.5, marginTop: 3, lineHeight: 17 },
  ocrPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.tealTint,
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginTop: 6,
  },
  ocrText: { color: colors.teal, fontSize: 11.5, fontFamily: "monospace" },
  tagRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  locationText: { color: colors.textFaint, fontSize: 11 },
  empty: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyText: { color: colors.textFaint, fontSize: 13, textAlign: "center", paddingHorizontal: 40 },
});
