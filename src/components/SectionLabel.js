import { Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function SectionLabel({ children }) {
  const { colors } = useTheme();
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
