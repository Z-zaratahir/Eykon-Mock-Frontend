import { useMemo, useState } from "react";
import { View, Text, StyleSheet, SectionList, Pressable, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, radius, spacing, type } from "../../constants/theme";
import { memoryEvents, EVENT_TYPES, TYPE_META, retrievalStats } from "../../data/mockData";

const FILTERS = [
  { key: "all", label: "All", icon: "apps-outline" },
  { key: EVENT_TYPES.TEXT, label: "Text", icon: "text-outline" },
  { key: EVENT_TYPES.OBJECT, label: "Objects", icon: "cube-outline" },
  { key: EVENT_TYPES.PERSON, label: "People", icon: "person-outline" },
  { key: EVENT_TYPES.AUDIO, label: "Audio", icon: "mic-outline" },
];

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

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

// Type-specific thumbnail — the concrete answer to "not everything is a
// photo" (UX plan, Memory Gallery): a scanned monospace preview for OCR text,
// an icon+color block for objects/scenes, an initials avatar for people, and
// a static waveform glyph for audio.
function EventThumb({ event, meta }) {
  if (event.type === EVENT_TYPES.TEXT) {
    // A dashed "scanned" motif rather than cramming the OCR excerpt itself in
    // here — at a 52pt thumbnail there's no room for it at the 13px caption
    // floor. The actual excerpt gets its own readable-size row below (see
    // EventCard's ocrPreview).
    return (
      <View style={[styles.thumb, styles.scanThumb]}>
        <Ionicons name="scan-outline" size={20} color={meta.color} />
      </View>
    );
  }
  if (event.type === EVENT_TYPES.PERSON) {
    return (
      <View style={[styles.thumb, { backgroundColor: meta.tint }]}>
        <Text style={[styles.avatarInitials, { color: meta.color }]}>{initials(event.personName || event.title)}</Text>
      </View>
    );
  }
  if (event.type === EVENT_TYPES.AUDIO) {
    return (
      <View style={[styles.thumb, { backgroundColor: meta.tint }]}>
        <View style={styles.staticWave}>
          {[7, 14, 9, 18, 11, 15, 8].map((h, i) => (
            <View key={i} style={[styles.staticWaveBar, { height: h, backgroundColor: meta.color }]} />
          ))}
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.thumb, { backgroundColor: meta.tint }]}>
      <Ionicons name={event.icon} size={22} color={meta.color} />
    </View>
  );
}

function EventCard({ event }) {
  const meta = TYPE_META[event.type] || TYPE_META[EVENT_TYPES.SCENE];
  const time = new Date(event.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return (
    <Pressable onPress={() => router.push(`/memory/${event.id}`)} style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
      <View>
        <EventThumb event={event} meta={meta} />
        <View style={[styles.sourcePip, { backgroundColor: event.source === "glasses" ? colors.teal : colors.textSecondary }]}>
          <Ionicons name={event.source === "glasses" ? "glasses" : "phone-portrait"} size={9} color={colors.white} />
        </View>
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
          <View style={styles.ocrPreview}>
            <Ionicons name="scan-outline" size={12} color={colors.tealDark} />
            <Text style={styles.ocrPreviewText} numberOfLines={1}>
              {event.ocrText}
            </Text>
          </View>
        ) : null}
        <View style={styles.tagRow}>
          {event.pinned ? <Ionicons name="bookmark" size={11} color={colors.teal} /> : null}
          <Ionicons name="location-outline" size={11} color={colors.textFaint} />
          <Text style={styles.locationText}>{event.location}</Text>
        </View>
      </View>
    </Pressable>
  );
}

// A thin vertical thread runs behind each day's cards — "a trail through your
// day," not just a flat list (UX plan, Memory Gallery).
function TimelineRow({ item, index, section }) {
  const isFirst = index === 0;
  const isLast = index === section.data.length - 1;
  const meta = TYPE_META[item.type] || TYPE_META[EVENT_TYPES.SCENE];
  return (
    <View style={styles.timelineRow}>
      <View style={styles.railCol}>
        {!isFirst && <View style={styles.railLineUp} />}
        {!isLast && <View style={styles.railLineDown} />}
        <View style={[styles.railDot, { backgroundColor: meta.color }]} />
      </View>
      <View style={{ flex: 1 }}>
        <EventCard event={item} />
      </View>
    </View>
  );
}

function MemoryMap({ events }) {
  if (events.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="map-outline" size={28} color={colors.textFaint} />
        <Text style={styles.emptyText}>Nothing to place on the map yet.</Text>
      </View>
    );
  }
  return (
    <View style={styles.mapCard}>
      <View style={styles.mapGrid}>
        {events.map((e) => {
          const meta = TYPE_META[e.type] || TYPE_META[EVENT_TYPES.SCENE];
          return (
            <Pressable
              key={e.id}
              onPress={() => router.push(`/memory/${e.id}`)}
              style={[styles.mapPin, { left: `${e.mapPos.x * 100}%`, top: `${e.mapPos.y * 100}%`, backgroundColor: meta.color }]}
              hitSlop={8}
            >
              <Ionicons name={e.type === EVENT_TYPES.PERSON ? "person" : e.type === EVENT_TYPES.AUDIO ? "mic" : e.icon} size={12} color={colors.white} />
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.mapHint}>Pinned by where they happened — an approximate layout, not a live map.</Text>
    </View>
  );
}

export default function EchoesScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState("timeline");

  const filtered = useMemo(() => {
    return memoryEvents.filter((e) => {
      if (e.hidden) return false;
      const matchesFilter = filter === "all" || e.type === filter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        (e.ocrText && e.ocrText.toLowerCase().includes(q)) ||
        (e.transcript && e.transcript.toLowerCase().includes(q)) ||
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

        <View style={styles.searchRow}>
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
          <View style={styles.viewToggle}>
            <Pressable onPress={() => setView("timeline")} style={[styles.viewToggleBtn, view === "timeline" && styles.viewToggleBtnActive]} hitSlop={6}>
              <Ionicons name="reorder-four-outline" size={17} color={view === "timeline" ? colors.white : colors.textSecondary} />
            </Pressable>
            <Pressable onPress={() => setView("map")} style={[styles.viewToggleBtn, view === "map" && styles.viewToggleBtnActive]} hitSlop={6}>
              <Ionicons name="map-outline" size={17} color={view === "map" ? colors.white : colors.textSecondary} />
            </Pressable>
          </View>
        </View>
      </View>

      {view === "timeline" ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={TimelineRow}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeaderWrap}>
              <Text style={styles.sectionHeader}>{section.title}</Text>
              <View style={styles.sectionLine} />
            </View>
          )}
          ListHeaderComponent={
            <View style={styles.filterRow}>
              {FILTERS.map((f) => {
                const active = filter === f.key;
                return (
                  <Pressable key={f.key} onPress={() => setFilter(f.key)} style={[styles.filterChip, active && styles.filterChipActive]}>
                    <Ionicons name={f.icon} size={13} color={active ? colors.white : colors.textSecondary} />
                    <Text style={[styles.filterChipText, active && { color: colors.white }]}>{f.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          }
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 140, paddingTop: spacing.sm }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="moon-outline" size={28} color={colors.textFaint} />
              <Text style={styles.emptyText}>Nothing matches yet. Try a different search or filter.</Text>
            </View>
          }
          stickySectionHeadersEnabled={false}
        />
      ) : (
        <View style={{ flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.sm }}>
          <MemoryMap events={filtered} />
        </View>
      )}
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
  statLabel: { color: colors.textFaint, fontSize: 13, marginTop: 2 },
  searchRow: { flexDirection: "row", gap: 8, marginBottom: spacing.sm },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: 15 },
  viewToggle: { flexDirection: "row", backgroundColor: colors.backgroundAlt, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.hairline, padding: 3, gap: 2 },
  viewToggleBtn: { width: 38, height: 38, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  viewToggleBtnActive: { backgroundColor: colors.teal },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: spacing.sm },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  filterChipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  filterChipText: { color: colors.textSecondary, fontSize: 13, fontWeight: "600" },
  sectionHeaderWrap: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10, marginTop: 6 },
  sectionHeader: { color: colors.textSecondary, fontSize: 13, fontWeight: "700" },
  sectionLine: { flex: 1, height: 1, backgroundColor: colors.hairline },
  timelineRow: { flexDirection: "row" },
  railCol: { width: 22, alignItems: "center" },
  railLineUp: { position: "absolute", top: 0, height: 24, width: 2, backgroundColor: colors.hairline },
  railLineDown: { position: "absolute", top: 24, bottom: 0, width: 2, backgroundColor: colors.hairline },
  railDot: { position: "absolute", top: 18, width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: colors.background },
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
  scanThumb: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.hairline, borderStyle: "dashed" },
  avatarInitials: { fontSize: 17, fontWeight: "700" },
  staticWave: { flexDirection: "row", alignItems: "center", gap: 2, height: 20 },
  staticWaveBar: { width: 2.5, borderRadius: 1.5 },
  sourcePip: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.backgroundAlt,
  },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  cardTitle: { color: colors.textPrimary, fontSize: 14.5, fontWeight: "700", flexShrink: 1 },
  cardTime: { color: colors.textFaint, fontSize: 13 },
  cardSummary: { color: colors.textSecondary, fontSize: 13, marginTop: 3, lineHeight: 18 },
  ocrPreview: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: colors.tealTint, alignSelf: "flex-start", borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8, marginTop: 6 },
  ocrPreviewText: { color: colors.tealDark, fontSize: 13, fontFamily: "monospace" },
  tagRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  locationText: { color: colors.textFaint, fontSize: 13 },
  empty: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyText: { color: colors.textFaint, fontSize: 13, textAlign: "center", paddingHorizontal: 40 },
  mapCard: { flex: 1, backgroundColor: colors.backgroundAlt, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.hairline, overflow: "hidden", marginBottom: spacing.lg },
  mapGrid: { flex: 1, position: "relative" },
  mapPin: { position: "absolute", width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.background, marginLeft: -13, marginTop: -13 },
  mapHint: { color: colors.textFaint, fontSize: 13, textAlign: "center", paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.hairline },
});
