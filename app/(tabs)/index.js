import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { colors, radius, spacing, type } from "../../constants/theme";
import { Badge } from "../../components/ui";
import { chatMessages as initialMessages, suggestedPrompts, memoryEvents } from "../../data/mockData";

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function findEvent(id) {
  return memoryEvents.find((e) => e.id === id);
}

function RetrievalTrace({ retrieval }) {
  if (!retrieval) return null;
  return (
    <View style={styles.trace}>
      <View style={styles.traceRow}>
        <Ionicons name="flash-outline" size={12} color={colors.textFaintSolid} />
        <Text style={styles.traceText}>{retrieval.latencyMs}ms retrieval</Text>
        {retrieval.hitAt1 ? <Badge label="Hit@1" tone="exact" small /> : null}
      </View>
      {retrieval.sources.map((s) => (
        <Pressable
          key={s.eventId}
          onPress={() => router.push(`/memory/${s.eventId}`)}
          style={styles.sourceChip}
        >
          <Ionicons name="albums-outline" size={13} color={colors.accent} />
          <Text style={styles.sourceChipText} numberOfLines={1}>
            {s.title}
          </Text>
          <Badge label={s.match.label} tone={s.match.key === "exact" ? "exact" : s.match.key === "bm25" ? "bm25" : "semantic"} small />
        </Pressable>
      ))}
    </View>
  );
}

function Bubble({ item }) {
  const isUser = item.role === "user";
  return (
    <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
      {!isUser && (
        <LinearGradient colors={[colors.accent, colors.accentDeep]} style={styles.avatar}>
          <Ionicons name="sparkles" size={14} color={colors.bg} />
        </LinearGradient>
      )}
      <View style={{ maxWidth: "80%" }}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
          <Text style={[styles.bubbleText, isUser && { color: colors.bg }]}>{item.text}</Text>
        </View>
        {!isUser && <RetrievalTrace retrieval={item.retrieval} />}
        <Text style={[styles.timeText, isUser && { textAlign: "right" }]}>{formatTime(item.timestamp)}</Text>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const listRef = useRef(null);
  const pulse = useRef(new Animated.Value(1)).current;

  const scrollToEnd = () => setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);

  const startListening = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setListening(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.35, duration: 550, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 550, useNativeDriver: true }),
      ])
    ).start();
    setTimeout(() => {
      setListening(false);
      pulse.stopAnimation();
      pulse.setValue(1);
      send("Where did I leave my keys?");
    }, 1600);
  }, [pulse]);

  const send = (text) => {
    const value = (text ?? input).trim();
    if (!value) return;
    const userMsg = { id: `u_${Date.now()}`, role: "user", text: value, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    scrollToEnd();
    setThinking(true);
    Haptics.selectionAsync();

    setTimeout(() => {
      const reply = generateReply(value);
      setMessages((prev) => [...prev, reply]);
      setThinking(false);
      scrollToEnd();
    }, 1100);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <View>
          <Text style={styles.topEyebrow}>EYKON</Text>
          <View style={styles.statusRow}>
            <View style={styles.liveDot} />
            <Text style={styles.statusText}>Glasses connected · watching quietly</Text>
          </View>
        </View>
        <Pressable style={styles.iconButton} onPress={() => router.push("/(tabs)/glasses")}>
          <Ionicons name="glasses-outline" size={20} color={colors.text} />
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Bubble item={item} />}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}
        onContentSizeChange={scrollToEnd}
        ListFooterComponent={
          thinking ? (
            <View style={styles.bubbleRow}>
              <LinearGradient colors={[colors.accent, colors.accentDeep]} style={styles.avatar}>
                <Ionicons name="sparkles" size={14} color={colors.bg} />
              </LinearGradient>
              <View style={[styles.bubble, styles.bubbleAssistant, styles.thinkingBubble]}>
                <ThinkingDots />
              </View>
            </View>
          ) : null
        }
      />

      {messages.length <= 5 && (
        <View style={styles.promptRow}>
          {suggestedPrompts.slice(0, 3).map((p) => (
            <Pressable key={p} style={styles.promptChip} onPress={() => send(p)}>
              <Text style={styles.promptChipText} numberOfLines={1}>
                {p}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <View style={styles.inputPill}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about anything you've seen…"
            placeholderTextColor={colors.textFaintSolid}
            style={styles.textInput}
            onSubmitEditing={() => send()}
            returnKeyType="send"
          />
          {input.length > 0 && (
            <Pressable onPress={() => send()} style={styles.sendButton}>
              <Ionicons name="arrow-up" size={18} color={colors.bg} />
            </Pressable>
          )}
        </View>
        {input.length === 0 && (
          <Pressable onPress={startListening} style={styles.micButtonWrap}>
            <Animated.View
              style={[
                styles.micButton,
                listening && { backgroundColor: colors.danger, transform: [{ scale: pulse }] },
              ]}
            >
              <Ionicons name={listening ? "mic" : "mic-outline"} size={20} color={listening ? colors.white : colors.bg} />
            </Animated.View>
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function ThinkingDots() {
  const dots = [useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current];
  useState(() => {
    dots.forEach((d, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(d, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ])
      ).start();
    });
  });
  return (
    <View style={{ flexDirection: "row", gap: 5 }}>
      {dots.map((d, i) => (
        <Animated.View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent, opacity: d }} />
      ))}
    </View>
  );
}

function generateReply(query) {
  const q = query.toLowerCase();
  let match = memoryEvents[0];
  if (q.includes("key")) match = findEvent("ev_0139");
  else if (q.includes("jacket") || q.includes("price")) match = findEvent("ev_0119");
  else if (q.includes("career") || q.includes("recruiter") || q.includes("met")) match = findEvent("ev_0127");
  else if (q.includes("entropy") || q.includes("professor") || q.includes("lecture")) match = findEvent("ev_0136");
  else if (q.includes("fuse")) match = findEvent("ev_0104");
  else if (q.includes("password") || q.includes("wifi") || q.includes("whiteboard")) match = findEvent("ev_0142");
  else if (q.includes("receipt") || q.includes("order")) match = findEvent("ev_0131");

  const text = match ? `${match.summary}${match.ocrText ? ` (${match.ocrText})` : ""} — ${match.location}, ${new Date(match.timestamp).toLocaleDateString()}.` : "I don't have a memory that matches that yet.";

  return {
    id: `a_${Date.now()}`,
    role: "assistant",
    text,
    timestamp: new Date().toISOString(),
    retrieval: match
      ? {
          hitAt1: true,
          latencyMs: 38 + Math.floor(Math.random() * 20),
          sources: [{ eventId: match.id, title: match.title, match: { key: "semantic", label: "Semantic" } }],
        }
      : null,
  };
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  topEyebrow: { color: colors.accent, ...type.label, letterSpacing: 2 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  statusText: { color: colors.textMuted, fontSize: 12.5 },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleRow: { flexDirection: "row", marginBottom: spacing.md, gap: 8, alignItems: "flex-end" },
  bubbleRowUser: { flexDirection: "row-reverse" },
  avatar: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  bubble: { borderRadius: radius.lg, paddingVertical: 10, paddingHorizontal: 14 },
  bubbleAssistant: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleUser: {
    backgroundColor: colors.accent,
    borderBottomRightRadius: 6,
  },
  bubbleText: { color: colors.text, ...type.body },
  thinkingBubble: { paddingVertical: 14 },
  timeText: { color: colors.textFaintSolid, fontSize: 10.5, marginTop: 4, marginLeft: 4 },
  trace: { marginTop: 6, gap: 6 },
  traceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  traceText: { color: colors.textFaintSolid, fontSize: 11 },
  sourceChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: "flex-start",
    maxWidth: 260,
  },
  sourceChipText: { color: colors.textMuted, fontSize: 12, flexShrink: 1 },
  promptRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  promptChip: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  promptChipText: { color: colors.textMuted, fontSize: 12.5 },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  inputPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: 16,
    paddingRight: 6,
    height: 48,
  },
  textInput: { flex: 1, color: colors.text, fontSize: 15 },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  micButtonWrap: {},
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
});
