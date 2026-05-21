import { Image, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/tokens';

export default function MemberCard({ name, photo }) {
  const { colors } = useTheme();
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.md,
      alignItems: 'center',
    }}>
      <Image
        source={photo}
        style={{
          width: 60, height: 60,
          borderRadius: 30,
          backgroundColor: colors.surfaceAlt,
        }} />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>{name}</Text>
      </View>
    </View>
  );
}
