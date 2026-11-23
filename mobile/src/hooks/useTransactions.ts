import { useLocalState } from '../context/LocalDataContext';
import { localStore } from '../data/repository';
import { transactionView } from '../data/domain';
interface Options { type?: 'income' | 'expense'; category_id?: string; search?: string; sort_by?: string; start_date?: string; end_date?: string }
export function useTransactions(options: Options = {}) {
  const state = useLocalState();
  const query = options.search?.trim().toLowerCase() ?? '';
  const transactions = state.transactions.filter(t => (!options.type || t.type === options.type) &&
    (!options.category_id || t.categoryId === options.category_id) &&
    (!query || (t.merchant + ' ' + t.category + ' ' + t.notes).toLowerCase().includes(query)) &&
    (!options.start_date || t.date >= options.start_date) && (!options.end_date || t.date <= options.end_date))
    .sort((a, b) => options.sort_by === 'amount_desc' ? b.amount - a.amount : options.sort_by === 'date_asc' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date))
    .map(t => transactionView(state, t));
  return { transactions, isLoading: false, hasMore: false, loadMore: () => {}, refresh: async () => {},
    total: transactions.length, error: null, deleteTransaction: localStore.deleteTransaction };
}
