import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';

export default function SettingRow({ icon, label, value, right }) {
  const { colors } = useTheme();
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      gap: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    }}>
      <Ionicons name={icon} size={20} color={colors.textPrimary} />
      <Text style={{ flex: 1, fontSize: 15, color: colors.textPrimary }}>{label}</Text>
      {value ? <Text style={{ fontSize: 14, color: colors.textMuted }}>{value}</Text> : null}
      {right}
    </View>
  );
}
