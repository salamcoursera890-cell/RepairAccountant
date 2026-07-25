import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useExpenses } from '../../hooks';
import { Header, TextInput, Button } from '../../components/ui';
import { SPACING, FONT_SIZE, BORDER_RADIUS, EXPENSE_CATEGORIES } from '../../constants';
import { getTodayString, formatDate } from '../../utils';

export default function AddExpenseScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { addExpense } = useExpenses();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Expense title is required.');
      return;
    }
    if (!amount.trim() || parseFloat(amount) <= 0) {
      Alert.alert('Validation', 'Please enter a valid amount.');
      return;
    }
    setLoading(true);
    try {
      await addExpense({
        title: title.trim(),
        amount: parseFloat(amount),
        date,
        notes: notes.trim(),
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to add expense.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Add Expense" onBack={() => router.back()} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Category</Text>
        <View style={styles.categoryGrid}>
          {EXPENSE_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: title === category ? theme.colors.primary : theme.colors.card,
                  borderColor: title === category ? theme.colors.primary : theme.colors.border,
                },
              ]}
              onPress={() => setTitle(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: title === category ? '#FFFFFF' : theme.colors.text },
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          label="Title"
          placeholder="Expense title"
          value={title}
          onChangeText={setTitle}
          textAlign="right"
        />
        <TextInput
          label="Amount"
          placeholder="0"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          textAlign="right"
        />
        <TextInput
          label="Date"
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
          textAlign="right"
        />
        <TextInput
          label="Notes"
          placeholder="Optional notes"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          textAlign="right"
          style={styles.textArea}
        />
        <Button title="Save Expense" onPress={handleSave} loading={loading} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    marginBottom: SPACING.sm,
    textAlign: 'right',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: SPACING.sm,
  },
});
