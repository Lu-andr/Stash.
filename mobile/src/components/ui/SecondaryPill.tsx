import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Palette, Colors, Typography, Radius, Gradients } from '../../constants/theme';

interface SecondaryPillProps {
  label: string;
  onPress?: () => void;
}

export const SecondaryPill: React.FC<SecondaryPillProps> = ({ label, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      style={styles.touch}
    >
      <LinearGradient
        colors={[Palette.detailTop, Palette.detailBottom]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.pill}
      >
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touch: {
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  pill: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    fontSize: 14,
    fontWeight: Typography.semibold,
    color: Colors.text,
    letterSpacing: -0.1,
  },
});
