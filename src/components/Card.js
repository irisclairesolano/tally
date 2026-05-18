import { View } from 'react-native';
import { colors, spacing, radius } from '../theme/tokens';

export default function Card({ children, style }) {
  return (
    <View style={[{
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    }, style]}>
      {children}
    </View>
  );
}
