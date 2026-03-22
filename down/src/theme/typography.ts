// Design System — Typography Scale
// Translated from ios/down/DesignSystem/AppTypography.swift
// Uses system font (SF Pro on iOS, Roboto on Android)
// The Swift app used .rounded design — closest cross-platform is system default

import { Platform, TextStyle } from 'react-native';

type FontWeight = TextStyle['fontWeight'];

function font(size: number, weight: FontWeight): TextStyle {
  return {
    fontSize: size,
    fontWeight: weight,
    // On iOS, we can approximate the rounded look
    ...(Platform.OS === 'ios' ? { fontFamily: 'System' } : {}),
  };
}

export const Typography = {
  largeTitle: font(34, '900'),
  title1: font(28, '700'),
  title2: font(22, '700'),
  title3: font(20, '600'),
  headline: font(17, '600'),
  body: font(16, '400'),
  callout: font(15, '400'),
  subhead: font(14, '500'),
  footnote: font(13, '400'),
  caption: font(12, '400'),
  caption2: font(11, '500'),
} as const;
