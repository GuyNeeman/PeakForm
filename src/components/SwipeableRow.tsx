// src/components/SwipeableRow.tsx
// A row that shows buttons when you swipe it to the left (e.g. a red "Löschen").
// <SwipeableRow actions={[{ label: "Löschen", color: colors.danger, onPress: (close) => ... }]}>
//   ...row content...
// </SwipeableRow>
// onPress gets `close` – call it to slide the row back (e.g. when the user cancels).

import { AppText } from "@/components/AppText";
import { colors, radius, spacing } from "@/constants/theme";
import { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";

type Action = {
  label: string;
  color: string; // background
  textColor?: string; // default: white
  onPress: (close: () => void) => void;
};

type Props = {
  actions: Action[];
  children: ReactNode;
};

export function SwipeableRow({ actions, children }: Props) {
  return (
    <ReanimatedSwipeable
      friction={2}
      rightThreshold={40}
      overshootRight={false}
      renderRightActions={(_progress, _translation, swipeable) => (
        <View style={styles.actions}>
          {actions.map((action, i) => (
            <Pressable
              key={action.label}
              onPress={() => action.onPress(swipeable.close)}
              style={[
                styles.action,
                { backgroundColor: action.color },
                i === 0 && styles.first,
                i === actions.length - 1 && styles.last,
              ]}
            >
              <AppText variant="label" color={action.textColor ?? colors.onPrimary}>
                {action.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      )}
    >
      {children}
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    marginLeft: spacing.sm,
  },
  action: {
    width: 96,
    alignItems: "center",
    justifyContent: "center",
  },
  first: {
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
  },
  last: {
    borderTopRightRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
});
