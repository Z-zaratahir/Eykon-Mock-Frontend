import { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, AccessibilityInfo } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  withDelay,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { colors } from "../constants/theme";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// "First focus" splash (UX plan, Section 4): a focus-reticle mimics a real
// camera autofocus — off-center, hunts and locks with a spring overshoot,
// jumps (not glides) to center in one saccade, reveals the wordmark in the
// same beat it lands, then releases and fades. One motif, two motions, zero
// decoration — ~1.3-1.6s total.
const OFFSET_X = -SCREEN_W * 0.16;
const OFFSET_Y = -SCREEN_H * 0.1;
const BOX_W = 190;
const BOX_H = 76;

function ReticleCorner({ corner, outset }) {
  const style = useAnimatedStyle(() => {
    const sign = { x: corner.includes("Right") ? 1 : -1, y: corner.includes("bottom") ? 1 : -1 };
    return {
      transform: [
        { translateX: sign.x * outset.value },
        { translateY: sign.y * outset.value },
        { rotate: `${{ topLeft: 0, topRight: 90, bottomRight: 180, bottomLeft: 270 }[corner]}deg` },
      ],
    };
  });
  const pos =
    corner === "topLeft"
      ? { top: 0, left: 0 }
      : corner === "topRight"
      ? { top: 0, right: 0 }
      : corner === "bottomRight"
      ? { bottom: 0, right: 0 }
      : { bottom: 0, left: 0 };

  return (
    <Animated.View style={[styles.corner, pos, style]}>
      <Svg width={20} height={20}>
        <Path d="M2 16 L2 2 L16 2" stroke={colors.teal} strokeWidth={3} strokeLinecap="round" fill="none" />
      </Svg>
    </Animated.View>
  );
}

function AnimatedSplash({ onDone }) {
  const outset = useSharedValue(24);
  const bracketOpacity = useSharedValue(0.5);
  const groupX = useSharedValue(OFFSET_X);
  const groupY = useSharedValue(OFFSET_Y);
  const streakOpacity = useSharedValue(0);
  const wordmarkOpacity = useSharedValue(0.12);

  useEffect(() => {
    // Each shared value gets exactly ONE .value assignment: reassigning a
    // shared value a second time in the same tick cancels the first
    // animation before it ever runs, so every phase (hunt-lock, hold,
    // release) has to live inside one chained sequence per value.

    // outset: hunt-and-lock (quick overshoot + spring settle, the "hunting"
    // micro-stutter of a real autofocus), a hold while centered, then release.
    // ~1.3s total: 180 (initial hold) + 320 (hunt) + 320 (locked hold) + 480
    // (release) — inside the 1.3-1.6s window the UX plan calls for.
    outset.value = withDelay(
      180,
      withSequence(
        withTiming(-6, { duration: 160, easing: Easing.out(Easing.quad) }),
        withSpring(0, { damping: 5, stiffness: 260 }),
        withDelay(280, withTiming(38, { duration: 480, easing: Easing.in(Easing.cubic) }))
      )
    );
    bracketOpacity.value = withDelay(
      180,
      withSequence(
        withTiming(0.9, { duration: 320 }),
        withDelay(
          320,
          withTiming(0, { duration: 480 }, (finished) => {
            if (finished) runOnJS(onDone)();
          })
        )
      )
    );

    // The saccade: a fast jump to center, not a glide — timed to land right
    // as the hunt-and-lock phase (180 + 320 = 500ms) finishes.
    groupX.value = withDelay(500, withTiming(0, { duration: 90, easing: Easing.out(Easing.quad) }));
    groupY.value = withDelay(500, withTiming(0, { duration: 90, easing: Easing.out(Easing.quad) }));
    streakOpacity.value = withDelay(500, withSequence(withTiming(0.35, { duration: 60 }), withTiming(0, { duration: 200 })));

    // Focusing and revealing happen together, in the same beat the jump lands.
    wordmarkOpacity.value = withDelay(510, withTiming(1, { duration: 90 }));
  }, []);

  const groupStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: groupX.value }, { translateY: groupY.value }],
  }));
  const bracketsStyle = useAnimatedStyle(() => ({ opacity: bracketOpacity.value }));
  const streakStyle = useAnimatedStyle(() => ({ opacity: streakOpacity.value }));
  const wordmarkStyle = useAnimatedStyle(() => ({ opacity: wordmarkOpacity.value }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.streak, streakStyle]} />
      <Animated.Text style={[styles.wordmark, wordmarkStyle]}>Eykon</Animated.Text>
      <Animated.View style={[styles.reticleGroup, groupStyle]} pointerEvents="none">
        <Animated.View style={[styles.reticleBox, bracketsStyle]}>
          {["topLeft", "topRight", "bottomRight", "bottomLeft"].map((c) => (
            <ReticleCorner key={c} corner={c} outset={outset} />
          ))}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

function ReducedMotionSplash({ onDone }) {
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 220 }, (finished) => {
      if (finished) runOnJS(onDone)();
    });
    const t = setTimeout(onDone, 500);
    return () => clearTimeout(t);
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.wordmark, style]}>Eykon</Animated.Text>
    </View>
  );
}

export default function Splash({ onDone }) {
  const [reduceMotion, setReduceMotion] = useState(null);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  if (reduceMotion === null) return <View style={styles.container} />;
  return reduceMotion ? <ReducedMotionSplash onDone={onDone} /> : <AnimatedSplash onDone={onDone} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  wordmark: { color: colors.textPrimary, fontSize: 34, fontWeight: "800", letterSpacing: 6 },
  streak: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: BOX_W,
    height: BOX_H,
    marginLeft: -BOX_W / 2 + OFFSET_X,
    marginTop: -BOX_H / 2 + OFFSET_Y,
    borderRadius: 18,
    backgroundColor: colors.tealTint,
  },
  reticleGroup: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -BOX_W / 2,
    marginTop: -BOX_H / 2,
  },
  reticleBox: { width: BOX_W, height: BOX_H },
  corner: { position: "absolute", width: 20, height: 20 },
});
