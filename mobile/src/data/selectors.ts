import { getAppTheme } from '../constants/theme';
import { budgetSpent, walletBalance, type LocalState, type LocalTransaction, type LocalGoal, type LocalRecurring } from './domain';
export type TransactionType = LocalTransaction['type'];
export type GoalItem = LocalGoal;
export type RecurringItem = LocalRecurring & { daysUntil: number };
export interface BudgetItem { id: string; name: string; category: string; spent: number; limit: number; iconName: string; isOverspent: boolean }
const monthLabel = (d: Date) => d.toLocaleDateString('en-US', { month: 'short' });
export function projectLocalData(state: LocalState, now = new Date()) {
  const { Palette } = getAppTheme(state.settings.theme);
  const shades = [Palette.silverTop, Palette.chartSoft, Palette.chartMid, Palette.chartMuted];
  const currency = state.settings.currency;
  const transactions = state.transactions.filter(t => t.currency === currency);
  const budgets = state.budgets.filter(b => b.currency === currency);
  const budgetItems: BudgetItem[] = budgets.flatMap(b => b.categories.length ?
    b.categories.map((entry, i) => {
      const category = state.categories.find(c => c.id === entry.category_id);
      const spent = budgetSpent(state, b, entry.category_id, now);
      return { id: b.id + '-' + i, name: b.name, category: category?.label || 'Other', spent, limit: entry.amount, iconName: category?.iconName || 'pie-chart-outline', isOverspent: spent > entry.amount };
    }) : [{ id: b.id, name: b.name, category: 'All expenses', spent: budgetSpent(state, b, undefined, now), limit: b.totalAmount, iconName: 'pie-chart-outline', isOverspent: budgetSpent(state, b, undefined, now) > b.totalAmount }]);
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const subset = transactions.filter(t => { const d = new Date(t.date); return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth(); });
    return { label: monthLabel(date), year: date.getFullYear(), amount: subset.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), income: subset.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), transactions: subset };
  });
  const breakdown = (items: LocalTransaction[], type: TransactionType) => state.categories.map((c, i) => ({
    name: c.label, iconName: c.iconName, color: shades[i % shades.length],
    amount: items.filter(t => t.type === type && t.categoryId === c.id).reduce((s, t) => s + t.amount, 0),
  })).filter(c => c.amount > 0);
  const totalBudget = budgets.reduce((s, b) => s + b.totalAmount, 0);
  const totalSpent = budgets.reduce((s, b) => s + budgetSpent(state, b, undefined, now), 0);
  const recurring = state.recurring.filter(r => r.currency === currency).map(r => ({
    ...r, daysUntil: Math.ceil((new Date(r.nextDate).getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 86400000),
  }));
  const goals = state.goals.filter(g => g.currency === currency);
  return {
    state,
    LOCAL_TRANSACTIONS: state.transactions.map(t => ({ ...t, method: state.wallets.find(w => w.id === t.walletId)?.name ?? 'Removed wallet' })),
    LOCAL_CATEGORIES: state.categories,
    LOCAL_BALANCE: state.wallets.filter(w => w.currency === currency).reduce((sum, w) => sum + walletBalance(state, w), 0),
    LOCAL_BUDGET_ITEMS: budgetItems, LOCAL_TOTAL_BUDGET: totalBudget, LOCAL_TOTAL_SPENT: totalSpent,
    LOCAL_BUDGET_USED_PCT: totalBudget > 0 ? Math.round(Math.min(totalSpent / totalBudget * 100, 100)) : 0,
    LOCAL_RECURRING_ITEMS: recurring, LOCAL_SAVINGS_GOALS: goals,
    LOCAL_INSIGHTS: [
      { id: 'ins-1', title: 'Overspent categories', subtitle: 'Review your local budgets', badgeCount: budgetItems.filter(b => b.isOverspent).length, iconName: 'alert-circle-outline' },
      { id: 'ins-2', title: 'Recurring entries', subtitle: 'Manually recorded expenses', badgeCount: recurring.length, iconName: 'repeat-outline' },
      { id: 'ins-3', title: 'Other transactions', subtitle: 'Review categories', badgeCount: transactions.filter(t => t.categoryId === 'cat-8').length, iconName: 'help-circle-outline' },
      { id: 'ins-4', title: 'Wallets', subtitle: 'Manual balances on this device', badgeCount: state.wallets.length, iconName: 'wallet-outline' },
      { id: 'ins-5', title: 'Savings goals', subtitle: 'Track your own targets', badgeCount: goals.length, iconName: 'flag-outline' },
    ],
    LOCAL_ANALYTICS_MONTHS: months,
    LOCAL_ANALYTICS_CURRENT_MONTH: monthLabel(now),
    LOCAL_CATEGORY_BREAKDOWN: Object.fromEntries(months.map(m => [m.label, breakdown(m.transactions, 'expense')])),
    LOCAL_INCOME_BREAKDOWN: Object.fromEntries(months.map(m => [m.label, breakdown(m.transactions, 'income')])),
    LOCAL_WEEKLY_TREND: Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6 + i);
      return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), amount: transactions.filter(t => t.type === 'expense' && new Date(t.date).toDateString() === d.toDateString()).reduce((s, t) => s + t.amount, 0) };
    }),
  };
}
