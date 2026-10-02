// src/app/editworkout/exercises.tsx – 16 Übung auswählen (pushed inside the modal)
// Second screen of "Neues Workout" (15).
//
// ① Back (button or swipe from the left edge) → back to 15, the selection is discarded
// ② Search          → filters while typing (name, muscle group, equipment)
// ③ Filter chips    → only one muscle group, "Alle" shows everything
// ④ Exercise row    → tap the whole row to tick / untick, several at once
// ⑤ "N Übungen hinzufügen" → adds them to 15 (3 × 10 each) and goes back

import { AppText } from "@/components/AppText";
import { BackButton } from "@/components/ReturnButton";
import { EXERCISES } from "@/constants/exercises";
import { colors, radius, spacing, touch, typography } from "@/constants/theme";
import { useWorkoutDraft } from "@/context/WorkoutDraftContext";
import Exercise, { MUSCLE_GROUPS, MuscleGroup } from "@/models/exercise";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ALL = "Alle";
const DEFAULT_SETS = 3;
const DEFAULT_REPS = 10;

// "Bänkdrücken " → "bänkdrücken" – for comparing search text
const normalize = (text: string) => text.trim().toLocaleLowerCase("de");

export default function ChooseExercises() {
  const { draft, setDraft } = useWorkoutDraft();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<MuscleGroup | typeof ALL>(ALL);
  const [selected, setSelected] = useState<string[]>([]); // exercise ids, in tap order

  // Already in the workout → shown ticked but greyed out
  const alreadyAdded = draft.exercises.map((e) => e.exerciseId);

  const query = normalize(search);
  const visible = EXERCISES.filter(
    (exercise) =>
      (filter === ALL || exercise.muscle === filter) &&
      (query === "" ||
        normalize(exercise.name).includes(query) ||
        normalize(exercise.muscle).includes(query) ||
        normalize(exercise.equipment).includes(query)),
  );

  function toggle(id: string) {
    setSelected((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  }

  // ⑤ Add to the draft of 15 and go back
  function addSelected() {
    setDraft((d) => ({
      ...d,
      exercises: [
        ...d.exercises,
        ...selected.map((exerciseId) => ({
          exerciseId,
          sets: DEFAULT_SETS,
          reps: DEFAULT_REPS,
        })),
      ],
    }));
    router.back();
  }

  function renderRow({ item }: { item: Exercise }) {
    const isAdded = alreadyAdded.includes(item.id);
    const isChecked = isAdded || selected.includes(item.id);

    return (
      <Pressable
        onPress={() => toggle(item.id)}
        disabled={isAdded}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isChecked, disabled: isAdded }}
        style={({ pressed }) => [
          styles.row,
          pressed && styles.rowPressed,
          isAdded && styles.rowAdded,
        ]}
      >
        <View style={styles.rowText}>
          <AppText variant="label">{item.name}</AppText>
          <AppText variant="caption" muted>
            {isAdded ? "Bereits im Workout" : `${item.muscle} · ${item.equipment}`}
          </AppText>
        </View>
        <View style={[styles.checkbox, isChecked && styles.checkboxOn]}>
          {isChecked && <Ionicons name="checkmark" size={18} color={colors.onPrimary} />}
        </View>
      </Pressable>
    );
  }

  const count = selected.length;

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* ① Back + title */}
      <View style={styles.topBar}>
        <BackButton />
        <AppText variant="label">Übung auswählen</AppText>
        <View style={styles.topSide} />
      </View>

      {/* ② Search */}
      <View style={styles.search}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Übung suchen …"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="never"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")} hitSlop={8} accessibilityLabel="Suche löschen">
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* ③ Filter chips (scroll sideways) */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {[ALL, ...MUSCLE_GROUPS].map((group) => {
            const isActive = group === filter;
            return (
              <Pressable
                key={group}
                onPress={() => setFilter(group as MuscleGroup | typeof ALL)}
                accessibilityState={{ selected: isActive }}
                style={[styles.chip, isActive && styles.chipActive]}
              >
                <AppText variant="label" color={isActive ? colors.onPrimary : undefined}>
                  {group}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ④ List */}
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={renderRow}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          <AppText muted style={styles.empty}>
            Keine Übung gefunden.
          </AppText>
        }
      />

      {/* ⑤ Add */}
      <Pressable
        disabled={count === 0}
        onPress={addSelected}
        style={[styles.addButton, count === 0 && styles.addButtonDisabled]}
      >
        <AppText variant="label" color={colors.onPrimary}>
          {count === 0
            ? "Übungen auswählen"
            : `${count} ${count === 1 ? "Übung" : "Übungen"} hinzufügen`}
        </AppText>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topSide: {
    width: touch.minSize, // same width as the back button → title stays centered
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    height: touch.minSize + 4,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.card,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    ...typography.body,
  },
  chips: {
    gap: spacing.sm,
  },
  chip: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: touch.minSize + 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
  },
  rowPressed: {
    backgroundColor: colors.cardPressed,
  },
  rowAdded: {
    opacity: 0.5,
  },
  rowText: {
    flex: 1,
    gap: spacing.xs,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: radius.sm - 2,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  empty: {
    textAlign: "center",
    paddingVertical: spacing.xl,
  },
  addButton: {
    height: touch.buttonHeight,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
});
