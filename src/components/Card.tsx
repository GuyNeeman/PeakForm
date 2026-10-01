// components/Card.tsx
// A reusable card. Uses only theme values, so it works in dark and light mode.

import { Pressable, Text, ViewStyle } from 'react-native';
import { useTheme } from '../constants/theme';

type Props = {
  title: string;
  onPress?: () => void;      // optional: makes the card tappable
  style?: ViewStyle;         // optional: extra styles from the screen (e.g. flex: 1)
  children?: React.ReactNode;
};

export default function Card({ title, onPress, style, children }: Props) {
  const { colors, spacing, radius, typography } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? colors.cardPressed : colors.card,
          borderRadius: radius.lg,
          padding: spacing.lg,
          gap: spacing.sm,
        },
        style,
      ]}
    >
      <Text style={[typography.heading, { color: colors.text }]}>{title}</Text>
      {children}
    </Pressable>
  );
}