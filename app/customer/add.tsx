import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useCustomers } from '../../hooks';
import { Header, TextInput, Button } from '../../components/ui';
import { SPACING, FONT_SIZE } from '../../constants';

export default function AddCustomerScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { addCustomer } = useCustomers();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Customer name is required.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Validation', 'Phone number is required.');
      return;
    }
    setLoading(true);
    try {
      await addCustomer({ name: name.trim(), phone: phone.trim(), notes: notes.trim() });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to add customer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Add Customer" onBack={() => router.back()} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <TextInput
          label="Customer Name"
          placeholder="Enter customer name"
          value={name}
          onChangeText={setName}
          textAlign="right"
        />
        <TextInput
          label="Phone Number"
          placeholder="Enter phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          textAlign="right"
        />
        <TextInput
          label="Notes"
          placeholder="Optional notes"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          textAlign="right"
          style={styles.textArea}
        />
        <Button title="Save Customer" onPress={handleSave} loading={loading} />
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: SPACING.sm,
  },
});
