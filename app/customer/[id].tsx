import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useCustomers } from '../../hooks';
import { Header, TextInput, Button } from '../../components/ui';
import { SPACING, FONT_SIZE } from '../../constants';
import { Customer } from '../../models';

export default function EditCustomerScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { customers, updateCustomer, deleteCustomer } = useCustomers();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const customer = customers.find((c) => c.id === id);

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone);
      setNotes(customer.notes);
    }
  }, [customer]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Customer name is required.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Validation', 'Phone number is required.');
      return;
    }
    if (!id) return;
    setLoading(true);
    try {
      await updateCustomer(id, { name: name.trim(), phone: phone.trim(), notes: notes.trim() });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to update customer.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert(
      'Delete Customer',
      'Are you sure you want to delete this customer? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteCustomer(id);
            router.back();
          },
        },
      ]
    );
  };

  if (!customer) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="Edit Customer" onBack={() => router.back()} />
        <View style={styles.center}>
          <Text style={[styles.notFound, { color: theme.colors.textMuted }]}>Customer not found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title="Edit Customer"
        onBack={() => router.back()}
        rightAction={{ icon: 'trash', onPress: handleDelete }}
      />
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
        <Button title="Update Customer" onPress={handleSave} loading={loading} />
        <View style={{ height: SPACING.xxl }} />
        <Button title="Delete Customer" onPress={handleDelete} variant="danger" />
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFound: {
    fontSize: FONT_SIZE.lg,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: SPACING.sm,
  },
});
