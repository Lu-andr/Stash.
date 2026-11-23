import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Typography, Spacing, Radius, type AppTheme } from '../../constants/theme';
import { useAppTheme, useThemedStyles } from '../../context/useAppTheme';
import { CURRENCIES } from '../../data/domain';
import { localStore } from '../../data/repository';
import { useLocalState } from '../../context/LocalDataContext';
export const SettingsScreen: React.FC = () => {
  const { Colors, isLight } = useAppTheme();
  const styles = useThemedStyles(createStyles);

  const navigation = useNavigation(), state = useLocalState();
  const prefs = state.settings;
  const updatePref = (key: keyof typeof prefs, value: any) => {
    localStore.updateSettings({ [key]: value }).catch(e => Alert.alert('Could not save setting', e.message));
  };
  return <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    <View style={styles.header}>
      <TouchableOpacity accessibilityLabel="Back to dashboard" onPress={() => navigation.goBack()} style={styles.circleBtn}><Ionicons name="arrow-back" size={20} color={Colors.text} /></TouchableOpacity>
      <Text style={styles.title}>Settings</Text><View style={{ width: 40 }} />
    </View>
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.sectionGroup}>
        <Text style={styles.sectionTitle}>REPORT CURRENCY</Text>
        <View style={styles.cardGroup}>{CURRENCIES.map((currency, i) => {
          const selected = prefs.currency === currency.value;
          return <TouchableOpacity key={currency.value} accessibilityRole="button" accessibilityState={{ selected }} style={[styles.row, i < CURRENCIES.length - 1 && styles.rowBorder]} onPress={() => updatePref('currency', currency.value)}>
            <View style={styles.currencyIconWrap}><Text style={styles.currencySymbol}>{currency.symbol}</Text></View>
            <Text style={styles.rowLabel}>{currency.label}</Text>
            <View style={[styles.radioCircle, selected && styles.radioCircleActive]}>{selected && <Ionicons name="checkmark" size={14} color={Colors.onSilver} />}</View>
          </TouchableOpacity>;
        })}</View>
        <Text style={styles.rowSublabel}>Dashboard and analysis use this currency. Wallets retain their own currency. No exchange rates or conversions are used.</Text>
      </View>
      <View style={styles.sectionGroup}>
        <Text style={styles.sectionTitle}>APPEARANCE</Text>
        <View style={styles.cardGroup}><View style={styles.row}>
          <View style={styles.currencyIconWrap}><Ionicons name={isLight ? "sunny-outline" : "moon-outline"} size={18} color={Colors.text} /></View>
          <Text style={styles.rowLabel}>Light mode</Text><Switch accessibilityLabel="Light mode" value={prefs.theme === 'light'}
            onValueChange={value => updatePref('theme', value ? 'light' : 'dark')}
            trackColor={{ false: Colors.surfaceAlt, true: Colors.primary }} thumbColor={isLight ? Colors.onSilver : Colors.text} />
        </View></View>
      </View>
      <View style={styles.sectionGroup}>
        <Text style={styles.sectionTitle}>LOCAL BUDGET OVERVIEW</Text>
        <View style={styles.cardGroup}><View style={styles.switchRow}>
          <View style={styles.switchTextCol}><Text style={styles.rowLabel}>Show budget warnings</Text><Text style={styles.rowSublabel}>Display budget information inside the app. No push notifications.</Text></View>
          <Switch accessibilityLabel="Show budget warnings" value={prefs.budgetWarnings} onValueChange={value => updatePref('budgetWarnings', value)}
            trackColor={{ false: Colors.surfaceAlt, true: Colors.primary }} thumbColor={Colors.text} />
        </View></View>
      </View>
      <View style={styles.sectionGroup}>
        <Text style={styles.sectionTitle}>LOCAL DATA</Text>
        <View style={styles.cardGroup}><View style={styles.row}>
          <View style={styles.switchTextCol}>
            <Text style={styles.rowLabel}>Manual records on this device</Text>
            <Text style={styles.rowSublabel}>Wallets and transactions stay on this device. Financial offers on Android are loaded separately from Firebase when online. No registration or bank connection is required. Removing the app or clearing its storage removes your records.</Text>
          </View>
        </View></View>
      </View>
    </ScrollView>
  </SafeAreaView>;
};

const createStyles = ({ Colors }: AppTheme) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.xl,
  },

  sectionGroup: {
    gap: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.textMuted,
    letterSpacing: 1,
    paddingHorizontal: Spacing.xs,
    marginBottom: 4,
  },
  cardGroup: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.base,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  currencyIconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  currencySymbol: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  rowLabel: {
    flex: 1,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.text,
  },
  rowSublabel: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    backgroundColor: Colors.silverTop,
    borderColor: Colors.borderAlt,
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: Spacing.base,
  },
  switchTextCol: {
    flex: 1,
    marginRight: Spacing.md,
  },
});
