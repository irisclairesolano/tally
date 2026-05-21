import { Ionicons } from '@expo/vector-icons';
import { Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import FAB from '../components/FAB';
import SectionLabel from '../components/SectionLabel';
import TransactionRow from '../components/TransactionRow';
import { useTransactions } from '../hooks/useTransactions';
import { formatPeso } from '../lib/utils';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/tokens';

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const { items = [], loading, error, fetchAll, income, expenses, balance } = useTransactions();
  const recent = (items || []).slice(0, 3);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAll} tintColor={colors.primary} />}>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Image 
            source={require('../../assets/icon.png')} 
            style={{ width: 48, height: 48, borderRadius: radius.md }} 
          />
          <View>
            <Text style={{ fontSize: 14, color: colors.textMuted }}>Welcome to</Text>
            <Text style={{ fontSize: 32, fontWeight: '800', color: colors.textPrimary }}>TALLY</Text>
          </View>
        </View>

        <View>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: -spacing.sm }}>
            Your simple budget tracker for the Philippine peso.
          </Text>
        </View>

        {error && (
          <View style={{ 
            backgroundColor: colors.danger + '15', 
            padding: spacing.md, 
            borderRadius: radius.md,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm
          }}>
            <Ionicons name="cloud-offline-outline" size={20} color={colors.danger} />
            <Text style={{ color: colors.danger, fontSize: 13, flex: 1 }}>
              {error.includes('Network request failed') 
                ? 'Connection error. Check your internet or Supabase settings.' 
                : error}
            </Text>
            <TouchableOpacity onPress={fetchAll} style={{ backgroundColor: colors.danger, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.sm }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.xl }}>
          <Text style={{ color: '#C5CFFF', fontSize: 12, letterSpacing: 1.2 }}>TOTAL BALANCE</Text>
          <Text style={{ color: '#fff', fontSize: 36, fontWeight: '700', marginTop: 6, marginBottom: spacing.lg }}>
            {formatPeso(balance)}
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.xl }}>
            <View>
              <Text style={{ color: '#C5CFFF', fontSize: 11 }}>Income</Text>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{formatPeso(income)}</Text>
            </View>
            <View>
              <Text style={{ color: '#C5CFFF', fontSize: 11 }}>Expenses</Text>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{formatPeso(expenses)}</Text>
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
