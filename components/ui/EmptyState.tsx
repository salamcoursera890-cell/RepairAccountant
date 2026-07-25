import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, FONT_SIZE } from '../../constants';

interface Props {
  icon: string;
  title: string;
  message?: string;
}

export const EmptyState: React.FC<Props> = ({ icon, title, message }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Ionicons name={icon as any} size={64} color={theme.colors.textMuted} />
      <Text style={[styles.title, { color: theme.colors.textSecondary }]}>{title}</Text>
      {message && (
        <Text style={[styles.message, { color: theme.colors.textMuted }]}>{message}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxxl,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  message: {
    fontSize: FONT_SIZE.md,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});
