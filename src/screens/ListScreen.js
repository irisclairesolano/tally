import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import FAB from '../components/FAB';
import TransactionRow from '../components/TransactionRow';
import { useTransactions } from '../hooks/useTransactions';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/tokens';

export default function ListScreen({ navigation }) {
  const { colors } = useTheme();
  const { items = [], loading, error, fetchAll } = useTransactions();
  const [filter, setFilter] = useState('All');

  const filtered = useMemo(() => {
    const list = items || [];
    if (filter === 'All')     return list;
    if (filter === 'Income')  return list.filter(t => Number(t.amount) > 0);
    if (filter === 'Expense') return list.filter(t => Number(t.amount) < 0);
    return list;
  }, [items, filter]);

  const renderHeader = () => (
    <View style={{ marginBottom: spacing.md }}>
      {error && (
        <View style={{ 
          backgroundColor: colors.danger + '15', 
          padding: spacing.md, 
          borderRadius: radius.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.md
        }}>
          <Ionicons name="cloud-offline-outline" size={20} color={colors.danger} />
          <Text style={{ color: colors.danger, fontSize: 13, flex: 1 }}>
            {error.includes('Network request failed') 
              ? 'Connection error.' 
              : error}
          </Text>
          <TouchableOpacity onPress={fetchAll} style={{ backgroundColor: colors.danger, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.sm }}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={{
        flexDirection: 'row',
        backgroundColor: colors.surfaceAlt,
        padding: 4,
        borderRadius: radius.pill,
        marginBottom: spacing.md,
      }}>
        {['All', 'Income', 'Expense'].map(opt => (
          <TouchableOpacity
            key={opt}
            onPress={() => setFilter(opt)}
            style={{
              flex: 1, paddingVertical: spacing.sm,
              borderRadius: radius.pill,
              backgroundColor: filter === opt ? colors.primary : 'transparent',
              alignItems: 'center',
            }}>
            <Text style={{
              color: filter === opt ? '#fff' : colors.textSecondary,
              fontWeight: '600', fontSize: 13,
            }}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={{ fontSize: 13, color: colors.textMuted }}>
        Showing {filtered?.length || 0} of {items?.length || 0} transactions
      </Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Details', { transaction: item })}
      activeOpacity={0.7}>
      <TransactionRow
        title={item.title}
        category={item.category?.name ?? 'Uncategorized'}
        amount={Number(item.amount)}
        icon={item.category?.icon ?? 'cash-outline'}
        color={item.category?.color ?? colors.primary} />
    </TouchableOpacity>
  );

  const renderSeparator = () => (
    <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 2 }} />
  );

  const renderEmpty = () => (
    <EmptyState
      icon="receipt-outline"
      title="No transactions"
      body="Try a different filter or add a new transaction." />
  );

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={renderSeparator}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAll} tintColor={colors.primary} />} />

      <FAB onPress={() => navigation.navigate('AddTransaction')} />
    </SafeAreaView>
  );
}
