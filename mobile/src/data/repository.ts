import AsyncStorage from '@react-native-async-storage/async-storage';
import { createLocalStore } from './localStore';
export const localStore = createLocalStore(AsyncStorage);
