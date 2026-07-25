import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useCustomers, useRepairs, useExpenses, useIncomes } from '../../hooks';
import { Card, EmptyState, StatusBadge } from '../../components/ui';
import { SPACING, FONT_SIZE, BORDER_RADIUS, REPAIR_STATUS_COLORS } from '../../constants';
import { formatCurrency, getTodayString, isToday, formatDisplayDate } from '../../utils';
import { RepairStatus } from '../../models';

function StatCard({ title, value, icon, color, delay }: { title: string; value: string; icon: string; color: string; delay: number }) {
  const { theme } = useTheme();
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon as any} size={22} color={color} />
        </View>
        <View style={styles.statTextWrap}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
          <Text style={[styles.statTitle, { color: theme.colors.textMuted }]}>{title}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function DashboardScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { customers, reload: reloadCustomers } = useCustomers();
  const { repairs, reload: reloadRepairs } = useRepairs();
  const { expenses, reload: reloadExpenses } = useExpenses();
  const { incomes, reload: reloadIncomes } = useIncomes();

  useFocusEffect(
    useCallback(() => {
      reloadCustomers();
      reloadRepairs();
      reloadExpenses();
      reloadIncomes();
    }, [reloadCustomers, reloadRepairs, reloadExpenses, reloadIncomes])
  );

  const stats = useMemo(() => {
    const today = getTodayString();
    const todayIncome = incomes.filter((i) => i.date === today).reduce((sum, i) => sum + i.amount, 0);
    const todayExpenses = expenses.filter((e) => e.date === today).reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = totalIncome - totalExpenses;
    const activeRepairs = repairs.filter(
      (r) => r.status !== RepairStatus.Delivered && r.status !== RepairStatus.Cancelled
    ).length;
    return { todayIncome, todayExpenses, balance, activeRepairs };
  }, [incomes, expenses, repairs]);

  const recentRepairs = useMemo(() => {
    return [...repairs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  }, [repairs]);

  const quickActions = [
    { label: 'New Customer', icon: 'person-add', color: theme.colors.primary, route: '/customer/add' as const },
    { label: 'New Repair', icon: 'build', color: theme.colors.success, route: '/repair/add' as const },
    { label: 'Add Expense', icon: 'cash', color: theme.colors.danger, route: '/expense/add' as const },
    { label: 'Add Income', icon: 'wallet', color: theme.colors.warning, route: '/income/add' as const },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary, paddingTop: insets.top + SPACING.sm }]}>
        <Text style={styles.headerTitle}>Repair Accountant</Text>
        <Text style={styles.headerSubtitle}>{formatDisplayDate(getTodayString())}</Text>
      </View>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <StatCard title="Today Income" value={formatCurrency(stats.todayIncome)} icon="arrow-down-circle" color={theme.colors.success} delay={0} />
          <StatCard title="Today Expenses" value={formatCurrency(stats.todayExpenses)} icon="arrow-up-circle" color={theme.colors.danger} delay={100} />
          <StatCard title="Balance" value={formatCurrency(stats.balance)} icon="wallet" color={theme.colors.primary} delay={200} />
          <StatCard title="Active Repairs" value={String(stats.activeRepairs)} icon="construct" color={theme.colors.warning} delay={300} />
        </View>

        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionBtn, { backgroundColor: theme.colors.card }]}
                onPress={() => router.push(action.route)}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={[styles.actionLabel, { color: theme.colors.text }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Repairs</Text>
          {recentRepairs.length === 0 ? (
            <EmptyState icon="build-outline" title="No Repairs" message="No repairs found. Add your first repair!" />
          ) : (
            recentRepairs.map((repair) => (
              <TouchableOpacity
                key={repair.id}
                onPress={() => router.push(`/repair/${repair.id}`)}
              >
                <Card style={styles.repairCard}>
                  <View style={styles.repairRow}>
                    <View style={styles.repairInfo}>
                      <Text style={[styles.repairNumber, { color: theme.colors.primary }]}>#{repair.repairNumber}</Text>
                      <Text style={[styles.repairName, { color: theme.colors.text }]}>{repair.customerName}</Text>
                      <Text style={[styles.repairDevice, { color: theme.colors.textMuted }]}>{repair.brand} {repair.model}</Text>
                    </View>
                    <StatusBadge status={repair.status} />
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </Animated.View>
        <View style={{ height: 100 }} />
      </ScrollView>
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
  headerSubtitle: {
    color: '#FFFFFFCC',
    fontSize: FONT_SIZE.sm,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  scroll: { flex: 1 },
  statsGrid: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTextWrap: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  statValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    textAlign: 'right',
  },
  statTitle: {
    fontSize: FONT_SIZE.xs,
    textAlign: 'right',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
    textAlign: 'right',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.sm,
  },
  actionBtn: {
    width: '48%',
    margin: '1%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  repairCard: {
    marginHorizontal: SPACING.lg,
  },
  repairRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  repairInfo: {
    flex: 1,
  },
  repairNumber: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    textAlign: 'right',
  },
  repairName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    textAlign: 'right',
  },
  repairDevice: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
});
