import { forwardRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, type } from "../constants/theme";

// The branded export for "share a single memory as a clean image" (build
// brief T13). Rendered off-screen and captured with react-native-view-shot —
// see the "Share" action in app/memory/[id].js. collapsable={false} keeps
// Android from flattening this view out of the native tree before capture.
const MemoryShareCard = forwardRef(function MemoryShareCard({ event, meta }, ref) {
  const date = new Date(event.timestamp);

  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <View style={styles.brandRow}>
        <View style={styles.brandMark}>
          <Ionicons name="aperture" size={14} color={colors.white} />
        </View>
        <Text style={styles.brandText}>EYKON</Text>
      </View>

      <View style={[styles.iconWrap, { backgroundColor: meta.tint }]}>
        <Ionicons name={event.icon} size={26} color={meta.color} />
      </View>

      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.meta}>
        {date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })} · {event.location}
      </Text>

      <Text style={styles.summary}>{event.summary}</Text>

      {event.ocrText ? (
        <View style={styles.ocrPill}>
          <Ionicons name="scan-outline" size={13} color={colors.tealDark} />
          <Text style={styles.ocrText}>{event.ocrText}</Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.footerLine} />
        <Text style={styles.footerText}>What you saw, whenever you need it.</Text>
      </View>
    </View>
  );
});

export default MemoryShareCard;

const styles = StyleSheet.create({
  card: {
    width: 320,
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: spacing.lg },
  brandMark: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.teal, alignItems: "center", justifyContent: "center" },
  brandText: { color: colors.textPrimary, fontSize: 13, fontWeight: "800", letterSpacing: 2 },
  iconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: spacing.md },
  title: { color: colors.textPrimary, ...type.headline, marginBottom: 4 },
  meta: { color: colors.textFaint, fontSize: 12, marginBottom: spacing.md },
  summary: { color: colors.textSecondary, ...type.body, marginBottom: spacing.md },
  ocrPill: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.tealTint, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.md },
  ocrText: { color: colors.tealDark, fontFamily: "monospace", fontSize: 13.5, fontWeight: "600", flexShrink: 1 },
  footer: { marginTop: spacing.xs },
  footerLine: { height: 1, backgroundColor: colors.hairline, marginBottom: spacing.sm },
  footerText: { color: colors.textFaint, fontSize: 11, textAlign: "center" },
});
