import { Image, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import FAB from '../components/FAB';
import SectionLabel from '../components/SectionLabel';
import TransactionRow from '../components/TransactionRow';
import { useTransactions } from '../hooks/useTransactions';
import { colors, radius, spacing } from '../theme/tokens';

export default function HomeScreen({ navigation }) {
  const { items, loading, fetchAll, income, expenses, balance } = useTransactions();
  const peso = (n) => '₱' + n.toLocaleString();
  const recent = items.slice(0, 3);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAll} tintColor={colors.primary} />}>

        <View>
          <Text style={{ fontSize: 14, color: colors.textMuted }}>Welcome to</Text>
          <Text style={{ fontSize: 32, fontWeight: '800', color: colors.textPrimary }}>TALLY</Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>
            Your simple budget tracker for the Philippine peso.
          </Text>
        </View>

        <View style={{ backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.xl }}>
          <Text style={{ color: '#C5CFFF', fontSize: 12, letterSpacing: 1.2 }}>TOTAL BALANCE</Text>
          <Text style={{ color: '#fff', fontSize: 36, fontWeight: '700', marginTop: 6, marginBottom: spacing.lg }}>
            {peso(balance)}
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.xl }}>
            <View>
              <Text style={{ color: '#C5CFFF', fontSize: 11 }}>Income</Text>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{peso(income)}</Text>
            </View>
            <View>
              <Text style={{ color: '#C5CFFF', fontSize: 11 }}>Expenses</Text>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{peso(expenses)}</Text>
            </View>
          </View>
        </View>

        <Card>
          <SectionLabel>Recent activity</SectionLabel>
          {recent.length === 0 ? (
            <EmptyState
              icon="receipt-outline"
              title="No transactions yet"
              body="Tap the + button to add your first one." />
          ) : (
            recent.map(t => (
              <TransactionRow
                key={t.id}
                title={t.title}
                category={t.category?.name ?? 'Uncategorized'}
                amount={Number(t.amount)}
                icon={t.category?.icon ?? 'cash-outline'}
                color={t.category?.color ?? colors.primary} />
            ))
          )}
        </Card>

      </ScrollView>

      <FAB onPress={() => navigation.navigate('AddTransaction')} />
    </SafeAreaView>
  );
}
