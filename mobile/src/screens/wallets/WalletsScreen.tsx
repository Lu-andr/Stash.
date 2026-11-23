import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, DashboardNavigation } from '../../navigation/AppNavigator';

import { Palette,
  Colors, Gradients, Typography, Spacing, Radius, Shadow,
} from '../../constants/theme';
import { FloatingNav, NavTab } from '../../components/ui/FloatingNav';
import { formatMoney } from '../../utils/formatting';
import { useLocalState } from '../../context/LocalDataContext';
import { localStore } from '../../data/repository';
import { WALLET_TYPES, walletBalance, type Wallet } from '../../data/domain';

const TYPE_LABELS = Object.fromEntries(WALLET_TYPES.map(t => [t.value, t.label]));

function WalletCard({ account, onEdit, onDelete }: { account: Wallet & { balance: number; iconName: string }; onEdit: () => void; onDelete: () => void }) {
  const isNegative = account.balance < 0;

  return (
    <LinearGradient
      colors={Gradients.raised}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.accountCard}
    >
      <View style={styles.topHighlight} />

      {/* Top row */}
      <View style={styles.cardTopRow}>
        <View style={styles.walletIconWrap}>
          {account.type === 'savings' ? <FontAwesome5 name="piggy-bank" size={20} color={Colors.text} /> : <Ionicons name={account.iconName as any} size={20} color={Colors.text} />}
        </View>
        <View style={styles.walletInfo}>
          <Text style={styles.walletName} numberOfLines={1}>{account.name}</Text>
          <Text style={styles.walletMeta} numberOfLines={1}>{account.currency + ' · Manual entry'}</Text>
        </View>
        <TouchableOpacity onPress={onEdit} accessibilityLabel={'Edit wallet ' + account.name} style={{ padding: 10, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="pencil-outline" size={18} color={Colors.textSecondary} /></TouchableOpacity>
        <TouchableOpacity onPress={onDelete} accessibilityLabel={'Delete wallet ' + account.name} style={{ padding: 10, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="trash-outline" size={18} color={Colors.danger} /></TouchableOpacity>
      </View>

      {/* Balance */}
      <View style={styles.balanceRow}>
        <View style={{ flex: 1, paddingRight: Spacing.sm }}>
          <Text style={styles.balanceLabel}>Balance</Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[
              styles.balanceAmount,
              isNegative && { color: Colors.danger },
            ]}
          >
            {isNegative ? '−' : ''}{formatMoney(Math.abs(account.balance), 2, account.currency)}
          </Text>
        </View>

        {/* Type pill */}
        <View style={styles.typePill}>
          <Text style={styles.typePillText}>{TYPE_LABELS[account.type]}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

type Nav = DashboardNavigation;

export const WalletsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [activeTab, setActiveTab] = useState<NavTab>('wallets');

  useFocusEffect(
    useCallback(() => {
      setActiveTab('wallets');
    }, [])
  );

  const state = useLocalState();
  const wallets = state.wallets.map(w => ({ ...w, balance: walletBalance(state, w), iconName: WALLET_TYPES.find(t => t.value === w.type)?.icon || 'wallet-outline' }));
  const currencies = [...new Set(wallets.map(w => w.currency))];
  const removeWallet = (id: string) => Alert.alert('Delete wallet?', 'Recorded transactions will remain in your history. This removes only this manual wallet.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => { localStore.deleteWallet(id).catch(e => Alert.alert('Could not delete wallet', e.message)); } },
  ]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home' as any)}
            style={styles.backBtn}
            accessibilityLabel="Go to Home"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Wallets</Text>
            <Text style={styles.headerSub}>{wallets.length} active wallets</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Net worth summary pill */}
          <LinearGradient
            colors={[Palette.detailTop, Palette.detailBottom]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.netWorthCard}
          >
            <View style={styles.topHighlight} />
            <Text style={styles.netWorthLabel}>Recorded balances</Text>
            {currencies.length ? currencies.map(currency => <Text key={currency} style={styles.netWorthAmount} numberOfLines={1} adjustsFontSizeToFit>
              {formatMoney(wallets.filter(w => w.currency === currency).reduce((sum, w) => sum + w.balance, 0), 2, currency)}
            </Text>) : <Text style={styles.netWorthAmount}>No wallets yet</Text>}
            <Text style={styles.netWorthSub}>Manual totals by currency · No conversion</Text>
          </LinearGradient>

          {/* Account cards — stacked */}
          <View style={styles.cardList}>
            {wallets.map(wallet => <WalletCard key={wallet.id} account={wallet}
              onEdit={() => navigation.navigate('WalletForm', { walletId: wallet.id })}
              onDelete={() => removeWallet(wallet.id)} />)}
          </View>

          {/* Add account button */}
          <TouchableOpacity
            style={styles.addAccountBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('WalletForm')}
          >
            <LinearGradient
              colors={Gradients.raised}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.addAccountInner}
            >
              <View style={styles.topHighlight} />
              <View style={styles.addAccountIcon}>
                <Ionicons name="add" size={20} color={Colors.textSecondary} />
              </View>
              <Text style={styles.addAccountText}>Add Wallet</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>

      <FloatingNav
        activeTab={activeTab}
        onTabPress={(tab) => {
          if (tab === 'home') navigation.navigate('Home' as any);
          else if (tab === 'insights') navigation.navigate('Insights' as any);
        }}
        onAddPress={() => navigation.navigate('AddTransaction' as any, {})}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgBase },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.lg, gap: Spacing.base, paddingTop: Spacing.base },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.base, paddingBottom: Spacing.base, gap: Spacing.md,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: Typography.xl, fontWeight: Typography.semibold, color: Colors.text, letterSpacing: -0.3 },
  headerSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  netWorthCard: {
    borderRadius: Radius['2xl'], borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.xl, overflow: 'hidden', ...Shadow.md,
  },
  topHighlight: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: Colors.highlightTop },
  netWorthLabel: { fontSize: 12, fontWeight: Typography.medium, color: Colors.textSecondary, marginBottom: 6 },
  netWorthAmount: { fontSize: Typography['4xl'], fontWeight: Typography.bold, color: Colors.text, letterSpacing: -1.5, fontVariant: ['tabular-nums'] },
  netWorthSub: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },

  cardList: { gap: Spacing.sm },
  accountCard: {
    borderRadius: Radius['2xl'], borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.xl, overflow: 'hidden', ...Shadow.sm,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.xl },
  walletIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.surfaceAlt, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  walletInfo: { flex: 1 },
  walletName: { fontSize: Typography.md, fontWeight: Typography.semibold, color: Colors.text },
  walletMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  balanceRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  balanceLabel: { fontSize: 11, fontWeight: Typography.medium, color: Colors.textMuted, marginBottom: 4, letterSpacing: 0.5 },
  balanceAmount: { fontSize: Typography['3xl'], fontWeight: Typography.bold, color: Colors.text, letterSpacing: -0.8, fontVariant: ['tabular-nums'] },
  typePill: {
    backgroundColor: Colors.surfaceAlt, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full,
  },
  typePillText: { fontSize: 11, fontWeight: Typography.semibold, color: Colors.textSecondary },

  addAccountBtn: { borderRadius: Radius.row, overflow: 'hidden' },
  addAccountInner: {
    height: 72, borderRadius: Radius.row, borderWidth: 1, borderColor: Colors.border,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.base, gap: Spacing.md, overflow: 'hidden',
  },
  addAccountIcon: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceAlt,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center',
  },
  addAccountText: { flex: 1, fontSize: Typography.md, fontWeight: Typography.semibold, color: Colors.textSecondary },
});
