import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, spacing, type, shadow } from "../constants/theme";

export function ScreenHeader({ eyebrow, title, right }) {
  return (
    <View style={styles.headerRow}>
      <View style={{ flex: 1 }}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      {right ? <View>{right}</View> : null}
    </View>
  );
}

export function GlassCard({ children, style }) {
  return (
    <LinearGradient colors={["#20294A", "#161E3A"]} style={[styles.card, shadow.card, style]}>
      {children}
    </LinearGradient>
  );
}

export function Badge({ label, tone = "neutral", small }) {
  const palette = {
    neutral: { bg: colors.surfaceAlt, fg: colors.textMuted },
    accent: { bg: colors.accentSoft, fg: colors.accent },
    success: { bg: colors.successSoft, fg: colors.success },
    semantic: { bg: "#1E2A4A", fg: colors.matchSemantic },
    bm25: { bg: "#2A1E3A", fg: colors.matchBM25 },
    exact: { bg: colors.successSoft, fg: colors.matchExact },
  }[tone] || { bg: colors.surfaceAlt, fg: colors.textMuted };

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: palette.bg, paddingVertical: small ? 3 : 5, paddingHorizontal: small ? 8 : 10 },
      ]}
    >
      <Text style={[styles.badgeText, { color: palette.fg, fontSize: small ? 10.5 : 11.5 }]}>{label}</Text>
    </View>
  );
}

export function SectionLabel({ children, style }) {
  return <Text style={[styles.sectionLabel, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  eyebrow: {
    color: colors.accent,
    ...type.label,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  headerTitle: {
    color: colors.text,
    ...type.display,
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  badge: {
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontWeight: "700",
  },
  sectionLabel: {
    color: colors.textFaintSolid,
    ...type.label,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
});
