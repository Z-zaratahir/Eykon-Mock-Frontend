import { View, Text, StyleSheet } from "react-native";
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

// Elevated card for light backgrounds: a hairline border + a soft, low-opacity
// shadow stand in for the shadow-heavy card the old dark theme used (UX plan 3.4).
export function GlassCard({ children, style }) {
  return <View style={[styles.card, shadow.card, style]}>{children}</View>;
}

export function Badge({ label, tone = "neutral", small }) {
  const palette = {
    neutral: { bg: colors.backgroundAlt, fg: colors.textSecondary },
    accent: { bg: colors.tealTint, fg: colors.tealDark },
    success: { bg: colors.successTint, fg: colors.success },
    semantic: { bg: colors.tealTintFaint, fg: colors.matchSemantic },
    keyword: { bg: colors.backgroundAlt, fg: colors.matchKeyword },
    exact: { bg: colors.successTint, fg: colors.matchExact },
  }[tone] || { bg: colors.backgroundAlt, fg: colors.textSecondary };

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
    color: colors.teal,
    ...type.label,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  headerTitle: {
    color: colors.textPrimary,
    ...type.display,
  },
  card: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  badge: {
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontWeight: "700",
  },
  sectionLabel: {
    color: colors.textFaint,
    ...type.label,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
});
