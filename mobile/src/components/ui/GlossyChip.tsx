import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Line, Polyline } from 'react-native-svg';
import { type AppTheme } from '../../constants/theme';
import { useAppTheme, useThemedStyles } from '../../context/useAppTheme';

export type ChipIconType = 'coin' | 'chart' | 'shield';

interface GlossyChipProps {
  icon: ChipIconType;
  rotation?: number; // degrees, default 6
}

// Inline SVG icons — monochrome gradient filled
function CoinIcon() {
  const { Palette } = useAppTheme();

  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={Palette.silverTop} strokeWidth="1.8" />
      <Circle cx="12" cy="12" r="5" stroke={Palette.silverBottom} strokeWidth="1.4" />
      <Path d="M12 8v8M9 10.5h4.5a1.5 1.5 0 010 3H9" stroke={Palette.silverTop} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function ChartIcon() {
  const { Palette } = useAppTheme();

  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Polyline points="3,17 8,12 13,14 21,6" stroke={Palette.silverTop} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="3" y1="21" x2="21" y2="21" stroke={Palette.silverBottom} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function ShieldIcon() {
  const { Palette } = useAppTheme();

  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3L4 7v5c0 5.25 3.5 10.15 8 11 4.5-.85 8-5.75 8-11V7L12 3z" stroke={Palette.silverTop} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 12l2 2 4-4" stroke={Palette.silverBottom} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const iconMap: Record<ChipIconType, React.FC> = {
  coin: CoinIcon,
  chart: ChartIcon,
  shield: ShieldIcon,
};

export const GlossyChip: React.FC<GlossyChipProps> = ({ icon, rotation = 6 }) => {
  const { Palette } = useAppTheme();
  const styles = useThemedStyles(createStyles);

  const IconComponent = iconMap[icon];

  return (
    <View
      style={[
        styles.wrapper,
        { transform: [{ rotate: `${rotation}deg` }] },
      ]}
    >
      <LinearGradient
        colors={[Palette.detailTop, Palette.detailBottom]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.chip}
      >
        {/* Top highlight line */}
        <View style={styles.topHighlight} />
        <IconComponent />
      </LinearGradient>
    </View>
  );
};

const CHIP_HEIGHT = 40;
const CHIP_WIDTH = 48;

const createStyles = ({ Colors }: AppTheme) => StyleSheet.create({
  wrapper: {
    // Inline in text — display handled by parent
  },
  chip: {
    height: CHIP_HEIGHT,
    width: CHIP_WIDTH,
    borderRadius: CHIP_HEIGHT / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.highlightTop,
  },
});
