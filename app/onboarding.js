import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, gradients, radius, spacing, type } from "../constants/theme";

const { width } = Dimensions.get("window");

export default function Onboarding() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.wrap, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.glowWrap}>
          <LinearGradient colors={gradients.heroTeal} style={styles.glow} />
          <View style={styles.logoCircle}>
            <Ionicons name="glasses" size={40} color={colors.teal} />
          </View>
        </View>

        <Text style={styles.wordmark}>EYKON</Text>
        <Text style={styles.tagline}>What you saw, whenever you need it.</Text>

        <View style={styles.exampleCard}>
          <View style={styles.exampleRow}>
            <Ionicons name="create-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.exampleText}>Someone writes a Wi-Fi password on a whiteboard.</Text>
          </View>
          <View style={styles.exampleDivider} />
          <View style={styles.exampleRow}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.exampleText}>Three months pass. You never wrote it down.</Text>
          </View>
          <View style={styles.exampleDivider} />
          <View style={styles.exampleRow}>
            <Ionicons name="sparkles" size={16} color={colors.teal} />
            <Text style={[styles.exampleText, { color: colors.teal, fontWeight: "600" }]}>
              "What was that password again?" — Eykon remembers.
            </Text>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <View style={styles.featureRow}>
          <Feature icon="wifi-outline" label="Offline-first" />
          <Feature icon="hardware-chip-outline" label="On-device" />
        </View>

        <Pressable style={styles.cta} onPress={() => router.replace("/(tabs)")}>
          <Text style={styles.ctaText}>Enter Eykon</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.background} />
        </Pressable>
      </View>
    </View>
  );
}

function Feature({ icon, label }) {
  return (
    <View style={styles.featureItem}>
      <Ionicons name={icon} size={16} color={colors.teal} />
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: spacing.lg, alignItems: "center" },
  glowWrap: { width: 140, height: 140, alignItems: "center", justifyContent: "center", marginBottom: spacing.lg },
  glow: { position: "absolute", width: 140, height: 140, borderRadius: 70 },
  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  wordmark: { color: colors.textPrimary, fontSize: 34, fontWeight: "800", letterSpacing: 6 },
  tagline: { color: colors.textSecondary, fontSize: 16, marginTop: 8, marginBottom: spacing.xl, textAlign: "center" },
  exampleCard: {
    width: "100%",
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  exampleRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  exampleText: { color: colors.textSecondary, fontSize: 16, flex: 1, lineHeight: 22 },
  exampleDivider: { height: 1, backgroundColor: colors.hairline, marginVertical: 10, marginLeft: 26 },
  featureRow: { flexDirection: "row", gap: 10, marginBottom: spacing.lg, width: "100%" },
  featureItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  featureLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: "600" },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.teal,
    borderRadius: radius.pill,
    paddingVertical: 16,
    width: "100%",
  },
  ctaText: { color: colors.background, fontWeight: "800", fontSize: 15.5 },
});
