import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { colors, radius, spacing, type } from "../../constants/theme";
import { Badge } from "../../components/ui";
import MemoryShareCard from "../../components/ShareCard";
import { memoryEvents, EVENT_TYPES, TYPE_META, toggleEventPinned, toggleEventHidden, deleteEvent } from "../../data/mockData";

function AudioPlayer({ event }) {
  const duration = event.audioDurationSec || 10;
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setElapsed((e) => {
          if (e + 1 >= duration) {
            clearInterval(timerRef.current);
            setPlaying(false);
            return 0;
          }
          return e + 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, duration]);

  const toggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlaying((p) => !p);
  };

  const progress = elapsed / duration;
  const bars = [10, 18, 8, 22, 14, 20, 9, 16, 12, 19, 8, 15];

  return (
    <View style={styles.audioCard}>
      <View style={styles.audioTopRow}>
        <Pressable onPress={toggle} style={styles.playButton} accessibilityLabel={playing ? "Pause" : "Play voice memo"}>
          <Ionicons name={playing ? "pause" : "play"} size={18} color={colors.white} style={!playing && { marginLeft: 2 }} />
        </Pressable>
        <View style={styles.audioBars}>
          {bars.map((h, i) => (
            <View
              key={i}
              style={[
                styles.audioBar,
                { height: h, backgroundColor: i / bars.length <= progress ? colors.teal : colors.hairline },
              ]}
            />
          ))}
        </View>
        <Text style={styles.audioTime}>
          {String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}
        </Text>
      </View>
      {event.transcript ? (
        <View style={styles.transcriptWrap}>
          <Text style={styles.transcriptLabel}>Transcript</Text>
          <Text style={styles.transcriptText}>{event.transcript}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function MemoryDetail() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [event, setEvent] = useState(() => memoryEvents.find((e) => e.id === id) || memoryEvents[0]);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const copyTimer = useRef(null);
  const shareCardRef = useRef(null);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  if (!event) {
    return (
      <View style={[styles.notFoundWrap, { paddingTop: insets.top + 40 }]}>
        <Ionicons name="file-tray-outline" size={32} color={colors.textFaint} />
        <Text style={styles.notFoundTitle}>Memory not found</Text>
        <Text style={styles.notFoundText}>This one may have been deleted.</Text>
        <Pressable style={styles.askButton} onPress={() => router.back()}>
          <Text style={styles.askButtonText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const meta = TYPE_META[event.type] || TYPE_META[EVENT_TYPES.SCENE];
  const date = new Date(event.timestamp);

  const copyOcr = async () => {
    await Clipboard.setStringAsync(event.ocrText);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    copyTimer.current = setTimeout(() => setCopied(false), 1600);
  };

  const askFollowUp = () => {
    router.push({ pathname: "/(tabs)", params: { memoryId: event.id } });
  };

  // Shareable memory card export (build brief T13) — renders the off-screen
  // branded card below, captures it as a PNG, and hands it to the native
  // share sheet. Great for a defense demo: a clean, screenshot-worthy export
  // of a single recalled memory.
  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const available = Platform.OS === "web" ? false : await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert("Sharing isn't available", "This device can't open the share sheet right now.");
        return;
      }
      const uri = await captureRef(shareCardRef, { format: "png", quality: 1 });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Share this memory" });
    } catch (err) {
      Alert.alert("Couldn't create the share image", "Please try again.");
    } finally {
      setSharing(false);
    }
  };

  const handlePin = () => {
    const updated = { ...toggleEventPinned(event.id) };
    setEvent(updated);
    Haptics.selectionAsync();
  };

  const handleHide = () => {
    const updated = { ...toggleEventHidden(event.id) };
    setEvent(updated);
    Haptics.selectionAsync();
  };

  const handleDelete = () => {
    Alert.alert("Delete this memory?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteEvent(event.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.hero, { paddingTop: insets.top + 10, backgroundColor: meta.tint }]}>
        <View style={styles.heroTopRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Pressable onPress={handleShare} style={styles.backButton} accessibilityLabel="Share this memory" disabled={sharing}>
            {sharing ? <Ionicons name="hourglass-outline" size={20} color={colors.textPrimary} /> : <Ionicons name="share-outline" size={20} color={colors.textPrimary} />}
          </Pressable>
        </View>
        <View style={styles.heroIconWrap}>
          <Ionicons name={event.icon} size={40} color={meta.color} />
        </View>
      </View>

      {/* Off-screen — captured by handleShare, never actually shown. */}
      <View style={styles.offscreen} pointerEvents="none">
        <MemoryShareCard ref={shareCardRef} event={event} meta={meta} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 60 }}>
        <View style={styles.badgeRow}>
          <Badge label={event.source === "glasses" ? "Captured via Glasses" : "Captured via Phone"} tone="accent" />
          <Badge label={`${Math.round(event.confidence * 100)}% confidence`} tone="success" />
          {event.hidden ? <Badge label="Hidden from search" tone="neutral" /> : null}
        </View>

        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.timestamp}>
          {date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} · {date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
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
              <Ionicons name="scan-outline" size={16} color={colors.teal} />
              <Text style={styles.ocrText}>{event.ocrText}</Text>
              <Pressable onPress={copyOcr} style={styles.copyButton} accessibilityLabel="Copy extracted text" hitSlop={8}>
                <Ionicons name={copied ? "checkmark" : "copy-outline"} size={16} color={colors.tealDark} />
              </Pressable>
            </View>
            {copied ? <Text style={styles.copiedText}>Copied to clipboard</Text> : null}
          </>
        ) : null}

        {event.type === EVENT_TYPES.AUDIO ? (
          <>
            <Text style={styles.sectionLabel}>Voice memo</Text>
            <AudioPlayer event={event} />
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

        <View style={styles.privacyRow}>
          <Pressable style={styles.privacyAction} onPress={handlePin}>
            <Ionicons name={event.pinned ? "bookmark" : "bookmark-outline"} size={18} color={event.pinned ? colors.teal : colors.textSecondary} />
            <Text style={[styles.privacyActionText, event.pinned && { color: colors.teal }]}>{event.pinned ? "Pinned" : "Pin"}</Text>
          </Pressable>
          <Pressable style={styles.privacyAction} onPress={handleHide}>
            <Ionicons name={event.hidden ? "eye-off" : "eye-off-outline"} size={18} color={event.hidden ? colors.teal : colors.textSecondary} />
            <Text style={[styles.privacyActionText, event.hidden && { color: colors.teal }]}>{event.hidden ? "Hidden" : "Hide"}</Text>
          </Pressable>
          <Pressable style={styles.privacyAction} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={18} color={colors.live} />
            <Text style={[styles.privacyActionText, { color: colors.live }]}>Delete</Text>
          </Pressable>
        </View>

        <Pressable style={styles.askButton} onPress={askFollowUp}>
          <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.white} />
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
  heroTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  offscreen: { position: "absolute", top: 0, left: -2000 },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(20,20,20,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroIconWrap: {
    alignSelf: "center",
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: -10,
  },
  notFoundWrap: { flex: 1, alignItems: "center", paddingHorizontal: spacing.xl, gap: 8, backgroundColor: colors.background },
  notFoundTitle: { color: colors.textPrimary, ...type.headline, marginTop: 8 },
  notFoundText: { color: colors.textSecondary, ...type.body },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: spacing.md },
  title: { color: colors.textPrimary, ...type.title, marginBottom: 4 },
  timestamp: { color: colors.textSecondary, fontSize: 13, marginBottom: 10 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: spacing.lg },
  metaText: { color: colors.textSecondary, fontSize: 13.5 },
  sectionLabel: { color: colors.textFaint, ...type.label, textTransform: "uppercase", marginBottom: 8, marginTop: spacing.md },
  card: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  summaryText: { color: colors.textPrimary, ...type.body },
  ocrCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.tealTint, borderColor: "transparent" },
  ocrText: { color: colors.tealDark, fontFamily: "monospace", fontSize: 15, fontWeight: "600", flex: 1 },
  copyButton: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  copiedText: { color: colors.success, fontSize: 12, fontWeight: "600", marginTop: 6, textAlign: "right" },
  audioCard: { backgroundColor: colors.backgroundAlt, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.hairline, gap: spacing.md },
  audioTopRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  playButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.teal, alignItems: "center", justifyContent: "center" },
  audioBars: { flex: 1, flexDirection: "row", alignItems: "center", gap: 3, height: 24 },
  audioBar: { width: 3, borderRadius: 1.5 },
  audioTime: { color: colors.textFaint, fontSize: 11.5, fontFamily: "monospace", width: 38, textAlign: "right" },
  transcriptWrap: { borderTopWidth: 1, borderTopColor: colors.hairline, paddingTop: spacing.sm },
  transcriptLabel: { color: colors.textFaint, fontSize: 10.5, fontWeight: "700", textTransform: "uppercase", marginBottom: 4 },
  transcriptText: { color: colors.textPrimary, ...type.body },
  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  rowLabel: { color: colors.textSecondary, fontSize: 12.5 },
  rowValue: { color: colors.textPrimary, fontSize: 12.5, flexShrink: 1, textAlign: "right" },
  privacyRow: { flexDirection: "row", gap: 8, marginTop: spacing.lg },
  privacyAction: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 12,
    minHeight: 44,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  privacyActionText: { color: colors.textSecondary, fontSize: 11.5, fontWeight: "600" },
  askButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.teal,
    borderRadius: radius.pill,
    paddingVertical: 14,
    marginTop: spacing.xl,
    minHeight: 44,
  },
  askButtonText: { color: colors.white, fontWeight: "700", fontSize: 14.5 },
});
