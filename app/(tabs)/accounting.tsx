import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useExpenses, useIncomes } from '../../hooks';
import { Card } from '../../components/ui';
import { SPACING, FONT_SIZE, BORDER_RADIUS, EXPENSE_CATEGORIES } from '../../constants';
import { formatCurrency, formatDisplayDate } from '../../utils';
import { Expense } from '../../models';

function SummaryCard({ title, value, icon, color, delay }: { title: string; value: string; icon: string; color: string; delay: number }) {
  const { theme } = useTheme();
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <Card variant="elevated" style={styles.summaryCard}>
        <View style={[styles.iconWrap, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>{title}</Text>
        <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{value}</Text>
      </Card>
    </Animated.View>
  );
}

export default function AccountingScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { expenses, reload: reloadExpenses } = useExpenses();
  const { incomes, reload: reloadIncomes } = useIncomes();

  useFocusEffect(
    useCallback(() => {
      reloadExpenses();
      reloadIncomes();
    }, [reloadExpenses, reloadIncomes])
  );

  const financials = useMemo(() => {
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const currentCash = totalIncome - totalExpenses;

    const categoryBreakdown: Record<string, number> = {};
    EXPENSE_CATEGORIES.forEach((cat) => {
      categoryBreakdown[cat] = 0;
    });
    expenses.forEach((e) => {
      if (categoryBreakdown[e.title] !== undefined) {
        categoryBreakdown[e.title] += e.amount;
      } else {
        categoryBreakdown['Miscellaneous'] += e.amount;
      }
    });

    return { totalIncome, totalExpenses, netProfit, currentCash, categoryBreakdown };
  }, [incomes, expenses]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary, paddingTop: insets.top + SPACING.sm }]}>
        <Text style={styles.headerTitle}>Accounting</Text>
      </View>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <SummaryCard title="Total Income" value={formatCurrency(financials.totalIncome)} icon="trending-up" color={theme.colors.success} delay={0} />
        <SummaryCard title="Total Expenses" value={formatCurrency(financials.totalExpenses)} icon="trending-down" color={theme.colors.danger} delay={100} />
        <SummaryCard title="Net Profit" value={formatCurrency(financials.netProfit)} icon="bar-chart" color={financials.netProfit >= 0 ? theme.colors.success : theme.colors.danger} delay={200} />
        <SummaryCard title="Current Cash" value={formatCurrency(financials.currentCash)} icon="wallet" color={theme.colors.primary} delay={300} />

        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <Card style={styles.breakdownCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Expense Breakdown</Text>
            {EXPENSE_CATEGORIES.map((category) => {
              const amount = financials.categoryBreakdown[category] || 0;
              const percentage = financials.totalExpenses > 0 ? (amount / financials.totalExpenses) * 100 : 0;
              return (
                <View key={category} style={styles.categoryRow}>
                  <View style={styles.categoryInfo}>
                    <Text style={[styles.categoryName, { color: theme.colors.text }]}>{category}</Text>
                    <Text style={[styles.categoryAmount, { color: theme.colors.textSecondary }]}>{formatCurrency(amount)}</Text>
                  </View>
                  <View style={styles.barContainer}>
                    <View style={[styles.bar, { width: `${percentage}%`, backgroundColor: theme.colors.primary }]} />
                  </View>
                  <Text style={[styles.percentage, { color: theme.colors.textMuted }]}>
                    {percentage.toFixed(1)}%
                  </Text>
                </View>
              );
            })}
          </Card>
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
  scroll: { flex: 1 },
  summaryCard: {
    marginHorizontal: SPACING.lg,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    alignSelf: 'flex-end',
  },
  summaryLabel: {
    fontSize: FONT_SIZE.xs,
    textAlign: 'right',
  },
  summaryValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  breakdownCard: {
    marginHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: SPACING.md,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  categoryInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  categoryName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    textAlign: 'right',
  },
  categoryAmount: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  barContainer: {
    width: 80,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginHorizontal: SPACING.sm,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 3,
  },
  percentage: {
    fontSize: FONT_SIZE.xs,
    width: 40,
    textAlign: 'right',
  },
});
