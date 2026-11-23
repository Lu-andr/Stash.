import React, { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { localStore } from '../data/repository';
import { Colors, Spacing, Typography } from '../constants/theme';
const LocalDataContext = createContext(false);
export function LocalDataProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false), [error, setError] = useState('');
  const load = () => { setError(''); localStore.load().then(() => setReady(true)).catch(e => setError(e.message || 'Could not open local data.')); };
  useEffect(load, []);
  if (!ready) return <View style={styles.loading}>
    {error ? <><Text style={styles.text}>{error}</Text><Text style={styles.text}>Stored data has not been replaced. You can retry opening it.</Text>
      <TouchableOpacity accessibilityRole="button" onPress={load}><Text style={styles.retry}>Retry</Text></TouchableOpacity></> :
      <><ActivityIndicator color={Colors.primary} /><Text style={styles.text}>Opening local data…</Text></>}
  </View>;
  return <LocalDataContext.Provider value={true}>{children}</LocalDataContext.Provider>;
}
export function useLocalState() {
  if (!useContext(LocalDataContext)) throw new Error('Local data provider is missing.');
  return useSyncExternalStore(localStore.subscribe, localStore.getSnapshot, localStore.getSnapshot);
}
const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bgBase, padding: Spacing.xl, gap: Spacing.base },
  text: { color: Colors.textSecondary, fontSize: Typography.base, textAlign: 'center' },
  retry: { color: Colors.primary, padding: Spacing.base, fontSize: Typography.md },
});
