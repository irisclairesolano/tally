import { useState } from 'react';
import { ScrollView, View, Text, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Card         from '../components/Card';
import SectionLabel from '../components/SectionLabel';
import SettingRow   from '../components/SettingRow';
import { colors, spacing, radius } from '../theme/tokens';

export default function SettingsScreen() {
  const [darkMode, setDarkMode]   = useState(false);
  const [reminders, setReminders] = useState(true);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>

        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary }}>Settings</Text>

        <View>
          <SectionLabel>Preferences</SectionLabel>
          <Card style={{ padding: 0, paddingHorizontal: spacing.md }}>
            <SettingRow icon="cash-outline"     label="Currency"        value="PHP" />
            <SettingRow icon="calendar-outline" label="Start of month"  value="1" />
            <SettingRow
              icon="notifications-outline"
              label="Reminders"
              right={<Switch value={reminders} onValueChange={setReminders} trackColor={{ true: colors.primary }} />} />
            <SettingRow
              icon="moon-outline"
              label="Dark mode"
              right={<Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: colors.primary }} />} />
          </Card>
        </View>

        <View>
          <SectionLabel>App info</SectionLabel>
          <Card>
            <View style={{ alignItems: 'center', gap: spacing.sm }}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={{ width: 48, height: 48, borderRadius: radius.md }} />
              <Text style={{ fontWeight: '700', fontSize: 16, color: colors.textPrimary }}>TALLY</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>Version 1.0.0 · Build 1</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm }}>
                Made with React Native and Expo.{'\n'}
                Mobile Application Development · April 2026
              </Text>
            </View>
          </Card>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
