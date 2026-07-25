import React, { useState } from 'react';
import { View, Text, TextInput as RNTextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const TextInput: React.FC<Props> = ({ label, error, containerStyle, style, ...props }) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error ? theme.colors.danger : isFocused ? theme.colors.primary : theme.colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      )}
      <RNTextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.inputBg,
            color: theme.colors.text,
            borderColor,
          },
          style,
        ]}
        placeholderTextColor={theme.colors.textMuted}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        textAlign="right"
        {...props}
      />
      {error && (
        <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    marginBottom: SPACING.xs,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZE.md,
    minHeight: 48,
  },
  error: {
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
    textAlign: 'right',
  },
});
