import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/ui';
import { api } from '../../services/api';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants';

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const data = await api.data.export();
      const json = JSON.stringify(data, null, 2);
      const timestamp = new Date().toISOString().slice(0, 10);
      const fileName = `repair_accountant_backup_${timestamp}.json`;
      const file = new File(Paths.document, fileName);
      file.write(json);
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(file.uri);
      }
      Alert.alert('Export Complete', 'Backup file has been created successfully.');
    } catch {
      Alert.alert('Export Failed', 'An error occurred while exporting data.');
    } finally {
      setIsExporting(false);
    }
  }, []);

  const handleImport = useCallback(async () => {
    Alert.alert(
      'Import Data',
      'This will replace all existing data with the imported backup. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          style: 'destructive',
          onPress: async () => {
            setIsImporting(true);
            try {
              const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
              });
              if (result.canceled) {
                setIsImporting(false);
                return;
              }
              const fileUri = result.assets[0].uri;
              const file = new File(fileUri);
              const json = await file.text();
              const parsed = JSON.parse(json);
              await api.data.import(parsed);
              Alert.alert('Import Complete', 'Data has been restored successfully.');
            } catch {
              Alert.alert('Import Failed', 'An error occurred while importing data.');
            } finally {
              setIsImporting(false);
            }
          },
        },
      ]
    );
  }, []);

  const handleClearData = useCallback(() => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all customers, repairs, expenses, and incomes. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await api.data.clear();
            Alert.alert('Data Cleared', 'All data has been removed.');
          },
        },
      ]
    );
  }, []);

  const settingsItems = [
    {
      title: 'Dark Mode',
      subtitle: isDark ? 'Currently dark' : 'Currently light',
      icon: isDark ? 'moon' : 'sunny',
      color: theme.colors.primary,
      right: <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ true: theme.colors.primary, false: theme.colors.border }} />,
    },
    {
      title: 'Export Backup',
      subtitle: 'Save data to file',
      icon: 'download',
      color: theme.colors.success,
      loading: isExporting,
      onPress: handleExport,
    },
    {
      title: 'Import Backup',
      subtitle: 'Restore from file',
      icon: 'cloud-upload',
      color: theme.colors.warning,
      loading: isImporting,
      onPress: handleImport,
    },
    {
      title: 'Clear All Data',
      subtitle: 'Permanently delete everything',
      icon: 'trash',
      color: theme.colors.danger,
      onPress: handleClearData,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary, paddingTop: insets.top + SPACING.sm }]}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {settingsItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={item.onPress}
            disabled={item.loading}
          >
            <Card style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{item.title}</Text>
                  <Text style={[styles.settingSubtitle, { color: theme.colors.textMuted }]}>{item.subtitle}</Text>
                </View>
                <View style={styles.settingRight}>
                  {'right' in item && item.right ? (
                    item.right
                  ) : (
                    <View style={[styles.iconWrap, { backgroundColor: item.color + '20' }]}>
                      <Ionicons name={item.icon as any} size={20} color={item.color} />
                    </View>
                  )}
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        <Card style={styles.aboutCard}>
          <Text style={[styles.aboutTitle, { color: theme.colors.text }]}>About</Text>
          <Text style={[styles.aboutText, { color: theme.colors.textSecondary }]}>
            Repair Accountant v1.0.0{'\n'}
            A complete repair shop management and accounting application.
          </Text>
        </Card>
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
  settingCard: {
    marginHorizontal: SPACING.lg,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    textAlign: 'right',
  },
  settingSubtitle: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  settingRight: {
    marginLeft: SPACING.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutCard: {
    marginHorizontal: SPACING.lg,
  },
  aboutTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: SPACING.sm,
  },
  aboutText: {
    fontSize: FONT_SIZE.md,
    textAlign: 'right',
    lineHeight: 22,
  },
});
