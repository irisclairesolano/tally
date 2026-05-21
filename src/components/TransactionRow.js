import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius } from '../theme/tokens';
import { addOpacity, formatPeso } from '../lib/utils';

export default function TransactionRow({ title, category, amount, icon, color }) {
  const { colors } = useTheme();
  const isIncome = amount >= 0;
  const tint = isIncome ? colors.income : colors.expense;
  const bgTint = addOpacity(color ?? colors.primary, '22');

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
        <Ionicons name={icon || 'cash-outline'} size={18} color={color ?? colors.textSecondary} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '500', color: colors.textPrimary }}>{title}</Text>
        <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{category}</Text>
      </View>

      <Text style={{ fontSize: 15, fontWeight: '600', color: tint }}>
        {isIncome ? '+' : '−'}{formatPeso(Math.abs(amount))}
      </Text>
    </View>
  );
}
