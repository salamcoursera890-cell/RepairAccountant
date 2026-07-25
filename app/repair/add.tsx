import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useCustomers, useRepairs } from '../../hooks';
import { Header, TextInput, Button, Modal, Card } from '../../components/ui';
import { SPACING, FONT_SIZE, BORDER_RADIUS, DEVICE_TYPES } from '../../constants';
import { getTodayString } from '../../utils';
import { RepairStatus, DeviceType, Customer } from '../../models';

export default function AddRepairScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { customers } = useCustomers();
  const { addRepair } = useRepairs();

  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [deviceModalVisible, setDeviceModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [deviceType, setDeviceType] = useState<DeviceType>(DeviceType.Smartphone);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [problem, setProblem] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    const lower = customerSearch.toLowerCase();
    return customers.filter(
      (c) => c.name.toLowerCase().includes(lower) || c.phone.includes(customerSearch)
    );
  }, [customers, customerSearch]);

  const handleSave = async () => {
    if (!selectedCustomer) {
      Alert.alert('Validation', 'Please select a customer.');
      return;
    }
    if (!brand.trim()) {
      Alert.alert('Validation', 'Brand is required.');
      return;
    }
    if (!model.trim()) {
      Alert.alert('Validation', 'Model is required.');
      return;
    }
    if (!problem.trim()) {
      Alert.alert('Validation', 'Problem description is required.');
      return;
    }
    setLoading(true);
    try {
      await addRepair({
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        deviceType,
        brand: brand.trim(),
        model: model.trim(),
        problemDescription: problem.trim(),
        estimatedCost: parseFloat(estimatedCost) || 0,
        finalCost: 0,
        status: RepairStatus.Received,
        receivedDate: getTodayString(),
        deliveryDate: '',
        notes: notes.trim(),
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to add repair.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Add Repair" onBack={() => router.back()} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Customer</Text>
        <TouchableOpacity
          style={[styles.selector, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          onPress={() => setCustomerModalVisible(true)}
        >
          <Text style={[styles.selectorText, { color: selectedCustomer ? theme.colors.text : theme.colors.textMuted }]}>
            {selectedCustomer ? selectedCustomer.name : 'Select a customer'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>

        <Text style={[styles.label, { color: theme.colors.text }]}>Device Type</Text>
        <TouchableOpacity
          style={[styles.selector, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          onPress={() => setDeviceModalVisible(true)}
        >
          <Text style={[styles.selectorText, { color: theme.colors.text }]}>{deviceType}</Text>
          <Ionicons name="chevron-down" size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>

        <TextInput
          label="Brand"
          placeholder="e.g. Samsung, Apple"
          value={brand}
          onChangeText={setBrand}
          textAlign="right"
        />
        <TextInput
          label="Model"
          placeholder="e.g. Galaxy S24, iPhone 15"
          value={model}
          onChangeText={setModel}
          textAlign="right"
        />
        <TextInput
          label="Problem Description"
          placeholder="Describe the issue"
          value={problem}
          onChangeText={setProblem}
          multiline
          numberOfLines={4}
          textAlign="right"
          style={styles.textArea}
        />
        <TextInput
          label="Estimated Cost"
          placeholder="0"
          value={estimatedCost}
          onChangeText={setEstimatedCost}
          keyboardType="numeric"
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
        <Button title="Save Repair" onPress={handleSave} loading={loading} />
      </ScrollView>

      <Modal visible={customerModalVisible} onClose={() => setCustomerModalVisible(false)} title="Select Customer">
        <TextInput
          placeholder="Search customers..."
          value={customerSearch}
          onChangeText={setCustomerSearch}
          textAlign="right"
        />
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.id}
          style={styles.modalList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.modalItem, { borderBottomColor: theme.colors.border }]}
              onPress={() => {
                setSelectedCustomer(item);
                setCustomerModalVisible(false);
                setCustomerSearch('');
              }}
            >
              <Text style={[styles.modalItemName, { color: theme.colors.text }]}>{item.name}</Text>
              <Text style={[styles.modalItemSub, { color: theme.colors.textMuted }]}>{item.phone}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No customers found.</Text>
          }
        />
      </Modal>

      <Modal visible={deviceModalVisible} onClose={() => setDeviceModalVisible(false)} title="Select Device Type">
        <FlatList
          data={DEVICE_TYPES}
          keyExtractor={(item) => item}
          style={styles.modalList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.modalItem,
                { borderBottomColor: theme.colors.border },
                item === deviceType && { backgroundColor: theme.colors.primary + '10' },
              ]}
              onPress={() => {
                setDeviceType(item as DeviceType);
                setDeviceModalVisible(false);
              }}
            >
              <Text style={[styles.modalItemName, { color: theme.colors.text }]}>{item}</Text>
              {item === deviceType && <Ionicons name="checkmark" size={20} color={theme.colors.primary} />}
            </TouchableOpacity>
          )}
        />
      </Modal>
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
    marginBottom: SPACING.xs,
    textAlign: 'right',
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    marginBottom: SPACING.md,
  },
  selectorText: {
    fontSize: FONT_SIZE.md,
    textAlign: 'right',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: SPACING.sm,
  },
  modalList: {
    maxHeight: 300,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  modalItemName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    textAlign: 'right',
  },
  modalItemSub: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: SPACING.xl,
    fontSize: FONT_SIZE.md,
  },
});
