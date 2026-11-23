import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Typography, Spacing, Radius, type AppTheme } from '../../constants/theme';
import { useAppTheme, useThemedStyles } from '../../context/useAppTheme';
import { localStore } from '../../data/repository';
import { useLocalState } from '../../context/LocalDataContext';
import { transactionView } from '../../data/domain';
import { formatCurrency, formatDateFull, formatTime, getPaymentMethodLabel } from '../../utils/formatting';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Route = RouteProp<RootStackParamList, 'TransactionDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export const TransactionDetailScreen: React.FC = () => {
  const { Colors, Palette, isLight } = useAppTheme();
  const styles = useThemedStyles(createStyles);

  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const state = useLocalState();
  const record = state.transactions.find(t => t.id === route.params.transactionId);
  const transaction = record ? transactionView(state, record) : null;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Delete transaction?',
      'Are you sure you want to permanently delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await localStore.deleteTransaction(route.params.transactionId);
              navigation.goBack();
            } catch (e: any) {
              Alert.alert('Could not delete transaction', e.message);
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (!transaction) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loading}>This transaction no longer exists.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.loading}>Go back</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isIncome = transaction.type === 'income';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle={isLight ? "dark-content" : "light-content"} backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.circleBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddTransaction', { transactionId: transaction.id })}
          style={styles.circleBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="pencil" size={18} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Amount Hero */}
        <View style={styles.heroCard}>
          <View style={[styles.categoryBadge, { backgroundColor: isIncome ? Colors.incomeLight : Palette.borderHairline }]}>
            <Ionicons
              name={(transaction.category?.icon || 'receipt-outline') as any}
              size={32}
              color={isIncome ? Colors.income : Colors.text}
            />
          </View>
          <Text style={[styles.amount, { color: isIncome ? Colors.income : Colors.text }]}>
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
          </Text>
          <Text style={styles.categoryName}>{transaction.category?.name || 'Uncategorized'}</Text>
          <View style={[styles.typeBadge, { backgroundColor: isIncome ? Colors.incomeLight : Colors.expenseLight }]}>
            <Text style={[styles.typeBadgeText, { color: isIncome ? Colors.income : Colors.expense }]}>
              {isIncome ? 'INCOME' : 'EXPENSE'}
            </Text>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <DetailRow icon="document-text-outline" label="Title" value={transaction.title} />
          <DetailRow icon="calendar-outline" label="Date" value={formatDateFull(transaction.date)} />
          <DetailRow icon="time-outline" label="Time" value={formatTime(transaction.date)} />
          {transaction.payment_method && (
            <DetailRow icon="card-outline" label="Wallet" value={getPaymentMethodLabel(transaction.payment_method)} />
          )}
          {transaction.notes && (
            <DetailRow icon="information-circle-outline" label="Notes" value={transaction.notes} isLast />
          )}
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDelete}
          disabled={isDeleting}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={18} color={Colors.expense} />
          <Text style={styles.deleteBtnText}>{isDeleting ? 'Deleting...' : 'Delete Transaction'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailRow = ({ icon, label, value, isLast }: { icon: any; label: string; value: string; isLast?: boolean }) => {
  const { Colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  return (
  <View style={[styles.detailRow, isLast && { borderBottomWidth: 0 }]}>
    <View style={styles.detailIcon}>
      <Ionicons name={icon} size={16} color={Colors.textSecondary} />
    </View>
    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);
};

const createStyles = ({ Colors, Palette }: AppTheme) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    color: Colors.textSecondary,
    fontSize: Typography.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
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
  headerTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.lg,
  },

  heroCard: {
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.borderHairline,
  },
  amount: {
    fontSize: 38,
    fontWeight: Typography.extrabold,
    letterSpacing: -0.5,
  },
  categoryName: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  typeBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginTop: Spacing.md,
  },
  typeBadgeText: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    letterSpacing: 1,
  },

  detailsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },

  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.dangerLight,
    borderRadius: Radius.full,
    paddingVertical: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.dangerLight },
  deleteBtnText: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.expense,
  },
});
