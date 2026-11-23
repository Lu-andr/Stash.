// ─── PeraGo Design Tokens ────────────────────────────────
// Single source of truth. No raw hex values inside components.

// ── Raw palette ──────────────────────────────────────────────────────────────
const darkPalette = {
  // Canvas / surfaces
  bgBase:          '#071426',
  bgInset:         '#0B1C33',
  bgRaisedTop:     '#152F50',
  bgRaisedBottom:  '#0D213B',
  bgGlass:         'rgba(13,33,59,0.92)',
  bgRaisedAlt:     '#1A385C', // inactive nav button

  // Raised details and charts
  surfaceHigh:     '#21436B',
  detailTop:       '#204267',
  detailBottom:    '#102842',
  chartMuted:      '#315B85',
  chartMid:        '#4A7FAD',
  chartSoft:       '#7AADD6',

  // Borders / highlights
  borderHairline:  'rgba(147,197,253,0.14)',
  highlightTop:    'rgba(186,220,255,0.18)', // inset 0 1px 0 — used as borderTop tint
  shadowLift:      'rgba(0,0,0,0.55)',

  // Text
  textPrimary:     '#EFF6FF',
  textSecondary:   '#B7CAE4',
  textMuted:       '#98B0D0',

  // Ice blue (CTA / active state); silver names retained for compatibility
  silverTop:       '#A9D6FF',
  silverBottom:    '#63ACF2',
  onSilver:        '#071426',

  // Hero fade stops (for LinearGradient)
  heroFade0:       '#214B7B',
  heroFade1:       '#16375E',
  heroFade2:       '#0C223E',
  heroFade3:       '#071426',

  // Semantic / financial
  income:          '#7CE0A6',
  warning:         '#F5B453',
  danger:          '#FF7A72',
  incomeAlpha:     'rgba(124,224,166,0.14)',
  warningAlpha:    'rgba(245,180,83,0.14)',
  dangerAlpha:     'rgba(255,122,114,0.14)',

  // Grid overlay
  gridLine:        'rgba(147,197,253,0.06)',
} as const;

export type ThemeMode = 'dark' | 'light';
type ThemePalette = { [K in keyof typeof darkPalette]: string };
const lightPalette: ThemePalette = {
  bgBase: '#F3F7FC', bgInset: '#E8EFF8', bgRaisedTop: '#FFFFFF', bgRaisedBottom: '#F5F8FD',
  bgGlass: 'rgba(255,255,255,0.96)', bgRaisedAlt: '#E2EBF6',
  surfaceHigh: '#D6E4F4', detailTop: '#EDF4FC', detailBottom: '#DCE9F8',
  chartMuted: '#486B92', chartMid: '#2A6099', chartSoft: '#447AAE',
  borderHairline: 'rgba(24,57,96,0.18)', highlightTop: 'rgba(255,255,255,0.9)',
  shadowLift: 'rgba(19,48,81,0.16)',
  textPrimary: '#102842', textSecondary: '#37536F', textMuted: '#4C6580',
  silverTop: '#225C99', silverBottom: '#174979', onSilver: '#FFFFFF',
  heroFade0: '#DCEBFC', heroFade1: '#E6F0FC', heroFade2: '#EFF5FC', heroFade3: '#F3F7FC',
  income: '#176A3B', warning: '#805000', danger: '#B4232D',
  incomeAlpha: 'rgba(23,106,59,0.10)', warningAlpha: 'rgba(128,80,0,0.10)', dangerAlpha: 'rgba(180,35,45,0.10)',
  gridLine: 'rgba(24,57,96,0.08)',
};

// ── Semantic aliases (shared by both appearances) ───────────────────────────
function createColors(Palette: ThemePalette, light: boolean) {
  return {

  // Backgrounds
  background:    Palette.bgBase,
  secondaryBg:   Palette.bgInset,
  surface:       Palette.bgRaisedTop,    // compat alias → top of raised gradient
  surfaceAlt:    Palette.bgRaisedAlt,
  surfaceHigh:   Palette.surfaceHigh,
  surfaceInput:  Palette.bgInset,
  bgBase:        Palette.bgBase,
  bgInset:       Palette.bgInset,
  bgGlass:       Palette.bgGlass,

  // Borders / highlights
  border:        Palette.borderHairline,
  borderAlt:     Palette.borderHairline,
  highlightTop:  Palette.highlightTop,

  // Primary accent — ice blue on deep navy
  primary:       Palette.silverTop,
  primaryDark:   Palette.silverBottom,
  primaryLight:  light ? 'rgba(34,92,153,0.12)' : 'rgba(99,172,242,0.16)',

  // Silver (used in new premium components via Gradients.silver directly)
  silverTop:     Palette.silverTop,
  silverBottom:  Palette.silverBottom,

  // Text
  text:          Palette.textPrimary,
  textSecondary: Palette.textSecondary,
  textMuted:     Palette.textMuted,
  textLight:     Palette.textSecondary,
  textInverse:   Palette.onSilver,
  onSilver:      Palette.onSilver,

  // Financial semantics
  income:        Palette.income,
  incomeLight:   Palette.incomeAlpha,
  expense:       Palette.danger,
  expenseLight:  Palette.dangerAlpha,
  warning:       Palette.warning,
  warningLight:  Palette.warningAlpha,
  danger:        Palette.danger,
  dangerLight:   Palette.dangerAlpha,
  success:       Palette.income,
  successLight:  Palette.incomeAlpha,
  error:         Palette.danger,
  errorLight:    Palette.dangerAlpha,

  // Overlays
  overlay:       'rgba(0, 0, 0, 0.7)',
  overlayLight:  light ? 'rgba(24,57,96,0.04)' : 'rgba(255,255,255,0.04)',
  gridLine:      Palette.gridLine,

  // Legacy compat aliases
  card:          Palette.bgRaisedTop,
  cardAlt:       Palette.bgRaisedAlt,
  darkBackground: Palette.bgBase,
  darkCard:      Palette.bgRaisedTop,
  darkBorder:    Palette.borderHairline,
  darkText:      Palette.textPrimary,
  darkTextSecondary: Palette.textSecondary,
  primaryOverlay: light ? 'rgba(34,92,153,0.10)' : 'rgba(99,172,242,0.12)',
  errorLight2:   Palette.dangerAlpha,
  successLight2: Palette.incomeAlpha,
  warningLight2: Palette.warningAlpha,
  shadow:        Palette.shadowLift,
  divider:       Palette.borderHairline,
  borderLight:   Palette.bgRaisedAlt,
} as const;
}

// Gradient arrays — pass directly to LinearGradient colors prop
function createGradients(Palette: ThemePalette) { return {
  raised:      [Palette.bgRaisedTop, Palette.bgRaisedBottom] as const,
  silver:      [Palette.silverTop,   Palette.silverBottom]   as const,
  heroFade:    [Palette.heroFade0, Palette.heroFade1, Palette.heroFade2, Palette.heroFade3] as const,
  heroFadeLocations: [0, 0.28, 0.62, 1] as const,
} as const; }

// ── Typography ────────────────────────────────────────────────────────────────
export const Typography = {
  // Size scale (px)
  xs:    12,   // caption min size
  sm:    12,   // maps to caption
  base:  14,   // body
  md:    16,   // row title / button
  lg:    18,
  xl:    20,   // title
  '2xl': 26,
  '3xl': 32,
  '4xl': 36,
  '5xl': 40,   // display

  // Display / hero
  display: 40,
  displayLineHeight: 44,

  // Font weights
  regular:   '400' as const,
  medium:    '500' as const,
  semibold:  '600' as const,
  bold:      '700' as const,
  extrabold: '800' as const,

  // Tracking
  displayTracking: -0.03,
  titleTracking:   -0.02,

  // Font families
  fontFamily: 'Manrope-SemiBold',
  fontFamilyFallback: 'System',
  fontSans: 'Manrope-SemiBold',
  fontSansBold: 'Manrope-Bold',
  fontSansRegular: 'Manrope-Regular',
  fontHighlight: 'PlayfairDisplay-Bold',
  fontHighlightItalic: 'PlayfairDisplay-Italic',
  fontSerif: 'InstrumentSerif-Regular',
  fontSerifItalic: 'InstrumentSerif-Italic',
} as const;

// ── Spacing ──────────────────────────────────────────────────────────────────
export const Spacing = {
  xs:    4,
  sm:    8,
  md:    12,
  base:  16,
  lg:    20,   // screen side padding
  xl:    24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

// ── Border radius ─────────────────────────────────────────────────────────────
export const Radius = {
  sm:    6,
  md:    10,
  lg:    16,
  xl:    20,
  '2xl': 28,   // cards
  row:   24,   // list rows
  full:  9999, // pills / circles
} as const;

// ── Shadows ───────────────────────────────────────────────────────────────────
const darkShadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.55,
    shadowRadius: 32,
    elevation: 14,
  },
  // Compat: named "primary" kept for any existing callers
  primary: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;

// ── Touch targets ─────────────────────────────────────────────────────────────
export const Touch = {
  min: 44,    // px — minimum touch target size
  gap: 8,     // px — minimum gap between targets
} as const;

function buildTheme(mode: ThemeMode) {
  const light = mode === 'light';
  const Palette: ThemePalette = light ? lightPalette : darkPalette;
  const Shadow = light ? {
    sm: { ...darkShadow.sm, shadowOpacity: 0.08 },
    md: { ...darkShadow.md, shadowOpacity: 0.10 },
    lg: { ...darkShadow.lg, shadowOpacity: 0.14 },
    primary: { ...darkShadow.primary, shadowOpacity: 0.12 },
  } : darkShadow;
  return { mode, isLight: light, Palette, Colors: createColors(Palette, light), Gradients: createGradients(Palette), Shadow };
}
export type AppTheme = ReturnType<typeof buildTheme>;
export const Themes = { dark: buildTheme('dark'), light: buildTheme('light') };
export function getAppTheme(mode: ThemeMode) { return Themes[mode]; }
