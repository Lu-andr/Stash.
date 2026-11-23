import { initialState, validateState, newId, requireAmount, walletBalance, type LocalState, type Wallet, type LocalTransaction } from './domain';
export const STORAGE_KEY = 'stash.local.v1';
export interface DeviceStorage { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<void> }
type Collection = 'budgets' | 'recurring' | 'goals' | 'rules' | 'categories';
const copy = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
function freeze<T>(value: T): T {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
export function createLocalStore(storage: DeviceStorage) {
  let state = freeze(initialState()), ready = false;
  let initialization: Promise<void> | null = null, queue: Promise<unknown> = Promise.resolve();
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach(listener => listener());
  const load = () => {
    if (ready) return Promise.resolve();
    if (initialization) return initialization;
    initialization = (async () => {
      const raw = await storage.getItem(STORAGE_KEY);
      const candidate = raw === null ? initialState() : JSON.parse(raw);
      validateState(candidate);
      if (raw === null) await storage.setItem(STORAGE_KEY, JSON.stringify(candidate));
      state = freeze(candidate); ready = true; emit();
    })().catch(error => { initialization = null; throw error; });
    return initialization;
  };
  const mutate = (change: (draft: LocalState) => void): Promise<void> => {
    const task = queue.then(async () => {
      await load();
      const next = copy(state);
      change(next); validateState(next);
      // Publish only after the complete snapshot is durable. A failed write leaves UI and disk unchanged.
      await storage.setItem(STORAGE_KEY, JSON.stringify(next));
      state = freeze(next); emit();
    });
    queue = task.catch(() => undefined);
    return task;
  };
  return {
    load, getSnapshot: () => state, isReady: () => ready,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    updateSettings: (patch: Partial<LocalState['settings']>) => mutate(s => { s.settings = { ...s.settings, ...patch }; }),
    updateCollection: <K extends Collection>(key: K, updater: (items: LocalState[K]) => LocalState[K]) =>
      mutate(s => { s[key] = updater(s[key]); }),
    saveWallet: (input: Omit<Wallet, 'id'>, id?: string) => mutate(s => {
      const name = input.name.trim();
      requireAmount(input.initialBalance);
      if (!name || name.length > 80) throw new Error('Enter a wallet name of 1–80 characters.');
      const index = id ? s.wallets.findIndex(w => w.id === id) : -1;
      if (id && index < 0) throw new Error('This wallet no longer exists.');
      if (index >= 0 && s.wallets[index].currency !== input.currency && s.transactions.some(t => t.walletId === id))
        throw new Error('Currency cannot change while the wallet has transactions. Create a separate wallet for another currency.');
      const wallet = { ...input, name, id: id ?? newId('wallet') };
      if (index >= 0) s.wallets[index] = wallet; else s.wallets.push(wallet);
    }),
    deleteWallet: (id: string) => mutate(s => {
      if (!s.wallets.some(w => w.id === id)) throw new Error('This wallet no longer exists.');
      s.wallets = s.wallets.filter(w => w.id !== id);
      // Keep history and its original currency. Deleting a wallet never silently deletes transactions.
      s.transactions.forEach(t => { if (t.walletId === id) delete t.walletId; });
    }),
    saveTransaction: (input: Omit<LocalTransaction, 'id' | 'currency' | 'createdAt' | 'category' | 'iconName'>, id?: string) => mutate(s => {
      const wallet = s.wallets.find(w => w.id === input.walletId);
      if (!wallet) throw new Error('Choose an active wallet first.');
      const index = id ? s.transactions.findIndex(t => t.id === id) : -1;
      if (id && index < 0) throw new Error('This transaction no longer exists.');
      if (index >= 0 && s.transactions[index].currency !== wallet.currency) throw new Error('Choose a wallet with the original transaction currency.');
      requireAmount(input.amount, true);
      const merchant = input.merchant.trim();
      if (!merchant || merchant.length > 120) throw new Error('Enter a description of 1–120 characters.');
      let category = s.categories.find(c => c.id === input.categoryId);
      if (!category) throw new Error('Choose a category.');
      if (!id && input.categoryId === 'cat-8') {
        const rule = s.rules.find(r => r.enabled && r.keyword.split(',').some(k => k.trim() && merchant.toLowerCase().includes(k.trim().toLowerCase())));
        const match = rule && s.categories.find(c => c.label === rule.category);
        if (rule && match) { category = match; rule.matchCount += 1; }
      }
      const transaction: LocalTransaction = {
        ...input, merchant, categoryId: category.id, category: category.label, iconName: category.iconName,
        id: id ?? newId('transaction'), currency: wallet.currency,
        createdAt: index >= 0 ? s.transactions[index].createdAt : new Date().toISOString(),
      };
      if (index >= 0) s.transactions[index] = transaction; else s.transactions.unshift(transaction);
    }),
    deleteTransaction: (id: string) => mutate(s => {
      if (!s.transactions.some(t => t.id === id)) throw new Error('This transaction no longer exists.');
      s.transactions = s.transactions.filter(t => t.id !== id);
    }),
    walletBalance: (wallet: Wallet) => walletBalance(state, wallet),
  };
}
