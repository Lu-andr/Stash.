const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const result = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  module._compile(result.outputText, filename);
};
const { createLocalStore, STORAGE_KEY } = require('../src/data/localStore.ts');
const { walletBalance, initialState } = require('../src/data/domain.ts');
const { projectLocalData } = require('../src/data/selectors.ts');
function memory() {
  const disk = new Map(); let failWrite = false;
  return { disk, failNext() { failWrite = true; },
    async getItem(k) { return disk.get(k) ?? null; },
    async setItem(k, v) { if (failWrite) { failWrite = false; throw new Error('Disk full'); } disk.set(k, v); } };
}
const entry = (overrides = {}) => ({ merchant: 'Groceries', notes: '', categoryId: 'cat-1', walletId: 'wallet-cash', amount: 10, type: 'expense', date: new Date().toISOString(), ...overrides });
async function setup() { const disk = memory(), store = createLocalStore(disk); await store.load(); return { disk, store }; }
test('fresh launch has neutral zero wallets and no fabricated ledger', async () => {
  const { store } = await setup(); const s = store.getSnapshot();
  assert.deepEqual(s.wallets.map(w => w.name), ['Cash', 'Main Wallet', 'Savings']);
  assert.equal(s.transactions.length, 0); assert.equal(s.wallets.reduce((sum, w) => sum + walletBalance(s, w), 0), 0);
  assert.equal(projectLocalData(s).LOCAL_ANALYTICS_MONTHS.every(m => m.amount === 0 && m.income === 0), true);
});
test('wallet add, edit, delete and settings survive a complete store restart', async () => {
  const { store, disk } = await setup();
  await store.saveWallet({ name: 'Travel', type: 'cash', currency: 'USD', initialBalance: 123.45 });
  let id = store.getSnapshot().wallets.at(-1).id;
  await store.saveWallet({ name: 'Holiday', type: 'savings', currency: 'USD', initialBalance: 234.56 }, id);
  await store.updateSettings({ currency: 'USD', budgetWarnings: false, theme: 'dark' });
  const restarted = createLocalStore(disk); await restarted.load();
  assert.equal(restarted.getSnapshot().wallets.find(w => w.id === id).name, 'Holiday');
  assert.deepEqual(restarted.getSnapshot().settings, { currency: 'USD', budgetWarnings: false, theme: 'dark' });
  assert.equal(projectLocalData(restarted.getSnapshot()).LOCAL_BALANCE, 234.56);
  await restarted.deleteWallet(id); const again = createLocalStore(disk); await again.load();
  assert.equal(again.getSnapshot().wallets.some(w => w.id === id), false);
});
test('transaction create, amount/type/wallet edits and deletion recalculate balances once', async () => {
  const { store, disk } = await setup();
  await store.saveTransaction(entry({ type: 'income', amount: 100 }));
  const id = store.getSnapshot().transactions[0].id;
  await store.saveTransaction(entry({ amount: 20, type: 'expense', walletId: 'wallet-main' }), id);
  let s = store.getSnapshot();
  assert.equal(walletBalance(s, s.wallets.find(w => w.id === 'wallet-cash')), 0);
  assert.equal(walletBalance(s, s.wallets.find(w => w.id === 'wallet-main')), -20);
  const restarted = createLocalStore(disk); await restarted.load();
  assert.equal(restarted.getSnapshot().transactions[0].id, id);
  assert.equal(restarted.getSnapshot().transactions.length, 1);
  await restarted.deleteTransaction(id);
  s = restarted.getSnapshot(); assert.equal(walletBalance(s, s.wallets.find(w => w.id === 'wallet-main')), 0);
  const again = createLocalStore(disk); await again.load(); assert.equal(again.getSnapshot().transactions.length, 0);
});
test('deleting a wallet preserves recorded history and currency', async () => {
  const { store, disk } = await setup(); await store.saveTransaction(entry()); const id = store.getSnapshot().transactions[0].id;
  await store.deleteWallet('wallet-cash');
  const restarted = createLocalStore(disk); await restarted.load();
  assert.equal(restarted.getSnapshot().transactions.find(t => t.id === id).currency, 'INR');
  assert.equal(restarted.getSnapshot().transactions[0].walletId, undefined);
  await restarted.saveTransaction(entry({ walletId: 'wallet-main' }), id);
  assert.equal(restarted.getSnapshot().transactions[0].walletId, 'wallet-main');
});
test('wallet currency and transaction currency cannot be silently changed', async () => {
  const { store } = await setup(); await store.saveTransaction(entry()); const id = store.getSnapshot().transactions[0].id;
  await assert.rejects(store.saveWallet({ name: 'Cash', type: 'cash', currency: 'USD', initialBalance: 0 }, 'wallet-cash'), /Currency cannot change/);
  await store.saveWallet({ name: 'Dollars', type: 'cash', currency: 'USD', initialBalance: 10 });
  const usd = store.getSnapshot().wallets.at(-1);
  await assert.rejects(store.saveTransaction(entry({ walletId: usd.id }), id), /original transaction currency/);
});
test('failed write neither changes visible state nor overwrites disk; next queued edit succeeds', async () => {
  const { store, disk } = await setup(); const before = store.getSnapshot(), raw = disk.disk.get(STORAGE_KEY);
  disk.failNext(); await assert.rejects(store.saveTransaction(entry()), /Disk full/);
  assert.equal(store.getSnapshot(), before); assert.equal(disk.disk.get(STORAGE_KEY), raw);
  await store.saveTransaction(entry()); assert.equal(store.getSnapshot().transactions.length, 1);
});
test('concurrent saves are serialized without losing transactions', async () => {
  const { store, disk } = await setup();
  await Promise.all(Array.from({ length: 25 }, (_, i) => store.saveTransaction(entry({ merchant: 'Item ' + i, amount: 1 }))));
  const restarted = createLocalStore(disk); await restarted.load();
  assert.equal(restarted.getSnapshot().transactions.length, 25);
  assert.equal(new Set(restarted.getSnapshot().transactions.map(t => t.id)).size, 25);
  assert.equal(walletBalance(restarted.getSnapshot(), restarted.getSnapshot().wallets[0]), -25);
});
test('an uncompleted disk write is never published', async () => {
  const disk = memory(); let release, blocked = false;
  const storage = { getItem: disk.getItem, setItem: async (k, v) => { if (blocked) await new Promise(r => { release = r; }); await disk.setItem(k, v); } };
  const store = createLocalStore(storage); await store.load(); blocked = true;
  const pending = store.saveTransaction(entry());
  await new Promise(r => setImmediate(r)); assert.equal(store.getSnapshot().transactions.length, 0);
  release(); await pending; assert.equal(store.getSnapshot().transactions.length, 1);
});
test('corrupt or unsupported saved data is not replaced with defaults', async () => {
  for (const raw of ['{broken', JSON.stringify({ version: 999 }), JSON.stringify({ ...initialState(), transactions: [{ id: 'bad', amount: NaN }] })]) {
    const disk = memory(); disk.disk.set(STORAGE_KEY, raw);
    const store = createLocalStore(disk); await assert.rejects(store.load());
    assert.equal(disk.disk.get(STORAGE_KEY), raw); assert.equal(store.isReady(), false);
  }
});
test('a failed initial read can be retried without resetting data', async () => {
  const disk = memory(); let first = true;
  disk.disk.set(STORAGE_KEY, JSON.stringify(initialState()));
  const store = createLocalStore({ setItem: disk.setItem, getItem: async k => { if (first) { first = false; throw new Error('Read failed'); } return disk.getItem(k); } });
  await assert.rejects(store.load(), /Read failed/); await store.load(); assert.equal(store.isReady(), true);
});
test('invalid transaction input and duplicate edits do not corrupt stored data', async () => {
  const { store } = await setup();
  for (const patch of [{ amount: NaN }, { amount: Infinity }, { amount: -1 }, { amount: 1.001 }, { amount: 0 }, { walletId: 'missing' }, { merchant: ' ' }, { categoryId: 'missing' }, { date: 'invalid' }]) await assert.rejects(store.saveTransaction(entry(patch)));
  await assert.rejects(store.saveTransaction(entry(), 'missing'));
  assert.equal(store.getSnapshot().transactions.length, 0);
});
test('budgets, rules, categories, recurring expenses and goals persist', async () => {
  const { store, disk } = await setup(), currency = 'INR';
  await store.updateCollection('categories', prev => [...prev, { id: 'custom', label: 'Home', iconName: 'home-outline' }]);
  await store.updateCollection('budgets', prev => [...prev, { id: 'b1', name: 'Food limit', totalAmount: 100, currency, period: 'monthly', startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(), isRecurring: true, categories: [] }]);
  await store.updateCollection('recurring', prev => [...prev, { id: 'r1', name: 'Rent', amount: 10, currency, frequency: 'monthly', nextDate: new Date().toISOString(), category: 'Home', iconName: 'home-outline' }]);
  await store.updateCollection('goals', prev => [...prev, { id: 'g1', name: 'Reserve', targetAmount: 100, currentAmount: 0, targetDate: '', currency, iconName: 'flag-outline' }]);
  await store.updateCollection('rules', prev => [...prev, { id: 'rule', keyword: 'coffee', category: 'Food', categoryIcon: 'fast-food-outline', enabled: true, matchCount: 0 }]);
  await store.saveTransaction(entry({ merchant: 'Coffee', categoryId: 'cat-8' }));
  assert.equal(store.getSnapshot().transactions[0].categoryId, 'cat-1');
  assert.equal(store.getSnapshot().rules[0].matchCount, 1);
  const restarted = createLocalStore(disk); await restarted.load();
  for (const key of ['budgets', 'recurring', 'goals', 'rules']) assert.equal(restarted.getSnapshot()[key].length, 1);
  assert.equal(restarted.getSnapshot().categories.at(-1).label, 'Home');
  assert.equal(projectLocalData(restarted.getSnapshot()).LOCAL_TOTAL_SPENT, 10);
});
test('category rules preserve an explicitly selected category', async () => {
  const { store } = await setup();
  await store.updateCollection('rules', () => [{ id: 'r', keyword: 'coffee', category: 'Food', categoryIcon: 'fast-food-outline', enabled: true, matchCount: 0 }]);
  await store.saveTransaction(entry({ merchant: 'Coffee', categoryId: 'cat-3' }));
  assert.equal(store.getSnapshot().transactions[0].categoryId, 'cat-3');
});
test('reports are calculated from actual local entries and never mix currencies', async () => {
  const { store } = await setup(); await store.saveWallet({ name: 'Dollars', type: 'wallet', currency: 'USD', initialBalance: 50 });
  const usd = store.getSnapshot().wallets.at(-1).id;
  await store.saveTransaction(entry({ type: 'income', amount: 100 }));
  await store.saveTransaction(entry({ amount: 20 }));
  await store.saveTransaction(entry({ walletId: usd, amount: 5 }));
  let p = projectLocalData(store.getSnapshot());
  assert.equal(p.LOCAL_BALANCE, 80); assert.equal(p.LOCAL_ANALYTICS_MONTHS.at(-1).income, 100); assert.equal(p.LOCAL_ANALYTICS_MONTHS.at(-1).amount, 20);
  assert.equal(p.LOCAL_WEEKLY_TREND.reduce((sum, d) => sum + d.amount, 0), 20);
  await store.updateSettings({ currency: 'USD' }); p = projectLocalData(store.getSnapshot());
  assert.equal(p.LOCAL_BALANCE, 45); assert.equal(p.LOCAL_ANALYTICS_MONTHS.at(-1).amount, 5);
});
test('snapshots cannot be mutated outside the serialized store', async () => {
  const { store } = await setup(); assert.equal(Object.isFrozen(store.getSnapshot().wallets), true);
  assert.throws(() => store.getSnapshot().wallets.push({}), TypeError);
});
for (const currency of ['PHP', 'VND', 'KZT', 'UZS', 'ZAR', 'RUB']) {
  test(currency + ' wallets, transactions and report settings survive reload', async () => {
    const { store, disk } = await setup();
    await store.saveWallet({ name: 'Local wallet', type: 'wallet', currency, initialBalance: 100 });
    const walletId = store.getSnapshot().wallets.at(-1).id;
    await store.saveTransaction(entry({ walletId, amount: 12.25 }));
    await store.updateSettings({ currency });
    const restarted = createLocalStore(disk); await restarted.load();
    const state = restarted.getSnapshot();
    assert.equal(state.settings.currency, currency);
    assert.equal(state.wallets.find(w => w.id === walletId).currency, currency);
    assert.equal(state.transactions[0].currency, currency);
    assert.equal(projectLocalData(state).LOCAL_BALANCE, 87.75);
    assert.equal(state.wallets.find(w => w.id === 'wallet-cash').currency, 'INR');
  });
}

test('legacy v1 snapshot keeps its ledger and defaults to navy; light and dark persist', async () => {
  const { store, disk } = await setup();
  await store.saveTransaction(entry());
  const legacy = JSON.parse(disk.disk.get(STORAGE_KEY)); delete legacy.settings.theme;
  disk.disk.set(STORAGE_KEY, JSON.stringify(legacy));
  const restored = createLocalStore(disk); await restored.load();
  assert.equal(restored.getSnapshot().settings.theme, 'dark');
  assert.deepEqual(restored.getSnapshot().transactions, legacy.transactions);
  for (const theme of ['light', 'dark']) {
    await restored.updateSettings({ theme });
    const restarted = createLocalStore(disk); await restarted.load();
    assert.equal(restarted.getSnapshot().settings.theme, theme);
    assert.deepEqual(restarted.getSnapshot().transactions, legacy.transactions);
    assert.deepEqual(restarted.getSnapshot().wallets, legacy.wallets);
    assert.equal(restarted.getSnapshot().settings.currency, legacy.settings.currency);
  }
});
test('failed appearance save and invalid appearance cannot change published settings', async () => {
  const { store, disk } = await setup(); const before = store.getSnapshot();
  disk.failNext(); await assert.rejects(store.updateSettings({ theme: 'light' }), /Disk full/);
  assert.strictEqual(store.getSnapshot(), before);
  await assert.rejects(store.updateSettings({ theme: 'invalid' }));
  assert.strictEqual(store.getSnapshot(), before);
  await store.updateSettings({ theme: 'light' });
  assert.equal(store.getSnapshot().settings.theme, 'light');
});
test('both appearances provide readable text and action labels', () => {
  const { getAppTheme } = require('../src/constants/theme.ts');
  const luminance = color => {
    const rgb = color.slice(1).match(/../g).map(v => parseInt(v, 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
    return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
  };
  const contrast = (a, b) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  for (const mode of ['light', 'dark']) {
    const { Palette: p } = getAppTheme(mode);
    for (const fg of [p.textPrimary, p.textSecondary, p.textMuted, p.income, p.danger, p.warning])
      for (const bg of [p.bgBase, p.bgInset, p.bgRaisedTop, p.bgRaisedBottom]) assert.ok(contrast(fg, bg) >= 4.5, `${mode}: ${fg} on ${bg}`);
    for (const bg of [p.silverTop, p.silverBottom]) assert.ok(contrast(p.onSilver, bg) >= 4.5, `${mode}: action label`);
  }
});
test('Privacy Policy opens only the specified external URL and handles unavailable browser', async () => {
  const calls = [], alerts = []; let reject = false;
  const module = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync('src/utils/openPrivacyPolicy.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  new Function('require', 'module', 'exports', source)(name => {
    if (name === 'react-native') return { Linking: { async openURL(url) { calls.push(url); if (reject) throw new Error('No browser'); } }, Alert: { alert(...args) { alerts.push(args); } } };
    if (name === '../constants/legal') return require('../src/constants/legal.ts');
    throw new Error('Unexpected dependency: ' + name);
  }, module, module.exports);
  assert.equal(calls.length, 0);
  await module.exports.openPrivacyPolicy();
  assert.deepEqual(calls, ['https://loanshark.cc/privacy.html']);
  assert.equal(alerts.length, 0);
  reject = true; await module.exports.openPrivacyPolicy(); assert.equal(alerts.length, 1);
});
