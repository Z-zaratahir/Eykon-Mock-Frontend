import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, AccessibilityInfo } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { colors, radius, spacing, type } from "../constants/theme";
import { voiceHistory, dailyDigest } from "../data/mockData";

function WaveBar({ active, index }) {
  const val = useRef(new Animated.Value(6)).current;
  useEffect(() => {
    if (active) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: 8 + Math.random() * 22, duration: 240 + (index % 5) * 35, useNativeDriver: false }),
          Animated.timing(val, { toValue: 6, duration: 240 + (index % 5) * 35, useNativeDriver: false }),
        ])
      ).start();
    } else {
      val.setValue(6);
    }
  }, [active]);
  return <Animated.View style={[styles.waveBar, { height: val }]} />;
}

function RecordCard({ onSaved, reduceMotion }) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [recording]);

  const toggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (recording) {
      setRecording(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSaved(true);
      onSaved(elapsed);
      setElapsed(0);
      setTimeout(() => setSaved(false), 1800);
    } else {
      setSaved(false);
      setRecording(true);
    }
  };

  return (
    <View style={styles.recordCard}>
      <View style={styles.recordTopRow}>
        <Pressable onPress={toggle} style={[styles.recordButton, recording && styles.recordButtonActive]} accessibilityLabel={recording ? "Stop recording" : "Record a voice note"}>
          <Ionicons name={recording ? "square" : "mic"} size={recording ? 16 : 20} color={colors.white} />
        </Pressable>
        <View style={styles.recordWave}>
          {Array.from({ length: 20 }).map((_, i) => (
            <WaveBar key={i} active={recording && !reduceMotion} index={i} />
          ))}
        </View>
        <Text style={styles.recordTime}>
          {String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}
        </Text>
      </View>
      <Text style={styles.recordHint}>{recording ? "Listening — tap to finish" : saved ? "Saved as a voice memory" : "Tap to record a voice note or send a spoken question"}</Text>
    </View>
  );
}

function DigestPlayer({ digest }) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setElapsed((e) => {
          if (e + 1 >= digest.durationSec) {
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
  }, [playing]);

  const progress = elapsed / digest.durationSec;
  const bars = [9, 16, 11, 20, 13, 18, 10, 15, 12, 19, 9, 14, 17, 8];

  return (
    <View style={styles.digestCard}>
      <View style={styles.digestTopRow}>
        <View style={styles.digestIconWrap}>
          <Ionicons name="sparkles" size={16} color={colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.digestTitle}>Today's audio digest</Text>
          <Text style={styles.digestSub}>~{digest.durationSec}s spoken recap</Text>
        </View>
        <Pressable onPress={() => setPlaying((p) => !p)} style={styles.digestPlayButton} accessibilityLabel={playing ? "Pause digest" : "Play digest"} hitSlop={8}>
          <Ionicons name={playing ? "pause" : "play"} size={16} color={colors.white} style={!playing && { marginLeft: 2 }} />
        </Pressable>
      </View>
      <View style={styles.digestBars}>
        {bars.map((h, i) => (
          <View key={i} style={[styles.digestBar, { height: h, backgroundColor: i / bars.length <= progress ? colors.teal : colors.hairline }]} />
        ))}
      </View>
      <Text style={styles.digestScript}>{digest.script}</Text>
    </View>
  );
}

function HistoryRow({ item }) {
  const [playing, setPlaying] = useState(false);
  const time = new Date(item.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  const play = () => {
    Haptics.selectionAsync();
    setPlaying(true);
    setTimeout(() => setPlaying(false), item.durationSec * 1000);
  };

  return (
    <View style={styles.historyRow}>
      <Pressable onPress={play} style={[styles.historyPlay, playing && { backgroundColor: colors.live }]} accessibilityLabel="Replay" hitSlop={8}>
        <Ionicons name={playing ? "volume-high" : "play"} size={14} color={colors.white} style={!playing && { marginLeft: 1 }} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={styles.historyQuery} numberOfLines={1}>
          {item.query}
        </Text>
        <Text style={styles.historyResponse} numberOfLines={2}>
          {item.response}
        </Text>
      </View>
      <Text style={styles.historyTime}>{time}</Text>
    </View>
  );
}

export default function VoiceScreen() {
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState(voiceHistory);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  const addRecording = (durationSec) => {
    setHistory((prev) => [
      { id: `v_${Date.now()}`, query: "Voice note", response: "Saved — Eykon will transcribe this shortly.", timestamp: new Date().toISOString(), durationSec: Math.max(durationSec, 1) },
      ...prev,
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: spacing.lg }}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>AUDIO</Text>
            <Text style={styles.title}>Voice & Sounds</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>Send a voice note, hear your daily recap, or replay anything you've asked out loud.</Text>
      </View>

      <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
        <RecordCard onSaved={addRecording} reduceMotion={reduceMotion} />
      </View>

      <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
        <DigestPlayer digest={dailyDigest} />
      </View>

      <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
        <Text style={styles.sectionLabel}>Past voice queries</Text>
        {history.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="mic-off-outline" size={26} color={colors.textFaint} />
            <Text style={styles.emptyText}>No voice queries yet — try asking something out loud.</Text>
          </View>
        ) : (
          history.map((item) => <HistoryRow key={item.id} item={item} />)
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.backgroundAlt, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.hairline },
  eyebrow: { color: colors.teal, ...type.label, textTransform: "uppercase" },
  title: { color: colors.textPrimary, ...type.display },
  subtitle: { color: colors.textSecondary, ...type.body, marginTop: 6, marginBottom: spacing.sm },
  recordCard: { backgroundColor: colors.backgroundAlt, borderRadius: radius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.hairline, gap: spacing.sm },
  recordTopRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  recordButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.teal, alignItems: "center", justifyContent: "center" },
  recordButtonActive: { backgroundColor: colors.live },
  recordWave: { flex: 1, flexDirection: "row", alignItems: "center", gap: 3, height: 28 },
  waveBar: { width: 3, borderRadius: 1.5, backgroundColor: colors.teal },
  recordTime: { color: colors.textFaint, fontSize: 13, fontFamily: "monospace", width: 40, textAlign: "right" },
  recordHint: { color: colors.textFaint, fontSize: 13 },
  digestCard: { backgroundColor: colors.tealTintFaint, borderRadius: radius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.hairline, gap: spacing.sm },
  digestTopRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  digestIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.teal, alignItems: "center", justifyContent: "center" },
  digestTitle: { color: colors.textPrimary, fontSize: 14.5, fontWeight: "700" },
  digestSub: { color: colors.textFaint, fontSize: 13, marginTop: 1 },
  digestPlayButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.teal, alignItems: "center", justifyContent: "center" },
  digestBars: { flexDirection: "row", alignItems: "center", gap: 3, height: 24 },
  digestBar: { width: 3, borderRadius: 1.5 },
  digestScript: { color: colors.textSecondary, ...type.body },
  sectionLabel: { color: colors.textFaint, ...type.label, textTransform: "uppercase", marginBottom: spacing.sm },
  historyRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.backgroundAlt, borderRadius: radius.lg, padding: spacing.sm, borderWidth: 1, borderColor: colors.hairline, marginBottom: 8 },
  historyPlay: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.teal, alignItems: "center", justifyContent: "center" },
  historyQuery: { color: colors.textPrimary, fontSize: 13.5, fontWeight: "700" },
  historyResponse: { color: colors.textSecondary, fontSize: 13, marginTop: 2, lineHeight: 17 },
  historyTime: { color: colors.textFaint, fontSize: 13 },
  empty: { alignItems: "center", paddingVertical: 30, gap: 8 },
  emptyText: { color: colors.textFaint, fontSize: 13, textAlign: "center", paddingHorizontal: 30 },
});
