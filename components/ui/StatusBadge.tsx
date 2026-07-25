import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { REPAIR_STATUS_COLORS } from '../../constants';
import { BORDER_RADIUS, SPACING, FONT_SIZE } from '../../constants';

interface Props {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const bgColor = REPAIR_STATUS_COLORS[status] || '#6B7280';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgColor + '20',
          borderRadius: BORDER_RADIUS.full,
          paddingVertical: size === 'sm' ? 2 : 4,
          paddingHorizontal: size === 'sm' ? 8 : 12,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: bgColor }]} />
      <Text style={[styles.text, { color: bgColor, fontSize: size === 'sm' ? FONT_SIZE.xs : FONT_SIZE.sm }]}>
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 6,
  },
  text: {
    fontWeight: '600',
    marginLeft: 4,
  },
});
