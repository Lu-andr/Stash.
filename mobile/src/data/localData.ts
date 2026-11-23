import { useMemo } from 'react';
import { useLocalState } from '../context/LocalDataContext';
import { projectLocalData } from './selectors';
export { formatMoney } from '../utils/formatting';
export type { TransactionType, GoalItem, RecurringItem, BudgetItem } from './selectors';
export function useLocalData() { const state = useLocalState(), day = new Date().toDateString(); return useMemo(() => projectLocalData(state), [state, day]); }
