import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, BORDER_RADIUS } from '../../constants';

type ShadowVariant = 'default' | 'elevated' | 'outlined';

interface CardProps {
  children: React.ReactNode;
  variant?: ShadowVariant;
  onPress?: () => void;
  style?: ViewStyle;
}

const getShadowStyle = (variant: ShadowVariant) => {
  switch (variant) {
    case 'default':
      return {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      };
    case 'elevated':
      return {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
      };
    case 'outlined':
      return {};
  }
};

export default function Card({ children, variant = 'default', onPress, style }: CardProps) {
  const { theme } = useTheme();

  const content = (
    <View
      style={[
        styles.card,
        getShadowStyle(variant),
        {
          backgroundColor: theme.colors.card,
          borderColor: variant === 'outlined' ? theme.colors.border : 'transparent',
          borderWidth: variant === 'outlined' ? 1 : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{content}</TouchableOpacity>;
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
  },
});
