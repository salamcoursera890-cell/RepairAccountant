import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useCustomers } from '../../hooks';
import { Card, EmptyState, SearchBar } from '../../components/ui';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants';
import { Customer } from '../../models';

export default function CustomersScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { customers, isLoading, deleteCustomer, searchCustomers, reload } = useCustomers();
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const filteredCustomers = searchCustomers(searchQuery);

  const handleDelete = useCallback(
    (customer: Customer) => {
      Alert.alert(
        'Delete Customer',
        `Are you sure you want to delete ${customer.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteCustomer(customer.id),
          },
        ]
      );
    },
    [deleteCustomer]
  );

  const renderCustomer = ({ item }: { item: Customer }) => (
    <TouchableOpacity onPress={() => router.push(`/customer/${item.id}`)}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.info}>
            <Text style={[styles.name, { color: theme.colors.text }]}>{item.name}</Text>
            <Text style={[styles.phone, { color: theme.colors.textMuted }]}>{item.phone}</Text>
            {item.notes ? (
              <Text style={[styles.notes, { color: theme.colors.textSecondary }]} numberOfLines={1}>{item.notes}</Text>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            style={styles.deleteBtn}
          >
            <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary, paddingTop: insets.top + SPACING.sm }]}>
        <Text style={styles.headerTitle}>Customers</Text>
      </View>
      <View style={styles.content}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search customers..."
        />
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.id}
          renderItem={renderCustomer}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="No Customers"
              message="Tap the + button to add your first customer."
            />
          }
        />
      </View>
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push('/customer/add')}
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
  name: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    textAlign: 'right',
  },
  phone: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  notes: {
    fontSize: FONT_SIZE.xs,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  deleteBtn: {
    padding: SPACING.sm,
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
