import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/tokens';

export default function EmptyState({ icon = 'receipt-outline', title, body }) {
  return (
    <View style={{ alignItems: 'center', padding: spacing.xxl, gap: spacing.sm }}>
      <View style={{
        width: 64, height: 64,
        borderRadius: 32,
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Ionicons name={icon} size={28} color={colors.textMuted} />
      </View>
      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginTop: 4 }}>
        {title}
      </Text>
      {body ? (
        <Text style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center' }}>
          {body}
        </Text>
      ) : null}
    </View>
  );
}
