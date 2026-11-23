import { useMemo, useSyncExternalStore } from 'react';
import { getAppTheme, type AppTheme } from '../constants/theme';
import { localStore } from '../data/repository';

// Stable snapshots update every mounted consumer without remounting screens or forms.
const getSnapshot = () => getAppTheme(localStore.getSnapshot().settings.theme);
export function useAppTheme() {
  return useSyncExternalStore(localStore.subscribe, getSnapshot, getSnapshot);
}
export function useThemedStyles<T>(factory: (theme: AppTheme) => T): T {
  const theme = useAppTheme();
  return useMemo(() => factory(theme), [factory, theme]);
}
