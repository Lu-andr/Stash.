import { Palette } from './src/constants/theme';
import 'react-native-gesture-handler';
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Palette.silverTop,
    background: Palette.bgBase,
    card: Palette.bgInset,
    text: Palette.textPrimary,
    border: Palette.borderHairline,
    notification: Palette.danger,
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    // Manrope — premium geometric sans used throughout the app
    'Manrope-Regular':   require('./assets/fonts/Manrope-Regular.ttf'),
    'Manrope-Medium':    require('./assets/fonts/Manrope-Medium.ttf'),
    'Manrope-SemiBold':  require('./assets/fonts/Manrope-SemiBold.ttf'),
    'Manrope-Bold':      require('./assets/fonts/Manrope-Bold.ttf'),
    'Manrope-ExtraBold': require('./assets/fonts/Manrope-ExtraBold.ttf'),
    // Editorial Display Serif fonts for highlighted text
    'PlayfairDisplay-Bold':   require('./assets/fonts/PlayfairDisplay-Bold.ttf'),
    'PlayfairDisplay-Italic': require('./assets/fonts/PlayfairDisplay-Italic.ttf'),
    'InstrumentSerif-Regular': require('./assets/fonts/InstrumentSerif-Regular.ttf'),
    'InstrumentSerif-Italic':  require('./assets/fonts/InstrumentSerif-Italic.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: Palette.bgBase, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Palette.silverTop} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer theme={navigationTheme}>
          <AppNavigator />
        </NavigationContainer>
        <StatusBar style="light" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
