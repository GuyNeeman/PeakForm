// src/app/(onboarding)/welcome.tsx – 01 Welcome
// Logo, image slider (auto + swipe), dots, text, button and link.

import { useEffect, useRef, useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTheme } from "@/constants/theme";
import { AppText } from "@/components/AppText";

// Replace with your own images later
const IMAGES = [
  { uri: "https://picsum.photos/id/1011/800/1200" },
  { uri: "https://picsum.photos/id/1025/800/1200" },
  { uri: "https://picsum.photos/id/1043/800/1200" },
];

const INTERVAL = 4000; // milliseconds until the next image

export default function Welcome() {
  const { colors, spacing, radius, touch } = useTheme();
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // Next image every few seconds (restarts after a swipe)
  useEffect(() => {
    if (!width) return;
    const timer = setTimeout(() => {
      const next = (index + 1) % IMAGES.length;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
      setIndex(next);
    }, INTERVAL);
    return () => clearTimeout(timer);
  }, [index, width]);

  return (
    <SafeAreaView style={{ flex: 1, padding: spacing.xl, gap: spacing.lg }}>

      {/* 1) LOGO – the size goes on the Image itself, not only on a wrapper */}
      <Image
        source={require("../../../assets/images/logo.png")}
        style={{ width: 64, height: 64, borderRadius: radius.md }}
        resizeMode="contain"
      />

      {/* 2) SLIDER – flex: 1 = takes all the space that's left, so nothing overlaps */}
      <View
        style={{ flex: 1, borderRadius: radius.lg, overflow: "hidden", backgroundColor: colors.card }}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        >
          {IMAGES.map((source, i) => (
            <Image key={i} source={source} style={{ width, height: "100%" }} resizeMode="cover" />
          ))}
        </ScrollView>
      </View>

      {/* 3) DOTS – the active one is wider and blue */}
      <View style={{ flexDirection: "row", justifyContent: "center", gap: spacing.sm }}>
        {IMAGES.map((_, i) => (
          <View
            key={i}
            style={{
              height: 8,
              width: i === index ? 22 : 8,
              borderRadius: radius.full,
              backgroundColor: i === index ? colors.primary : colors.border,
            }}
          />
        ))}
      </View>

      {/* 4) TEXT */}
      <View style={{ gap: spacing.sm }}>
        <AppText variant="title">Dein ganzer Tag. Eine App.</AppText>
        <AppText muted>Kalorien, Wasser, Workouts, Schlaf und Gewohnheiten an einem Ort.</AppText>
      </View>

      {/* 5) BUTTON + LINK – at the bottom, in the thumb zone */}
      <View style={{ gap: spacing.xs }}>
        <Pressable
          onPress={() => router.push("/basics")}
          style={({ pressed }) => ({
            height: touch.buttonHeight,
            borderRadius: radius.md,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <AppText variant="label" color={colors.onPrimary}>Los geht's</AppText>
        </Pressable>

        <Pressable
          onPress={() => { /* login comes later */ }}
          style={{ minHeight: touch.minSize, alignSelf: "center", justifyContent: "center" }}
        >
          <AppText variant="label" style={{ textDecorationLine: "underline" }}>
            Ich habe schon ein Konto
          </AppText>
        </Pressable>
      </View>

    </SafeAreaView>
  );
}