import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useRepairs } from '../../hooks';
import { Card, EmptyState, SearchBar, StatusBadge } from '../../components/ui';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants';
import { formatCurrency, formatDisplayDate } from '../../utils';
import { Repair } from '../../models';

export default function RepairsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { repairs, isLoading, searchRepairs, reload } = useRepairs();
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const filteredRepairs = searchRepairs(searchQuery);

  const renderRepair = ({ item }: { item: Repair }) => (
    <TouchableOpacity onPress={() => router.push(`/repair/${item.id}`)}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.info}>
            <View style={styles.topRow}>
              <Text style={[styles.repairNumber, { color: theme.colors.primary }]}>#{item.repairNumber}</Text>
              <StatusBadge status={item.status} />
            </View>
            <Text style={[styles.customerName, { color: theme.colors.text }]}>{item.customerName}</Text>
            <Text style={[styles.device, { color: theme.colors.textSecondary }]}>
              {item.brand} {item.model}
            </Text>
            <View style={styles.bottomRow}>
              <Text style={[styles.cost, { color: theme.colors.success }]}>{formatCurrency(item.estimatedCost)}</Text>
              <Text style={[styles.date, { color: theme.colors.textMuted }]}>{formatDisplayDate(item.receivedDate)}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary, paddingTop: insets.top + SPACING.sm }]}>
        <Text style={styles.headerTitle}>Repairs</Text>
      </View>
      <View style={styles.content}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search repairs..."
        />
        <FlatList
          data={filteredRepairs}
          keyExtractor={(item) => item.id}
          renderItem={renderRepair}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="build-outline"
              title="No Repairs"
              message="Tap the + button to add your first repair."
            />
          }
        />
      </View>
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push('/repair/add')}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    textAlign: 'right',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  list: {
    paddingBottom: 100,
  },
  card: {
    marginHorizontal: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  repairNumber: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    textAlign: 'right',
  },
  customerName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    textAlign: 'right',
  },
  device: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  cost: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    textAlign: 'right',
  },
  date: {
    fontSize: FONT_SIZE.xs,
    textAlign: 'right',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
});
