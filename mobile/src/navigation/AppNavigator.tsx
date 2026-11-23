import React from 'react';
import { createBottomTabNavigator, type BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp, NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator, type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppTheme } from '../context/useAppTheme';
import { HomeScreen } from '../screens/home/HomeScreen';
import { InsightsScreen } from '../screens/insights/InsightsScreen';
import { WalletsScreen } from '../screens/wallets/WalletsScreen';
import { WalletFormScreen } from '../screens/wallets/WalletFormScreen';
import { TransactionsScreen } from '../screens/transactions/TransactionsScreen';
import { TransactionDetailScreen } from '../screens/transactions/TransactionDetailScreen';
import { AddTransactionScreen } from '../screens/transactions/AddTransactionScreen';
import { BudgetsScreen } from '../screens/budgets/BudgetsScreen';
import { CreateBudgetScreen } from '../screens/budgets/CreateBudgetScreen';
import { SavingsGoalsScreen } from '../screens/budgets/SavingsGoalsScreen';
import { RecurringScreen } from '../screens/budgets/RecurringScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { AnalyticsScreen } from '../screens/insights/AnalyticsScreen';
import { SmartRulesScreen } from '../screens/insights/SmartRulesScreen';
export type MainTabParamList = { Home: undefined; Insights: undefined; Wallets: undefined };
export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  WalletForm: { walletId?: string } | undefined;
  Transactions: undefined; TransactionDetail: { transactionId: string; iconName?: string };
  AddTransaction: { type?: 'income' | 'expense'; transactionId?: string };
  Budgets: undefined; CreateBudget: { budgetId?: string } | undefined;
  SavingsGoals: undefined; Recurring: undefined; Settings: undefined;
  Analytics: undefined; SmartRules: undefined;
};
export type DashboardNavigation = CompositeNavigationProp<BottomTabNavigationProp<MainTabParamList>, NativeStackNavigationProp<RootStackParamList>>;
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
function MainTabs() {
  return <Tab.Navigator initialRouteName="Home" screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Insights" component={InsightsScreen} />
    <Tab.Screen name="Wallets" component={WalletsScreen} />
  </Tab.Navigator>;
}
export function AppNavigator() {
  const { Colors } = useAppTheme();

  return <Stack.Navigator initialRouteName="Main" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bgBase } }}>
    <Stack.Screen name="Main" component={MainTabs} />
    <Stack.Screen name="WalletForm" component={WalletFormScreen} options={{ presentation: 'modal' }} />
    <Stack.Screen name="Transactions" component={TransactionsScreen} />
    <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
    <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
    <Stack.Screen name="Budgets" component={BudgetsScreen} />
    <Stack.Screen name="CreateBudget" component={CreateBudgetScreen} options={{ presentation: 'modal' }} />
    <Stack.Screen name="SavingsGoals" component={SavingsGoalsScreen} />
    <Stack.Screen name="Recurring" component={RecurringScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="Analytics" component={AnalyticsScreen} />
    <Stack.Screen name="SmartRules" component={SmartRulesScreen} />
  </Stack.Navigator>;
}
