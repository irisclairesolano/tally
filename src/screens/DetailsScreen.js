import { Ionicons } from '@expo/vector-icons';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTransactions } from '../hooks/useTransactions';
import { colors, radius, spacing } from '../theme/tokens';

export default function DetailsScreen({ route, navigation }) {
  const { transaction } = route.params;
  const { remove } = useTransactions();
  const peso = (n) => '₱' + n.toLocaleString();

  const sign = Number(transaction.amount) >= 0 ? '+' : '−';
  const color = Number(transaction.amount) >= 0 ? colors.income : colors.expense;

  const dateObj = new Date(transaction.occurred_at);
  const dateStr = dateObj.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });

  const handleDelete = () => {
    Alert.alert(
      'Delete transaction?',
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await remove(transaction.id);
              navigation.goBack();
            } catch (e) {
              Alert.alert('Delete failed', e.message);
            }
          },
        },
      ],
    );
  };

  const handleEdit = () => {
    navigation.getParent()?.navigate('AddTransaction', { transaction });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>

        <View style={{
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          padding: spacing.xl,
          alignItems: 'center',
          gap: spacing.md,
        }}>
          <View style={{
            width: 56, height: 56,
            borderRadius: 28,
            backgroundColor: (transaction.category?.color ?? colors.primary) + '20',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name={transaction.category?.icon ?? 'cash-outline'} size={28} color={transaction.category?.color ?? colors.primary} />
          </View>
          <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>
            {transaction.title}
          </Text>
          <Text style={{ fontSize: 32, fontWeight: '800', color: color }}>
            {sign}{peso(Math.abs(Number(transaction.amount)))}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textMuted, textTransform: 'uppercase' }}>
            {transaction.category?.name ?? 'Uncategorized'}
          </Text>
        </View>

        <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg }}>
          <DetailRow label="Date" value={dateStr} />
          <DetailRow label="Time" value={timeStr} />
          <DetailRow label="Note" value={transaction.note ?? '—'} />
        </View>

        <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg }}>
          <DetailRow label="ID" value={transaction.id} />
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <TouchableOpacity
            onPress={handleEdit}
            style={{
              flex: 1,
              backgroundColor: colors.primary,
              paddingVertical: spacing.md + 2,
              borderRadius: radius.md,
              alignItems: 'center',
            }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            style={{
              flex: 1,
              backgroundColor: colors.danger,
              paddingVertical: spacing.md + 2,
              borderRadius: radius.md,
              alignItems: 'center',
            }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Delete</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    }}>
      <Text style={{ color: colors.textMuted, fontSize: 13 }}>{label}</Text>
      <Text style={{ fontWeight: '500', fontSize: 14, flex: 1, textAlign: 'right', color: colors.textPrimary }}>
        {value}
      </Text>
    </View>
  );
}
