import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/tokens';

export default function TransactionRow({ title, category, amount, icon, color }) {
  const isIncome = amount >= 0;
  const tint = isIncome ? colors.income : colors.expense;
  const bgTint = (color ?? colors.primary) + '22'; // ~13% opacity hex suffix

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      gap: spacing.md,
    }}>
      <View style={{
        width: 36, height: 36,
        borderRadius: radius.pill,
        backgroundColor: bgTint,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Ionicons name={icon} size={18} color={color ?? colors.textSecondary} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '500', color: colors.textPrimary }}>{title}</Text>
        <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{category}</Text>
      </View>

      <Text style={{ fontSize: 15, fontWeight: '600', color: tint }}>
        {isIncome ? '+' : '−'}₱{Math.abs(amount).toLocaleString()}
      </Text>
    </View>
  );
}
