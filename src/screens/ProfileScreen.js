import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Card from '../components/Card';
import MemberCard from '../components/MemberCard';
import SectionLabel from '../components/SectionLabel';
import { groupMembers } from '../data/members';
import { colors, radius, spacing } from '../theme/tokens';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>

        {/* App identity */}
        <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
          <Text style={{ fontSize: 28, fontWeight: '800', marginTop: spacing.md, color: colors.textPrimary }}>
            TALLY
          </Text>
          <Text style={{
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: 6,
            maxWidth: 280,
          }}>
            A budget tracker designed for Filipino students, built as a React Native laboratory project.
          </Text>
        </View>

        {/* Project description */}
        <Card>
          <SectionLabel>Project</SectionLabel>
          <Text style={{ fontSize: 14, lineHeight: 22, color: colors.textPrimary }}>
            TALLY helps users track daily income and expenses in Philippine pesos.
            The app demonstrates React Native, bottom tab navigation, stack
            navigation, FlatList rendering, and image handling — submitted as
            our group requirement for Mobile Application Development.
          </Text>
        </Card>

        {/* Group members */}
        <View>
          <SectionLabel>Group members</SectionLabel>
          {groupMembers.map(m => <MemberCard key={m.id} {...m} />)}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
