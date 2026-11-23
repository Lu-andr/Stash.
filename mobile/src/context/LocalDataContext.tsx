import React, { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { View, Image, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { localStore } from '../data/repository';
import { Spacing, Typography, type AppTheme } from '../constants/theme';
import { useAppTheme, useThemedStyles } from './useAppTheme';
const LocalDataContext = createContext(false);
export function LocalDataProvider({ children }: { children: React.ReactNode }) {
  const { Colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);

  const [ready, setReady] = useState(false), [error, setError] = useState('');
  const load = () => { setError(''); localStore.load().then(() => setReady(true)).catch(e => setError(e.message || 'Could not open local data.')); };
  useEffect(load, []);
  if (!ready) return <View style={styles.loading}>
    <Image source={require('../../assets/perago-icon.png')} style={{ width: 96, height: 96 }} resizeMode="contain" accessibilityLabel="PeraGo" />
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
const createStyles = ({ Colors }: AppTheme) => StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bgBase, padding: Spacing.xl, gap: Spacing.base },
  text: { color: Colors.textSecondary, fontSize: Typography.base, textAlign: 'center' },
  retry: { color: Colors.primary, padding: Spacing.base, fontSize: Typography.md },
});
