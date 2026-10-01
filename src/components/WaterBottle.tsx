// src/components/WaterBottle.tsx
// Wasserflasche als Fortschrittsbalken: füllt sich von unten nach oben.
// <WaterBottle value={1250} goal={2750} />

import { colors } from "@/constants/theme";
import Svg, { ClipPath, Defs, Path, Rect } from "react-native-svg";

type Props = {
  value: number; // getrunkene ml
  goal: number; // Tagesziel in ml
  width?: number; // Breite der Flasche (Höhe wird automatisch berechnet)
};

// Form der Flasche (Hals + Körper), gezeichnet in einem 40 × 100 Raster
const BOTTLE =
  "M14 10 H26 V16 C26 20 34 22 34 30 V92 Q34 98 28 98 H12 Q6 98 6 92 V30 C6 22 14 20 14 16 Z";

const TOP = 10; // wo die Flasche oben beginnt (unter dem Deckel)
const BOTTOM = 98; // wo die Flasche unten endet

export function WaterBottle({ value, goal, width = 40 }: Props) {
  const progress = Math.min(value / goal, 1); // 0 bis 1, nie mehr als voll
  const fillHeight = (BOTTOM - TOP) * progress; // wie hoch das Wasser steht

  return (
    <Svg width={width} height={width * 2.5} viewBox="0 0 40 100">
      <Defs>
        {/* Ein Rechteck, das von unten wächst – nur dieser Teil der Flasche wird blau */}
        <ClipPath id="water">
          <Rect x="0" y={BOTTOM - fillHeight} width="40" height={fillHeight} />
        </ClipPath>
      </Defs>

      {/* Deckel */}
      <Rect x="14" y="0" width="12" height="8" rx="2" fill={colors.primary} />

      {/* Leere Flasche (grau) */}
      <Path d={BOTTLE} fill={colors.border} />

      {/* Wasser (blau) – dieselbe Form, aber nur bis zur Füllhöhe sichtbar */}
      <Path d={BOTTLE} fill={colors.primary} clipPath="url(#water)" />
    </Svg>
  );
}
