import React, { useMemo } from 'react';
import { View } from 'react-native';
import type { CardProps } from './index';

function randomTilt(max: number) {
  return (Math.random() * 2 - 1) * max;
}

const VARIANT_COLORS = {
  default: '#FFFFFF',
  nested:  '#EBF5FD',
  accent:  '#FFDBD0',
};

export function Card({ children, tilt, variant = 'default', style, ...props }: CardProps & { style?: any }) {
  const rotation = useMemo(() => tilt ?? randomTilt(1.5), [tilt]);

  return (
    <View
      style={[
        {
          backgroundColor: VARIANT_COLORS[variant],
          borderRadius: 24,
          padding: 20,
          transform: [{ rotate: `${rotation}deg` }],
          shadowColor: '#131D23',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.06,
          shadowRadius: 32,
          elevation: 4,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
