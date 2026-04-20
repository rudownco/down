import React from 'react';
import { Text } from 'react-native';
import type { SectionLabelProps } from './types';

export function SectionLabel({ text }: SectionLabelProps) {
  return (
    <Text style={{
      fontFamily: 'BeVietnamPro_500Medium',
      fontSize: 11,
      color: '#677A86',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
    }}>
      {text}
    </Text>
  );
}
