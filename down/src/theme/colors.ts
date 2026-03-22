// Design System — Color Palette
// Translated from ios/down/DesignSystem/AppColors.swift

export const Colors = {
  // Backgrounds
  appBackground: '#1E3FAF',
  appBackgroundDeep: '#142A8A',
  overlayPanel: 'rgba(255, 255, 255, 0.14)',
  overlayPanelMedium: 'rgba(255, 255, 255, 0.22)',

  // Card Surfaces
  cardBackground: '#FFFFFF',
  cardBackgroundSecondary: '#F0F3FF',

  // Text — on blue backgrounds
  textOnBlue: '#FFFFFF',
  textOnBlueMuted: 'rgba(255, 255, 255, 0.65)',
  textOnBlueFaint: 'rgba(255, 255, 255, 0.38)',

  // Text — on white / card surfaces
  textPrimary: '#151933',
  textSecondary: '#6E7791',
  textTertiary: '#B2B7C8',

  // Accent
  accentBlue: '#4177F7',
  accentBlueMuted: '#E0E7FF',

  // Status
  statusVotingFg: '#D17D04',
  statusVotingBg: '#FFEFC7',
  statusConfirmedFg: '#1AA04F',
  statusConfirmedBg: '#D8F8E7',
  statusPendingFg: '#7D859E',
  statusPendingBg: '#EEEFF5',

  // UI Chrome
  divider: '#E5E8F0',
  inputBackground: '#F3F5FB',
  inputBorder: '#D1D6E5',

  // Avatar palette (deterministic by name hash)
  avatarPalette: [
    '#FE6B6B', // red
    '#4ECDC4', // teal
    '#45B7D1', // sky blue
    '#96CEB4', // sage
    '#FEB64F', // orange
    '#C681F6', // purple
    '#4FC294', // green
    '#FE7FA3', // pink
  ],
} as const;
