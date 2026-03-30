import React, { useRef } from 'react';
import { Pressable, Text, Animated, View } from 'react-native';
import type { ChipProps } from './index';

const PRESS_CONFIG   = { toValue: 0.92, duration: 80,  useNativeDriver: true };
const RELEASE_CONFIG = { toValue: 1.0,  duration: 150, useNativeDriver: true };

const VARIANT_STYLES = {
  primary:   { bg: '#C4E7FF', text: '#274B5F', selectedBg: '#3F6377', selectedText: '#FFFFFF' },
  secondary: { bg: '#BFEFBF', text: '#264F2C', selectedBg: '#3E6842', selectedText: '#FFFFFF' },
  tertiary:  { bg: '#FFDBD0', text: '#5D4037', selectedBg: '#76574E', selectedText: '#FFFFFF' },
  neutral:   { bg: '#DAE4EC', text: '#374955', selectedBg: '#3F6377', selectedText: '#FFFFFF' },
};

export function Chip({
  label,
  emoji,
  selected = false,
  onPress,
  variant = 'neutral',
}: ChipProps) {
  const scale  = useRef(new Animated.Value(1)).current;
  const styles = VARIANT_STYLES[variant];

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => Animated.timing(scale, PRESS_CONFIG).start()}
        onPressOut={() => Animated.timing(scale, RELEASE_CONFIG).start()}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 9999,
          backgroundColor: selected ? styles.selectedBg : styles.bg,
        }}
      >
        {emoji && <Text style={{ fontSize: 18 }}>{emoji}</Text>}
        <Text style={{
          fontFamily: 'BeVietnamPro_500Medium',
          fontSize: 14,
          color: selected ? styles.selectedText : styles.text,
        }}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
