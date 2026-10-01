// src/components/ProgressRing.tsx
// Calorie ring: blue ring that fills up, number in the middle.
// <ProgressRing value={1850} goal={2200} />

import { AppText } from "@/components/AppText";
import { colors } from "@/constants/theme";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Props = {
  value: number;
  goal?: number;
  size?: number;
  text?: string;
};

const STROKE = 12;

const format = (n: number) =>
  String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "'");

export function ProgressRing({ value, goal, size = 140, text }: Props) {
  const r = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = goal ? Math.min(value / goal, 1) : 0;
  const offset = circumference * (1 - progress);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={goal === undefined ? colors.primary : colors.border}
          strokeWidth={STROKE}
          fill="none"
        />

        {goal !== undefined && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={colors.primary}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        )}
      </Svg>

      <View style={styles.center}>
        <AppText variant="heading">{format(value)}</AppText>
        {goal !== undefined && (
          <AppText variant="caption" muted>
            von {format(goal)}
          </AppText>
        )}
        <AppText variant="caption">{text}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
});
