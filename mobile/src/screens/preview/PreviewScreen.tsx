import React, { useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Dimensions, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

import { Palette, Colors, Gradients, Typography, Spacing, Radius } from '../../constants/theme';

// Micro-previews of each screen rendered as rich static cards
// These are deliberate simplified-render cards, not full screen embeds

const PHONE_W = 220;
const PHONE_H = 420;
const CANVAS_COLOR = Palette.bgInset;

// ── Mini Onboarding Preview ───────────────────────────────────────────────────
function OnboardingPreview() {
  return (
    <LinearGradient
      colors={[Palette.heroFade0, Palette.heroFade1, Palette.heroFade2, Palette.bgBase]}
      locations={[0, 0.28, 0.62, 1]}
      style={styles.screenFill}
    >
      {/* Grid overlay */}
      <View style={styles.gridOverlay} />

      {/* Ghost ₹ */}
      <Text style={styles.ghostRupee}>₹</Text>

      {/* Logo */}
      <View style={styles.miniLogo}>
        <LinearGradient colors={[Palette.detailTop, Palette.detailBottom]} style={styles.miniLogoCircle}>
          <Text style={styles.miniLogoText}>S</Text>
        </LinearGradient>
        <Text style={styles.miniWordmark}>Stash</Text>
      </View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Bottom content */}
      <View style={styles.miniBottomContent}>
        <Text style={styles.miniHeadlineSecondary}>Your Money,</Text>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.miniHeadlineMuted}>Clearly </Text>
          <Text style={styles.miniHeadlinePrimary}>Tracked</Text>
        </View>
        <Text style={styles.miniBody} numberOfLines={3}>
          Track spending, set budgets and see where every rupee goes, all in one private, beautifully simple place.
        </Text>

        {/* Silver button */}
        <LinearGradient
          colors={[Palette.silverTop, Palette.silverBottom]}
          style={styles.miniPrimaryBtn}
        >
          <Text style={styles.miniPrimaryBtnText}>Get Started</Text>
        </LinearGradient>
      </View>
    </LinearGradient>
  );
}

// ── Mini Home Preview ─────────────────────────────────────────────────────────
function HomePreview() {
  return (
    <View style={[styles.screenFill, { backgroundColor: Palette.bgBase, paddingHorizontal: 12, paddingTop: 14 }]}>
      {/* Top row */}
      <View style={styles.miniTopRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <LinearGradient colors={[Palette.detailTop, Palette.detailBottom]} style={[styles.miniLogoCircle, { width: 16, height: 16 }]}>
            <Text style={{ color: Palette.textPrimary, fontSize: 7, fontWeight: '700' }}>S</Text>
          </LinearGradient>
          <Text style={{ color: Palette.textPrimary, fontSize: 9, fontWeight: '600' }}>Stash</Text>
        </View>
        <View style={styles.miniMenuBtn}>
          <Ionicons name="menu-outline" size={10} color={Palette.textSecondary} />
        </View>
      </View>

      {/* Headline */}
      <View style={{ marginTop: 10, gap: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={styles.miniDisplayPrimary}>Keep </Text>
          <View style={styles.miniChip}><Ionicons name="cash-outline" size={8} color={Palette.silverTop} /></View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={styles.miniDisplaySecondary}>Your Money </Text>
          <View style={styles.miniChip}><Ionicons name="bar-chart-outline" size={8} color={Palette.silverTop} /></View>
        </View>
        <Text style={styles.miniDisplayPrimary}>Simple</Text>
      </View>

      {/* Search bar */}
      <View style={styles.miniSearchBar}>
        <Ionicons name="search-outline" size={9} color={Palette.textMuted} />
        <Text style={{ color: Palette.textMuted, fontSize: 9, marginLeft: 4 }}>Search transactions</Text>
      </View>

      {/* Featured pill */}
      <LinearGradient colors={[Palette.bgRaisedTop, Palette.bgRaisedBottom]} style={styles.miniFeaturedPill}>
        <LinearGradient colors={[Palette.silverTop, Palette.silverBottom]} style={styles.miniIconTile}>
          <Ionicons name="wallet-outline" size={9} color={Palette.bgBase} />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={{ color: Palette.textPrimary, fontSize: 8, fontWeight: '600' }}>Balance ₹1,24,580.50</Text>
          <Text style={{ color: Palette.textSecondary, fontSize: 7 }}>₹640 safe to spend today</Text>
        </View>
      </LinearGradient>

      {/* Transaction rows */}
      {[
        { m: 'Swiggy', a: '−₹480', c: Palette.textPrimary },
        { m: 'Uber',   a: '−₹212', c: Palette.textPrimary },
        { m: 'Netflix',a: '−₹649', c: Palette.textPrimary },
        { m: 'Salary', a: '+₹85,000', c: '#7CE0A6' },
      ].map(t => (
        <LinearGradient key={t.m} colors={[Palette.bgRaisedTop, Palette.bgRaisedBottom]} style={styles.miniTxnRow}>
          <View style={styles.miniTxnIcon} />
          <Text style={{ color: Palette.textPrimary, fontSize: 8, flex: 1, fontWeight: '600' }}>{t.m}</Text>
          <Text style={{ color: t.c, fontSize: 8, fontWeight: '600' }}>{t.a}</Text>
        </LinearGradient>
      ))}

      {/* Floating nav bar */}
      <View style={styles.miniFloatNav}>
        <LinearGradient colors={[Palette.silverTop, Palette.silverBottom]} style={styles.miniNavBtn} />
        <View style={[styles.miniNavBtn, { backgroundColor: Palette.bgRaisedAlt }]} />
        <View style={[styles.miniNavBtn, { backgroundColor: Palette.bgRaisedAlt }]} />
        <LinearGradient colors={[Palette.silverTop, Palette.silverBottom]} style={[styles.miniNavBtn, { width: 22, height: 22, borderRadius: 11 }]} />
      </View>
    </View>
  );
}

// ── Mini Insights Preview ─────────────────────────────────────────────────────
function InsightsPreview() {
  return (
    <View style={[styles.screenFill, { backgroundColor: Palette.bgBase, paddingHorizontal: 12, paddingTop: 14 }]}>
      {/* Hero info card */}
      <LinearGradient colors={[Palette.bgRaisedTop, Palette.bgRaisedBottom]} style={styles.miniHeroCard}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: Palette.textPrimary, fontSize: 9, fontWeight: '600', marginBottom: 4 }}>Budget Alerts</Text>
          <Text style={{ color: Palette.textSecondary, fontSize: 7.5, lineHeight: 11 }}>
            Get notified before you overspend on food, travel or shopping.
          </Text>
          <LinearGradient colors={[Palette.detailTop, Palette.detailBottom]} style={styles.miniSecPill}>
            <Text style={{ color: Palette.textPrimary, fontSize: 7, fontWeight: '600' }}>Enable</Text>
          </LinearGradient>
        </View>
        <View style={styles.miniIllustration}>
          <Ionicons name="bar-chart-outline" size={28} color={Palette.chartMuted} />
        </View>
      </LinearGradient>

      {/* Featured pill */}
      <LinearGradient colors={[Palette.bgRaisedTop, Palette.bgRaisedBottom]} style={styles.miniFeaturedPill}>
        <LinearGradient colors={[Palette.silverTop, Palette.silverBottom]} style={styles.miniIconTile}>
          <Ionicons name="sparkles-outline" size={9} color={Palette.bgBase} />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={{ color: Palette.textPrimary, fontSize: 8, fontWeight: '600' }}>Smart Rules</Text>
          <Text style={{ color: Palette.textSecondary, fontSize: 7 }}>Auto-categorize your transactions</Text>
        </View>
      </LinearGradient>

      {/* Budget progress */}
      <View style={{ marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ color: Palette.textPrimary, fontSize: 8, fontWeight: '600' }}>Budget Health</Text>
          <Text style={{ color: Palette.textSecondary, fontSize: 7 }}>72% used</Text>
        </View>
        <View style={styles.miniProgressTrack}>
          <LinearGradient colors={[Palette.silverTop, Palette.silverBottom]} style={[styles.miniProgressBar, { width: '72%' }]} />
        </View>
      </View>

      {/* Insight rows */}
      {[
        { title: 'Overspent categories', badge: 2 },
        { title: 'Recurring subscriptions', badge: 5 },
        { title: 'Uncategorized', badge: 8 },
      ].map(item => (
        <LinearGradient key={item.title} colors={[Palette.bgRaisedTop, Palette.bgRaisedBottom]} style={styles.miniInsightRow}>
          <View style={styles.miniInsightIcon}>
            <View style={styles.miniInsightBadge}><Text style={{ color: Palette.bgBase, fontSize: 6, fontWeight: '700' }}>{item.badge}</Text></View>
          </View>
          <Text style={{ color: Palette.textPrimary, fontSize: 8, flex: 1, fontWeight: '600' }}>{item.title}</Text>
          <Ionicons name="chevron-forward" size={8} color={Palette.textMuted} />
        </LinearGradient>
      ))}

      {/* Floating nav bar */}
      <View style={styles.miniFloatNav}>
        <View style={[styles.miniNavBtn, { backgroundColor: Palette.bgRaisedAlt }]} />
        <LinearGradient colors={[Palette.silverTop, Palette.silverBottom]} style={styles.miniNavBtn} />
        <View style={[styles.miniNavBtn, { backgroundColor: Palette.bgRaisedAlt }]} />
        <LinearGradient colors={[Palette.silverTop, Palette.silverBottom]} style={[styles.miniNavBtn, { width: 22, height: 22, borderRadius: 11 }]} />
      </View>
    </View>
  );
}

// ── Phone Frame ───────────────────────────────────────────────────────────────
function PhoneFrame({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.frameOuter}>
      {/* Screen label */}
      <Text style={styles.frameLabel}>{label}</Text>

      {/* Phone body */}
      <View style={styles.phoneBody}>
        {/* Notch */}
        <View style={styles.notch} />
        {/* Content area */}
        <View style={styles.phoneScreen}>{children}</View>
        {/* Home indicator */}
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
}

// ── Preview Screen ────────────────────────────────────────────────────────────
type Nav = NativeStackNavigationProp<RootStackParamList>;

export const PreviewScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Canvas background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: CANVAS_COLOR }]} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeBtn}
            accessibilityLabel="Close preview"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={20} color={Palette.bgBase} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Screen Preview</Text>
          <Text style={styles.headerSub}>A · B · C</Text>
        </View>

        {/* Horizontal scroll with phone frames */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.framesRow}
          style={{ flex: 1 }}
        >
          <PhoneFrame label="A — Onboarding">
            <OnboardingPreview />
          </PhoneFrame>

          <PhoneFrame label="B — Home">
            <HomePreview />
          </PhoneFrame>

          <PhoneFrame label="C — Budget Health">
            <InsightsPreview />
          </PhoneFrame>
        </ScrollView>

        {/* Navigate links */}
        <View style={styles.linksRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Onboarding')}
            style={styles.linkBtn}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={Gradients.raised}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.linkBtnInner}
            >
              <Text style={styles.linkBtnText}>Onboarding</Text>
              <Ionicons name="arrow-forward" size={12} color={Colors.textSecondary} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Main')}
            style={styles.linkBtn}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={Gradients.raised}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.linkBtnInner}
            >
              <Text style={styles.linkBtnText}>Home</Text>
              <Ionicons name="arrow-forward" size={12} color={Colors.textSecondary} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Main')}
            style={styles.linkBtn}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={Gradients.raised}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.linkBtnInner}
            >
              <Text style={styles.linkBtnText}>Insights</Text>
              <Ionicons name="arrow-forward" size={12} color={Colors.textSecondary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: Typography.xl,
    fontWeight: Typography.semibold,
    color: Palette.bgBase,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.4)',
    fontWeight: Typography.medium,
  },

  framesRow: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xl,
    alignItems: 'flex-start',
    paddingVertical: Spacing.base,
  },
  frameOuter: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  frameLabel: {
    fontSize: 11,
    fontWeight: Typography.semibold,
    color: 'rgba(0,0,0,0.5)',
    letterSpacing: 0.3,
  },
  phoneBody: {
    width: PHONE_W,
    height: PHONE_H,
    borderRadius: 32,
    backgroundColor: Palette.bgBase,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
  },
  notch: {
    width: 60,
    height: 14,
    borderRadius: 7,
    backgroundColor: Palette.bgBase,
    alignSelf: 'center',
    position: 'absolute',
    top: 6,
    zIndex: 10,
  },
  phoneScreen: {
    flex: 1,
    marginTop: 20,
    overflow: 'hidden',
  },
  homeIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginBottom: 6,
  },

  linksRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    gap: Spacing.sm,
  },
  linkBtn: { flex: 1, borderRadius: Radius.full, overflow: 'hidden' },
  linkBtnInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, height: 40, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 8,
  },
  linkBtnText: { fontSize: 11, fontWeight: Typography.semibold, color: Colors.text },

  // ── Mini-screen styles ──
  screenFill: { flex: 1 },
  gridOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0.03, backgroundColor: '#FFF',
  },
  ghostRupee: {
    position: 'absolute',
    top: 10, left: -10,
    fontSize: 150, fontWeight: '700',
    color: '#FFF', opacity: 0.04,
    zIndex: 0,
  },
  miniLogo: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingTop: 10, zIndex: 1,
  },
  miniLogoCircle: {
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)',
  },
  miniLogoText: { color: Palette.textPrimary, fontSize: 8, fontWeight: '700' },
  miniWordmark: { color: Palette.textPrimary, fontSize: 9, fontWeight: '600' },
  miniBottomContent: {
    paddingHorizontal: 12, paddingBottom: 12, gap: 5, zIndex: 1,
  },
  miniHeadlineSecondary: { color: Palette.textSecondary, fontSize: 18, fontWeight: '600', letterSpacing: -0.5, lineHeight: 22 },
  miniHeadlineMuted: { color: Palette.textSecondary, fontSize: 18, fontWeight: '600', letterSpacing: -0.5, lineHeight: 22 },
  miniHeadlinePrimary: { color: Palette.textPrimary, fontSize: 18, fontWeight: '600', letterSpacing: -0.5, lineHeight: 22 },
  miniBody: { color: Palette.textSecondary, fontSize: 8, lineHeight: 12, marginTop: 4 },
  miniPrimaryBtn: {
    height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 6,
  },
  miniPrimaryBtnText: { color: Palette.bgBase, fontSize: 9, fontWeight: '600' },

  miniTopRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8,
  },
  miniMenuBtn: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Palette.bgRaisedTop, borderWidth: 0.5, borderColor: Palette.borderHairline,
    alignItems: 'center', justifyContent: 'center',
  },
  miniDisplayPrimary: { color: Palette.textPrimary, fontSize: 16, fontWeight: '600', letterSpacing: -0.4, lineHeight: 20 },
  miniDisplaySecondary: { color: Palette.textSecondary, fontSize: 16, fontWeight: '600', letterSpacing: -0.4, lineHeight: 20 },
  miniChip: {
    width: 24, height: 20, borderRadius: 10,
    backgroundColor: Palette.bgRaisedTop, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
    transform: [{ rotate: '6deg' }],
  },
  miniSearchBar: {
    height: 28, borderRadius: 10,
    backgroundColor: Palette.bgInset, borderWidth: 0.5, borderColor: Palette.borderHairline,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8,
    marginVertical: 6,
  },
  miniFeaturedPill: {
    height: 36, borderRadius: 18,
    borderWidth: 0.5, borderColor: Palette.borderHairline,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, gap: 6,
    marginBottom: 6,
  },
  miniIconTile: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  miniTxnRow: {
    height: 30, borderRadius: 10,
    borderWidth: 0.5, borderColor: Palette.borderHairline,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, gap: 6, marginBottom: 4,
  },
  miniTxnIcon: { width: 18, height: 18, borderRadius: 9, backgroundColor: Palette.bgRaisedAlt },
  miniFloatNav: {
    position: 'absolute', bottom: 8, left: 8, right: 8,
    height: 36, borderRadius: 18,
    backgroundColor: Palette.bgGlass,
    borderWidth: 0.5, borderColor: Palette.borderHairline,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 6,
  },
  miniNavBtn: { width: 18, height: 18, borderRadius: 9 },

  miniHeroCard: {
    borderRadius: 14, borderWidth: 0.5, borderColor: Palette.borderHairline,
    padding: 10, flexDirection: 'row', marginBottom: 6,
  },
  miniIllustration: {
    width: 40, alignItems: 'center', justifyContent: 'center',
  },
  miniSecPill: {
    height: 18, borderRadius: 9, paddingHorizontal: 8,
    alignItems: 'center', justifyContent: 'center', marginTop: 6, alignSelf: 'flex-start',
    borderWidth: 0.5, borderColor: Palette.borderHairline,
  },
  miniProgressTrack: {
    height: 8, borderRadius: 4, backgroundColor: Palette.bgInset,
    borderWidth: 0.5, borderColor: Palette.borderHairline, overflow: 'hidden',
  },
  miniProgressBar: { height: '100%', borderRadius: 4 },
  miniInsightRow: {
    height: 30, borderRadius: 10,
    borderWidth: 0.5, borderColor: Palette.borderHairline,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, gap: 6, marginBottom: 4,
  },
  miniInsightIcon: {
    width: 18, height: 18, borderRadius: 9, backgroundColor: Palette.bgBase,
    borderWidth: 0.5, borderColor: Palette.borderHairline,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  miniInsightBadge: {
    position: 'absolute', top: -3, right: -3,
    width: 9, height: 9, borderRadius: 4.5,
    backgroundColor: Palette.textPrimary, alignItems: 'center', justifyContent: 'center',
  },
});
