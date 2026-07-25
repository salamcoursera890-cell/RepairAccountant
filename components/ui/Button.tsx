import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<Props> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  fullWidth = false,
}) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const getBg = () => {
    if (disabled) return theme.colors.textMuted;
    switch (variant) {
      case 'primary': return theme.colors.primary;
      case 'secondary': return theme.colors.inputBg;
      case 'danger': return theme.colors.danger;
      case 'success': return theme.colors.success;
      case 'outline': return 'transparent';
      default: return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.white;
    switch (variant) {
      case 'secondary': return theme.colors.text;
      case 'outline': return theme.colors.primary;
      default: return '#FFFFFF';
    }
  };

  const getPadding = (): ViewStyle => {
    switch (size) {
      case 'sm': return { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg };
      case 'lg': return { paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xxl };
      default: return { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl };
    }
  };

  return (
    <Animated.View style={[animatedStyle, fullWidth && { width: '100%' }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          styles.button,
          getPadding(),
          {
            backgroundColor: getBg(),
            borderColor: variant === 'outline' ? theme.colors.primary : 'transparent',
            borderWidth: variant === 'outline' ? 1.5 : 0,
            borderRadius: BORDER_RADIUS.md,
            opacity: disabled ? 0.7 : 1,
          },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={getTextColor()} size="small" />
        ) : (
          <Text style={[styles.text, { color: getTextColor(), fontSize: size === 'sm' ? FONT_SIZE.sm : size === 'lg' ? FONT_SIZE.lg : FONT_SIZE.md }]}>
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
});
