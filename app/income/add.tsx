import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useIncomes } from '../../hooks';
import { Header, TextInput, Button } from '../../components/ui';
import { SPACING, FONT_SIZE } from '../../constants';
import { getTodayString } from '../../utils';

export default function AddIncomeScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { addIncome } = useIncomes();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!description.trim()) {
      Alert.alert('Validation', 'Description is required.');
      return;
    }
    if (!amount.trim() || parseFloat(amount) <= 0) {
      Alert.alert('Validation', 'Please enter a valid amount.');
      return;
    }
    setLoading(true);
    try {
      await addIncome({
        description: description.trim(),
        amount: parseFloat(amount),
        date,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to add income.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Add Income" onBack={() => router.back()} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <TextInput
          label="Description"
          placeholder="Income description"
          value={description}
          onChangeText={setDescription}
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
        <Button title="Save Income" onPress={handleSave} loading={loading} />
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
});
