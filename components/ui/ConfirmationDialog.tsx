import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal as RNModal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { BORDER_RADIUS, SPACING, FONT_SIZE } from '../../constants';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmationDialog: React.FC<Props> = ({
  visible,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  onConfirm,
  onCancel,
  variant = 'danger',
}) => {
  const { theme } = useTheme();

  const getIconName = (): string => {
    switch (variant) {
      case 'danger': return 'warning';
      case 'warning': return 'alert-circle';
      case 'info': return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'danger': return theme.colors.danger;
      case 'warning': return theme.colors.warning;
      case 'info': return theme.colors.primary;
    }
  };

  return (
    <RNModal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: theme.colors.card, borderRadius: BORDER_RADIUS.xl }]}>
          <View style={[styles.iconContainer, { backgroundColor: getIconColor() + '15' }]}>
            <Ionicons name={getIconName() as any} size={36} color={getIconColor()} />
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{message}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.inputBg, borderRadius: BORDER_RADIUS.md }]}
              onPress={onCancel}
            >
              <Text style={[styles.buttonText, { color: theme.colors.text }]}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: getIconColor(), borderRadius: BORDER_RADIUS.md }]}
              onPress={onConfirm}
            >
              <Text style={[styles.buttonText, { color: '#FFF' }]}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  content: {
    width: '100%',
    maxWidth: 340,
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  message: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  buttons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
});
