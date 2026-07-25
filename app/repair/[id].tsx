import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useRepairs, useCustomers } from '../../hooks';
import { Header, TextInput, Button, Modal, StatusBadge } from '../../components/ui';
import { SPACING, FONT_SIZE, BORDER_RADIUS, DEVICE_TYPES, REPAIR_STATUS_COLORS } from '../../constants';
import { RepairStatus, DeviceType, Customer, Repair } from '../../models';

const STATUS_OPTIONS = Object.values(RepairStatus);

export default function EditRepairScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { repairs, updateRepair, deleteRepair } = useRepairs();
  const { customers } = useCustomers();

  const repair = repairs.find((r) => r.id === id);

  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [problem, setProblem] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [finalCost, setFinalCost] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (repair) {
      setBrand(repair.brand);
      setModel(repair.model);
      setProblem(repair.problemDescription);
      setEstimatedCost(String(repair.estimatedCost));
      setFinalCost(String(repair.finalCost));
      setNotes(repair.notes);
    }
  }, [repair]);

  const handleSave = async () => {
    if (!id) return;
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
      await updateRepair(id, {
        brand: brand.trim(),
        model: model.trim(),
        problemDescription: problem.trim(),
        estimatedCost: parseFloat(estimatedCost) || 0,
        finalCost: parseFloat(finalCost) || 0,
        notes: notes.trim(),
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to update repair.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: RepairStatus) => {
    if (!id) return;
    const updates: Partial<Repair> = { status: newStatus };
    if (newStatus === RepairStatus.Delivered) {
      updates.deliveryDate = new Date().toISOString().slice(0, 10);
    }
    await updateRepair(id, updates);
    setStatusModalVisible(false);
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert(
      'Delete Repair',
      'Are you sure you want to delete this repair? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteRepair(id);
            router.back();
          },
        },
      ]
    );
  };

  if (!repair) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="Edit Repair" onBack={() => router.back()} />
        <View style={styles.center}>
          <Text style={[styles.notFound, { color: theme.colors.textMuted }]}>Repair not found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title={`Repair #${repair.repairNumber}`}
        onBack={() => router.back()}
        rightAction={{ icon: 'trash', onPress: handleDelete }}
      />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.statusSection}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Status</Text>
          <TouchableOpacity
            style={[styles.statusSelector, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => setStatusModalVisible(true)}
          >
            <StatusBadge status={repair.status} />
            <Ionicons name="chevron-down" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.customerInfo}>
          <Text style={[styles.customerLabel, { color: theme.colors.textMuted }]}>Customer</Text>
          <Text style={[styles.customerName, { color: theme.colors.text }]}>{repair.customerName}</Text>
          <Text style={[styles.customerPhone, { color: theme.colors.textSecondary }]}>{repair.customerPhone}</Text>
        </View>

        <TextInput
          label="Brand"
          placeholder="e.g. Samsung"
          value={brand}
          onChangeText={setBrand}
          textAlign="right"
        />
        <TextInput
          label="Model"
          placeholder="e.g. Galaxy S24"
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
          label="Final Cost"
          placeholder="0"
          value={finalCost}
          onChangeText={setFinalCost}
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
        <Button title="Update Repair" onPress={handleSave} loading={loading} />
        <View style={{ height: SPACING.xxl }} />
        <Button title="Delete Repair" onPress={handleDelete} variant="danger" />
      </ScrollView>

      <Modal visible={statusModalVisible} onClose={() => setStatusModalVisible(false)} title="Change Status">
        <FlatList
          data={STATUS_OPTIONS}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.statusOption,
                { borderBottomColor: theme.colors.border },
                item === repair.status && { backgroundColor: theme.colors.primary + '10' },
              ]}
              onPress={() => handleStatusChange(item)}
            >
              <View style={styles.statusOptionRow}>
                <View style={[styles.statusDot, { backgroundColor: REPAIR_STATUS_COLORS[item] || theme.colors.textMuted }]} />
                <Text style={[styles.statusOptionText, { color: theme.colors.text }]}>{item}</Text>
              </View>
              {item === repair.status && <Ionicons name="checkmark" size={20} color={theme.colors.primary} />}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFound: {
    fontSize: FONT_SIZE.lg,
  },
  statusSection: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    marginBottom: SPACING.xs,
    textAlign: 'right',
  },
  statusSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  customerInfo: {
    backgroundColor: '#F1F5F910',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E2E8F030',
  },
  customerLabel: {
    fontSize: FONT_SIZE.xs,
    textAlign: 'right',
  },
  customerName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  customerPhone: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: SPACING.sm,
  },
  statusOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  statusOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusOptionText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
  },
});
