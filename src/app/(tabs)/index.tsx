// app/(tabs)/index.tsx – 04 Home
// Example of a full screen using the theme.

import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '../../constants/theme';
import Card from '../../components/Card';

export default function HomeScreen() {
  // Step 1: get the theme values at the top of the screen
  const { colors, spacing, radius, typography, touch } = useTheme();

  return (
    // Step 2: the screen background comes from the theme
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}>

        {/* Step 3: text = typography style + color from the theme */}
        <Text style={[typography.title, { color: colors.text }]}>
          Hey Alex, ready to level up today?
        </Text>

        {/* Step 4: use your themed components */}
        <Card title="Calories" onPress={() => router.push('/meals')}>
          <Text style={[typography.bigValue, { color: colors.text }]}>1'850</Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>of 2'200 kcal</Text>
        </Card>

        {/* Two cards side by side: the screen adds flex: 1 via the style prop */}
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <Card title="Water" style={{ flex: 1 }}>
            <Pressable
              onPress={() => { /* addWater(250) – comes later with the context */ }}
              style={{
                alignSelf: 'flex-start',
                minHeight: touch.minSize,
                justifyContent: 'center',
                paddingHorizontal: spacing.md,
                borderRadius: radius.sm,
                backgroundColor: colors.primary,
              }}
            >
              <Text style={[typography.label, { color: colors.onPrimary }]}>+250 ml</Text>
            </Pressable>
          </Card>

          <Card title="Workout" style={{ flex: 1 }} onPress={() => router.push('/workout/pull-day')}>
            <Text style={[typography.body, { color: colors.textMuted }]}>Pull Day</Text>
          </Card>
        </View>

        <Card title="Sleep">
          <Text style={[typography.bigValue, { color: colors.text }]}>7h 45m</Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>Last night</Text>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}