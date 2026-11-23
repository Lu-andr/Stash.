import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { Typography, Spacing, Radius, type AppTheme } from '../../constants/theme';
import { useAppTheme, useThemedStyles } from '../../context/useAppTheme';
import { useLocalState } from '../../context/LocalDataContext';
import { localStore } from '../../data/repository';
import { CURRENCIES, WALLET_TYPES, type Currency, type WalletType } from '../../data/domain';
export function WalletFormScreen() {
  const { Colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);

  const route = useRoute<RouteProp<RootStackParamList, 'WalletForm'>>(), navigation = useNavigation();
  const state = useLocalState(), id = route.params?.walletId, wallet = state.wallets.find(w => w.id === id);
  const [name, setName] = useState(wallet?.name ?? '');
  const [type, setType] = useState<WalletType>(wallet?.type ?? 'wallet');
  const [currency, setCurrency] = useState<Currency>(wallet?.currency ?? state.settings.currency);
  const [balance, setBalance] = useState(String(wallet?.initialBalance ?? 0));
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (saving) return;
    if (!balance.trim()) { Alert.alert('Initial Balance', 'Enter an initial balance.'); return; }
    setSaving(true);
    try { await localStore.saveWallet({ name, type, currency, initialBalance: Number(balance) }, id); navigation.goBack(); }
    catch (e: any) { Alert.alert('Could not save wallet', e.message); }
    finally { setSaving(false); }
  };
  return <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
    <View style={styles.header}>
      <TouchableOpacity accessibilityLabel="Close wallet form" onPress={() => navigation.goBack()} style={styles.circle}><Ionicons name="close" size={22} color={Colors.text} /></TouchableOpacity>
      <Text style={styles.title}>{id ? 'Edit Wallet' : 'Add Wallet'}</Text>
    </View>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Wallet Name</Text>
        <TextInput accessibilityLabel="Wallet Name" style={styles.input} value={name} onChangeText={setName} maxLength={80} placeholder="Cash, Main Wallet, Savings" placeholderTextColor={Colors.textMuted} />
        <Text style={styles.label}>Wallet Type / Icon</Text>
        <View style={styles.options}>{WALLET_TYPES.map(t => <TouchableOpacity key={t.value} accessibilityRole="button" accessibilityLabel={t.label} accessibilityState={{ selected: type === t.value }} onPress={() => setType(t.value)} style={[styles.option, type === t.value && styles.selected]}>
          {t.value === 'savings' ? <FontAwesome5 name="piggy-bank" size={22} color={Colors.text} /> : <Ionicons name={t.icon as any} size={22} color={Colors.text} />}
          <Text style={styles.optionText}>{t.label}</Text>
        </TouchableOpacity>)}</View>
        <Text style={styles.label}>Currency</Text>
        <View style={styles.options}>{CURRENCIES.map(c => <TouchableOpacity key={c.value} accessibilityRole="button" accessibilityLabel={c.label} accessibilityState={{ selected: currency === c.value }} onPress={() => setCurrency(c.value)} style={[styles.option, currency === c.value && styles.selected]}>
          <Text style={styles.optionText}>{c.symbol} {c.value}</Text>
        </TouchableOpacity>)}</View>
        <Text style={styles.label}>Initial Balance</Text>
        <TextInput accessibilityLabel="Initial Balance" style={styles.input} keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'} value={balance} onChangeText={setBalance} placeholder="0.00" placeholderTextColor={Colors.textMuted} />
        <Text style={styles.note}>This is a manual record stored on this device. Current balance also includes the transactions you record for this wallet.</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Save Wallet" disabled={saving} onPress={save} style={[styles.save, saving && { opacity: 0.6 }]}><Text style={styles.saveText}>{saving ? 'Saving…' : 'Save Wallet'}</Text></TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const createStyles = ({ Colors }: AppTheme) => StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgBase },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base, padding: Spacing.lg },
  circle: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface, borderRadius: Radius.full },
  title: { color: Colors.text, fontSize: Typography.xl, fontWeight: Typography.semibold },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing['3xl'] },
  label: { color: Colors.textSecondary, fontSize: Typography.base, marginTop: Spacing.sm },
  input: { color: Colors.text, backgroundColor: Colors.surfaceInput, borderColor: Colors.border, borderWidth: 1, borderRadius: Radius.lg, minHeight: 52, padding: Spacing.base, fontSize: Typography.md },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  option: { minWidth: 80, minHeight: 52, padding: Spacing.md, alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: Radius.lg, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  selected: { borderColor: Colors.primary, backgroundColor: Colors.surfaceHigh },
  optionText: { color: Colors.text, fontSize: Typography.sm },
  note: { color: Colors.textMuted, fontSize: Typography.sm, lineHeight: 20 },
  save: { backgroundColor: Colors.primary, borderRadius: Radius.full, alignItems: 'center', padding: Spacing.base, marginTop: Spacing.base },
  saveText: { color: Colors.onSilver, fontSize: Typography.md, fontWeight: Typography.bold },
});
