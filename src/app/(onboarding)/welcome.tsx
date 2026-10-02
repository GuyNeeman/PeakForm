// src/app/(onboarding)/welcome.tsx – 01 Welcome
// Logo, image slider (auto + swipe), dots, text, button and link.

import { useEffect, useRef, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, radius, spacing, touch } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { AppText } from "../../components/AppText";

const logo = require("../images/icon.png");

// Replace with your own images later
const IMAGES = [
  { uri: "https://picsum.photos/id/1011/800/1200" },
  { uri: "https://picsum.photos/id/1025/800/1200" },
  { uri: "https://picsum.photos/id/1043/800/1200" },
];

const INTERVAL = 4000; // milliseconds until the next image

export default function Welcome() {
  const { accountEmail, resetAll } = useApp();
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

  // TEMPORARY until the login sheet exists (step 4)
  const openLogin = () =>
    Alert.alert("Kommt bald", "Das Anmelden wird im nächsten Schritt gebaut.");

  // "Los geht's": only one account per phone → if there is one, log in or start over
  function start() {
    if (!accountEmail) {
      router.push("/basics");
      return;
    }
    Alert.alert(
      "Es gibt schon ein Konto",
      `Auf diesem Handy ist ${accountEmail} registriert.`,
      [
        { text: "Anmelden", onPress: openLogin },
        { text: "Neu starten", style: "destructive", onPress: confirmStartOver },
        { text: "Abbrechen", style: "cancel" },
      ],
    );
  }

  // Deletes the account AND all data – asks a second time
  function confirmStartOver() {
    Alert.alert(
      "Wirklich neu starten?",
      "Das Konto und alle Daten (Mahlzeiten, Habits, Workouts …) werden gelöscht.",
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Alles löschen",
          style: "destructive",
          onPress: async () => {
            await resetAll();
            router.push("/basics");
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={logo}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.slider} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        >
          {IMAGES.map((source, i) => (
            <Image key={i} source={source} style={[styles.slide, { width }]} resizeMode="cover" />
          ))}
        </ScrollView>
      </View>
      <View style={styles.dots}>
        {IMAGES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
      <View style={styles.textBlock}>
        <AppText variant="title">Dein ganzer Tag. Eine App.</AppText>
        <AppText muted>Kalorien, Wasser, Workouts, Schlaf und Gewohnheiten an einem Ort.</AppText>
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={start}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <AppText variant="label" color={colors.onPrimary}>{"Los geht's"}</AppText>
        </Pressable>

        <Pressable onPress={openLogin} style={styles.link}>
          <AppText variant="label" style={styles.linkText}>Ich habe schon ein Konto</AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ALL styles in one const
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
  },
  slider: {
    flex: 1,                    
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.card,
  },
  slide: {
    height: "100%",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 22,
    backgroundColor: colors.primary,
  },
  textBlock: {
    gap: spacing.sm,
  },
  actions: {
    gap: spacing.xs,
  },
  button: {
    height: touch.buttonHeight,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  link: {
    minHeight: touch.minSize,
    alignSelf: "center",
    justifyContent: "center",
  },
  linkText: {
    textDecorationLine: "underline",
  },
});