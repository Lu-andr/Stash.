export type Currency = typeof CURRENCIES[number]['value'];
export type WalletType = 'cash' | 'card' | 'savings' | 'wallet';
export interface Wallet { id: string; name: string; type: WalletType; currency: Currency; initialBalance: number }
export interface LocalCategory { id: string; label: string; iconName: string }
export interface LocalTransaction {
  id: string; merchant: string; category: string; categoryId: string; iconName: string;
  walletId?: string; currency: Currency; amount: number; type: 'income' | 'expense';
  date: string; notes: string; createdAt: string;
}
export interface LocalBudget {
  id: string; name: string; totalAmount: number; currency: Currency;
  period: 'weekly' | 'monthly' | 'yearly'; startDate: string; isRecurring: boolean;
  categories: Array<{ category_id: string; amount: number }>;
}
export interface LocalRecurring { id: string; name: string; amount: number; frequency: string; nextDate: string; category: string; iconName: string; currency: Currency }
export interface LocalGoal { id: string; name: string; targetAmount: number; currentAmount: number; targetDate: string; iconName: string; currency: Currency }
export interface LocalRule { id: string; keyword: string; category: string; categoryIcon: string; enabled: boolean; matchCount: number }
export interface LocalSettings { currency: Currency; budgetWarnings: boolean }
export interface LocalState {
  version: 1; wallets: Wallet[]; transactions: LocalTransaction[]; categories: LocalCategory[];
  budgets: LocalBudget[]; recurring: LocalRecurring[]; goals: LocalGoal[]; rules: LocalRule[];
  settings: LocalSettings;
}
export const CURRENCIES = [
  { value: 'PHP', label: 'Philippine Peso', symbol: '₱' },
  { value: 'VND', label: 'Vietnamese Dong', symbol: '₫' },
  { value: 'KZT', label: 'Kazakhstani Tenge', symbol: '₸' },
  { value: 'UZS', label: 'Uzbekistani Som', symbol: 'soʻm' },
  { value: 'ZAR', label: 'South African Rand', symbol: 'R' },
  { value: 'RUB', label: 'Russian Ruble', symbol: '₽' },
  { value: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
] as const;
export const WALLET_TYPES = [
  { value: 'cash', label: 'Cash', icon: 'cash-outline' },
  { value: 'card', label: 'Card', icon: 'card-outline' },
  { value: 'savings', label: 'Piggy Bank', icon: 'archive-outline' },
  { value: 'wallet', label: 'Wallet', icon: 'wallet-outline' },
] as const;
export function newId(prefix: string) { return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12); }
export function initialState(): LocalState {
  return {
    version: 1,
    wallets: [
      { id: 'wallet-cash', name: 'Cash', type: 'cash', currency: 'INR', initialBalance: 0 },
      { id: 'wallet-main', name: 'Main Wallet', type: 'wallet', currency: 'INR', initialBalance: 0 },
      { id: 'wallet-savings', name: 'Savings', type: 'savings', currency: 'INR', initialBalance: 0 },
    ],
    transactions: [], budgets: [], recurring: [], goals: [], rules: [],
    categories: [
      { id: 'cat-1', label: 'Food', iconName: 'fast-food-outline' },
      { id: 'cat-2', label: 'Transport', iconName: 'car-outline' },
      { id: 'cat-3', label: 'Shopping', iconName: 'bag-handle-outline' },
      { id: 'cat-4', label: 'Entertainment', iconName: 'tv-outline' },
      { id: 'cat-5', label: 'Health', iconName: 'medkit-outline' },
      { id: 'cat-6', label: 'Bills', iconName: 'receipt-outline' },
      { id: 'cat-7', label: 'Income', iconName: 'wallet-outline' },
      { id: 'cat-8', label: 'Other', iconName: 'ellipsis-horizontal-outline' },
    ],
    settings: { currency: 'INR', budgetWarnings: true },
  };
}
export function isCurrency(value: unknown): value is Currency { return CURRENCIES.some(c => c.value === value); }
export function requireAmount(value: number, positive = false) {
  if (!Number.isFinite(value) || (positive && value <= 0) || Math.abs(value) > 1e12) throw new Error('Enter a valid amount.');
  if (Math.abs(Math.round(value * 100) / 100 - value) > 0.000001) throw new Error('Use no more than two decimal places.');
}
export function walletBalance(state: LocalState, wallet: Wallet) {
  return Math.round((wallet.initialBalance + state.transactions.filter(t => t.walletId === wallet.id)
    .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0)) * 100) / 100;
}
export function transactionView(state: LocalState, t: LocalTransaction) {
  const category = state.categories.find(c => c.id === t.categoryId);
  return {
    id: t.id, title: t.merchant, amount: t.amount, type: t.type, wallet_id: t.walletId, currency: t.currency,
    category_id: t.categoryId, category: { id: t.categoryId, name: t.category, icon: t.iconName, color: '#A9D6FF', type: 'both' as const, is_default: !!category },
    date: t.date, payment_method: state.wallets.find(w => w.id === t.walletId)?.name ?? 'Removed wallet',
    notes: t.notes, created_at: t.createdAt, updated_at: t.date,
  };
}
export function periodEnd(start: Date, period: LocalBudget['period']) {
  const end = new Date(start);
  if (period === 'weekly') end.setDate(end.getDate() + 7);
  else {
    const day = end.getDate(); end.setDate(1);
    if (period === 'monthly') end.setMonth(end.getMonth() + 1); else end.setFullYear(end.getFullYear() + 1);
    const last = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
    end.setDate(Math.min(day, last));
  }
  return end;
}
export function budgetRange(b: LocalBudget, now = new Date()) {
  let start = new Date(b.startDate), end = periodEnd(start, b.period);
  if (b.isRecurring) {
    // A bounded loop also rejects unreasonable imported dates.
    let periods = 0;
    while (end <= now && periods++ < 6000) { start = end; end = periodEnd(start, b.period); }
  }
  return { start, end };
}
export function budgetSpent(state: LocalState, budget: LocalBudget, categoryId?: string, now = new Date()) {
  const { start, end } = budgetRange(budget, now);
  return state.transactions.filter(t => t.type === 'expense' && t.currency === budget.currency &&
    new Date(t.date) >= start && new Date(t.date) < end && (!categoryId || t.categoryId === categoryId))
    .reduce((sum, t) => sum + t.amount, 0);
}
export function validateState(s: any): asserts s is LocalState {
  if (!s || s.version !== 1 || !isCurrency(s.settings?.currency) || typeof s.settings.budgetWarnings !== 'boolean') throw new Error('Unsupported or damaged local data. Your stored data has not been overwritten.');
  for (const key of ['wallets', 'transactions', 'categories', 'budgets', 'recurring', 'goals', 'rules']) {
    if (!Array.isArray(s[key])) throw new Error('Damaged local data: ' + key);
    const ids = new Set<string>();
    for (const item of s[key]) {
      if (!item || typeof item.id !== 'string' || ids.has(item.id)) throw new Error('Invalid local record in ' + key);
      ids.add(item.id);
    }
  }
  for (const w of s.wallets) {
    if (typeof w.name !== 'string' || !w.name.trim() || !isCurrency(w.currency) || !WALLET_TYPES.some(t => t.value === w.type)) throw new Error('Invalid wallet.');
    requireAmount(w.initialBalance);
  }
  for (const c of s.categories) if (typeof c.label !== 'string' || !c.label.trim() || typeof c.iconName !== 'string') throw new Error('Invalid category.');
  for (const t of s.transactions) {
    requireAmount(t.amount, true);
    if (!isCurrency(t.currency) || !['income', 'expense'].includes(t.type) || !Number.isFinite(new Date(t.date).getTime()) ||
      typeof t.merchant !== 'string' || !t.merchant.trim() || typeof t.notes !== 'string' || !s.categories.some((c: LocalCategory) => c.id === t.categoryId)) throw new Error('Invalid transaction.');
    if (t.walletId) {
      const wallet = s.wallets.find((w: Wallet) => w.id === t.walletId);
      if (!wallet || wallet.currency !== t.currency) throw new Error('Transaction currency must match its wallet.');
    }
  }
  for (const b of s.budgets) {
    requireAmount(b.totalAmount, true);
    if (!isCurrency(b.currency) || !b.name?.trim() || !['monthly', 'weekly', 'yearly'].includes(b.period) || !Number.isFinite(new Date(b.startDate).getTime()) || !Array.isArray(b.categories)) throw new Error('Invalid budget.');
    for (const c of b.categories) { requireAmount(c.amount, true); if (!s.categories.some((x: LocalCategory) => x.id === c.category_id)) throw new Error('Invalid budget category.'); }
    if (b.categories.reduce((sum: number, c: any) => sum + c.amount, 0) > b.totalAmount) throw new Error('Category limits cannot exceed the total budget.');
  }
  for (const r of s.recurring) { requireAmount(r.amount, true); if (!r.name?.trim() || !isCurrency(r.currency) || !Number.isFinite(new Date(r.nextDate).getTime())) throw new Error('Invalid recurring entry.'); }
  for (const g of s.goals) { requireAmount(g.targetAmount, true); requireAmount(g.currentAmount); if (g.currentAmount < 0 || !g.name?.trim() || !isCurrency(g.currency)) throw new Error('Invalid savings goal.'); }
  for (const r of s.rules) if (!r.keyword?.trim() || !s.categories.some((c: LocalCategory) => c.label === r.category) || typeof r.enabled !== 'boolean') throw new Error('Invalid category rule.');
}
