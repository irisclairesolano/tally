import { Text } from 'react-native';
import { colors } from '../theme/tokens';

export default function SectionLabel({ children }) {
  return (
    <Text style={{
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 1.4,
      color: colors.textMuted,
      textTransform: 'uppercase',
      marginBottom: 12,
    }}>{children}</Text>
  );
}
