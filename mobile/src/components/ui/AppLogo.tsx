import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography, Radius, type AppTheme } from '../../constants/theme';
import { useAppTheme, useThemedStyles } from '../../context/useAppTheme';

interface AppLogoProps {
  size?: 'sm' | 'md';
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 'md' }) => {
  const { Palette } = useAppTheme();
  const styles = useThemedStyles(createStyles);

  const circleSize = size === 'sm' ? 24 : 28;
  const fontSize = size === 'sm' ? 11 : 13;

  return (
    <View style={styles.container}>
      {/* 28px glossy dark circle monogram */}
      <LinearGradient
        colors={[Palette.detailTop, Palette.detailBottom]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[
          styles.circle,
          { width: circleSize, height: circleSize, borderRadius: circleSize / 2 },
        ]}
      >
        {/* top highlight */}
        <View
          style={[
            styles.topHighlight,
            { width: circleSize - 2, borderRadius: (circleSize - 2) / 2 },
          ]}
        />
        <Text style={[styles.monogram, { fontSize }]}>P</Text>
      </LinearGradient>

      {/* Wordmark */}
      <Text style={styles.wordmark}>PeraGo</Text>
    </View>
  );
};

const createStyles = ({ Colors }: AppTheme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    height: 1,
    backgroundColor: Colors.highlightTop,
  },
  monogram: {
    color: Colors.text,
    fontWeight: Typography.bold,
    letterSpacing: -0.5,
  },
  wordmark: {
    fontSize: 16,
    fontWeight: Typography.semibold,
    color: Colors.text,
    letterSpacing: -0.3,
  },
});
