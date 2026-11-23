import type { Currency } from '../data/domain';
export interface Category { id: string; name: string; icon: string; color: string; type: 'income' | 'expense' | 'both'; is_default: boolean }
export interface Transaction {
  id: string; type: 'income' | 'expense'; amount: number; currency: Currency; wallet_id?: string;
  category_id?: string; category?: Category; title: string; date: string; payment_method?: string;
  notes?: string; created_at: string; updated_at?: string;
}
