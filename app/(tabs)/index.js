import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Animated,
  AccessibilityInfo,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { colors, radius, spacing, type } from "../../constants/theme";
import { Badge } from "../../components/ui";
import { TAB_BAR_CLEARANCE } from "../../components/TabBar";
import { chatMessages as initialMessages, suggestedPrompts, memoryEvents, glassesDevice } from "../../data/mockData";

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function findEvent(id) {
  return memoryEvents.find((e) => e.id === id);
}

function matchTone(key) {
  if (key === "exact") return "exact";
  if (key === "bm25") return "keyword";
  return "semantic";
}

// Kept and extended, not removed (see build brief — this is a defensible,
// demoable feature for the defense). But the UX plan is explicit that terms
// like "Hit@1"/raw latency are "great for defense slides, wrong for the
// actual UI" and belong behind an expandable detail, not the default text —
// the collapsed row now reads in plain language; the jargon only shows up
// once someone deliberately taps "Details".
function RetrievalTrace({ retrieval }) {
  const [open, setOpen] = useState(false);
  if (!retrieval) return null;
  return (
    <View style={styles.trace}>
      <Pressable onPress={() => setOpen((o) => !o)} style={styles.traceRow} hitSlop={6}>
        <Ionicons name={retrieval.hitAt1 ? "checkmark-circle" : "search-outline"} size={13} color={colors.success} />
        <Text style={styles.traceText}>{retrieval.hitAt1 ? "Found it" : "Possible match"}</Text>
        <Text style={styles.traceLink}>{open ? "Hide details" : "Details"}</Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={12} color={colors.tealDark} />
      </Pressable>
      {open && (
        <View style={styles.traceDetail}>
          <View style={styles.traceDetailRow}>
            <Ionicons name="flash-outline" size={12} color={colors.textFaint} />
            <Text style={styles.traceDetailText}>{retrieval.latencyMs}ms retrieval</Text>
            {retrieval.hitAt1 ? <Badge label="Hit@1" tone="exact" small /> : null}
          </View>
          {retrieval.sources.map((s) => (
            <Pressable key={s.eventId} onPress={() => router.push(`/memory/${s.eventId}`)} style={styles.sourceChip}>
              <Ionicons name="albums-outline" size={13} color={colors.teal} />
              <Text style={styles.sourceChipText} numberOfLines={1}>
                {s.title}
              </Text>
              <Badge label={s.match.label} tone={matchTone(s.match.key)} small />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function Bubble({ item }) {
  const isUser = item.role === "user";
  return (
    <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Ionicons name="sparkles" size={14} color={colors.white} />
        </View>
      )}
      <View style={{ maxWidth: "80%" }}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
          <Text style={[styles.bubbleText, isUser && { color: colors.white }]}>{item.text}</Text>
        </View>
        {!isUser && <RetrievalTrace retrieval={item.retrieval} />}
        <Text style={[styles.timeText, isUser && { textAlign: "right" }]}>{formatTime(item.timestamp)}</Text>
      </View>
    </View>
  );
}

// The big-bold animated-typing treatment (Ada reference) — reserved for the
// FIRST assistant message of a session only. A returning user asking their
// 10th question of the day shouldn't wait for letters to type out, so every
// later reply is a normal-weight bubble (see Bubble above). This is a
// deliberate efficiency-for-frequent-users trade-off, not an oversight.
function SessionGreeting({ text, reduceMotion }) {
  const [count, setCount] = useState(reduceMotion ? text.length : 0);

  useEffect(() => {
    if (reduceMotion) {
      setCount(text.length);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setCount(Math.min(i, text.length));
      if (i >= text.length) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [text, reduceMotion]);

  return (
    <View style={styles.greetingWrap}>
      <Text style={styles.greetingText}>{text.slice(0, count)}</Text>
    </View>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const hasGreeting = initialMessages[0]?.role === "assistant";
  const greeting = hasGreeting ? initialMessages[0] : null;
  const [messages, setMessages] = useState(hasGreeting ? initialMessages.slice(1) : initialMessages);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const listRef = useRef(null);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => sub.remove();
  }, []);

  // The floating tab bar (components/TabBar.js) only needs clearance while
  // it's actually visible — once the keyboard is up it covers that screen
  // region anyway, so padding for it here would just leave a dead gap above
  // the keyboard.
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  useEffect(() => {
    const showEvt = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvt, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvt, () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const scrollToEnd = () => setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);

  const startListening = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setListening(true);
    if (!reduceMotion) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.35, duration: 550, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 550, useNativeDriver: true }),
        ])
      ).start();
    }
    setTimeout(() => {
      setListening(false);
      pulse.stopAnimation();
      pulse.setValue(1);
      send("Where did I leave my keys?");
    }, 1600);
  }, [pulse, reduceMotion]);

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

  // "Ask a follow-up" from Memory Detail deep-links here with the memory
  // pre-loaded as context (build brief T10) — a real multi-turn demo moment:
  // the memory is referenced directly rather than re-discovered by keyword.
  const params = useLocalSearchParams();
  const handledMemoryRef = useRef(null);
  useEffect(() => {
    if (!params.memoryId || params.memoryId === handledMemoryRef.current) return;
    handledMemoryRef.current = params.memoryId;
    const event = findEvent(params.memoryId);
    if (!event) return;

    const userMsg = { id: `u_${Date.now()}`, role: "user", text: `Tell me more about "${event.title}".`, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    scrollToEnd();
    setThinking(true);
    Haptics.selectionAsync();

    setTimeout(() => {
      const text = `${event.summary}${event.ocrText ? ` (${event.ocrText})` : ""} — ${event.location}, ${new Date(event.timestamp).toLocaleDateString()}.`;
      const reply = {
        id: `a_${Date.now()}`,
        role: "assistant",
        text,
        timestamp: new Date().toISOString(),
        retrieval: { hitAt1: true, latencyMs: 41, sources: [{ eventId: event.id, title: event.title, match: { key: "exact", label: "Exact" } }] },
      };
      setMessages((prev) => [...prev, reply]);
      setThinking(false);
      scrollToEnd();
    }, 900);
  }, [params.memoryId]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <View>
          <Text style={styles.topEyebrow}>EYKON</Text>
          <View style={styles.statusRow}>
            <View style={[styles.liveDot, { backgroundColor: glassesDevice.connected ? colors.success : colors.live }]} />
            <Text style={styles.statusText}>
              {glassesDevice.connected ? "Glasses connected · watching quietly" : "Glasses disconnected · using phone"}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable style={styles.iconButton} onPress={() => router.push("/live-lens")} accessibilityLabel="Open Live Lens">
            <Ionicons name="eye-outline" size={20} color={colors.textPrimary} />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={() => router.push("/(tabs)/glasses")} accessibilityLabel="Open Glasses hub">
            <Ionicons name="glasses-outline" size={20} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Bubble item={item} />}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}
        onContentSizeChange={scrollToEnd}
        ListHeaderComponent={greeting ? <SessionGreeting text={greeting.text} reduceMotion={reduceMotion} /> : null}
        ListFooterComponent={
          thinking ? (
            <View style={styles.bubbleRow}>
              <View style={styles.avatar}>
                <Ionicons name="sparkles" size={14} color={colors.white} />
              </View>
              <View style={[styles.bubble, styles.bubbleAssistant, styles.thinkingBubble]}>
                <ThinkingDots reduceMotion={reduceMotion} />
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

      <View style={[styles.inputBar, { paddingBottom: keyboardVisible ? Math.max(insets.bottom, 14) : insets.bottom + TAB_BAR_CLEARANCE }]}>
        <Pressable
          onPress={() => router.push({ pathname: "/capture", params: { mode: "photo" } })}
          style={styles.cameraButton}
          accessibilityLabel="Ask about a photo"
        >
          <Ionicons name="camera-outline" size={20} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.inputPill}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about anything you've seen…"
            placeholderTextColor={colors.textFaint}
            style={styles.textInput}
            onSubmitEditing={() => send()}
            returnKeyType="send"
          />
          {input.length > 0 && (
            <Pressable onPress={() => send()} style={styles.sendButton} hitSlop={6} accessibilityLabel="Send">
              <Ionicons name="arrow-up" size={18} color={colors.white} />
            </Pressable>
          )}
        </View>
        {input.length === 0 && (
          <Pressable onPress={startListening} style={styles.micButtonWrap} accessibilityLabel="Ask by voice">
            <Animated.View
              style={[styles.micButton, listening && { backgroundColor: colors.live, ...(reduceMotion ? {} : { transform: [{ scale: pulse }] }) }]}
            >
              <Ionicons name={listening ? "mic" : "mic-outline"} size={20} color={colors.white} />
            </Animated.View>
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function ThinkingDots({ reduceMotion }) {
  const dots = useMemo(
    () => [new Animated.Value(0.3), new Animated.Value(0.3), new Animated.Value(0.3)],
    []
  );
  useEffect(() => {
    if (reduceMotion) return;
    const loops = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(d, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [reduceMotion]);
  return (
    <View style={{ flexDirection: "row", gap: 5 }}>
      {dots.map((d, i) => (
        <Animated.View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.teal, opacity: reduceMotion ? 0.7 : d }} />
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
  else if (q.includes("park")) match = findEvent("ev_0122");
  else if (q.includes("grocery") || q.includes("milk")) match = findEvent("ev_0133");

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
  topEyebrow: { color: colors.teal, ...type.label, letterSpacing: 2 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { color: colors.textSecondary, fontSize: 13 },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  greetingWrap: { paddingHorizontal: spacing.sm, paddingBottom: spacing.lg },
  greetingText: { color: colors.textPrimary, ...type.display, lineHeight: 38 },
  bubbleRow: { flexDirection: "row", marginBottom: spacing.md, gap: 8, alignItems: "flex-end" },
  bubbleRowUser: { flexDirection: "row-reverse" },
  avatar: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: colors.teal },
  bubble: { borderRadius: radius.lg, paddingVertical: 10, paddingHorizontal: 14 },
  bubbleAssistant: {
    backgroundColor: colors.backgroundAlt,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  bubbleUser: {
    backgroundColor: colors.teal,
    borderBottomRightRadius: 6,
  },
  bubbleText: { color: colors.textPrimary, ...type.body },
  thinkingBubble: { paddingVertical: 14 },
  timeText: { color: colors.textFaint, fontSize: 13, marginTop: 4, marginLeft: 4 },
  trace: { marginTop: 6, gap: 6 },
  traceRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 2 },
  traceText: { color: colors.textSecondary, fontSize: 13, fontWeight: "600" },
  traceLink: { color: colors.tealDark, fontSize: 13, fontWeight: "700" },
  traceDetail: { gap: 6, marginTop: 2 },
  traceDetailRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  traceDetailText: { color: colors.textFaint, fontSize: 13 },
  sourceChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.md,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignSelf: "flex-start",
    maxWidth: 260,
  },
  sourceChipText: { color: colors.textSecondary, fontSize: 13, flexShrink: 1 },
  promptRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  promptChip: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  promptChipText: { color: colors.textSecondary, fontSize: 13 },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  cameraButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  inputPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingLeft: 16,
    paddingRight: 6,
    height: 48,
  },
  textInput: { flex: 1, color: colors.textPrimary, fontSize: 16 },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  micButtonWrap: {},
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
  },
});
