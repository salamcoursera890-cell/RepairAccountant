import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { BORDER_RADIUS, SPACING, FONT_SIZE, SHADOW } from '../../constants';

interface Props {
  icon: string;
  label: string;
  value: string;
  color?: string;
}

export const StatCard: React.FC<Props> = ({ icon, label, value, color }) => {
  const { theme } = useTheme();
  const iconColor = color || theme.colors.primary;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderRadius: BORDER_RADIUS.lg,
          ...SHADOW.sm,
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon as any} size={22} color={iconColor} />
      </View>
      <Text style={[styles.value, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: SPACING.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  value: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    marginBottom: 2,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
  },
});
