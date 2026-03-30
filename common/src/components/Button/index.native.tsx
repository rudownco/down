import React, { useRef } from 'react';
import { Pressable, Text, Animated, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { ButtonProps } from './index';

const PRESS_CONFIG   = { toValue: 0.95, duration: 100, useNativeDriver: true };
const RELEASE_CONFIG = { toValue: 1.0,  duration: 200, useNativeDriver: true };

export function Button({
  title,
  onPress,
  variant = 'primary',
  fullWidth = true,
  disabled = false,
  loading = false,
}: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn  = () => { if (!disabled) Animated.timing(scale, PRESS_CONFIG).start(); };
  const handlePressOut = () => { Animated.timing(scale, RELEASE_CONFIG).start(); };

  const labelColor = (variant === 'primary' || variant === 'danger') ? '#FFFFFF' : '#3F6377';

  const inner = (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      {loading
        ? <ActivityIndicator color={labelColor} />
        : <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: labelColor }}>{title}</Text>
      }
    </View>
  );

  return (
    <Animated.View style={{ transform: [{ scale }], opacity: disabled ? 0.5 : 1, width: fullWidth ? '100%' : undefined }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
      >
        {variant === 'primary' ? (
          <LinearGradient
            colors={['#3F6377', '#4A7A92']}
            style={{ borderRadius: 16, paddingVertical: 16, paddingHorizontal: 24, alignItems: 'center',
              shadowColor: '#3F6377', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 }}
          >
            {inner}
          </LinearGradient>
        ) : (
          <View style={{
            borderRadius: 16,
            paddingVertical: 16,
            paddingHorizontal: 24,
            alignItems: 'center',
            backgroundColor:
              variant === 'secondary' ? '#C4E7FF' :
              variant === 'danger'    ? '#BA1A1A' : 'transparent',
            borderWidth: variant === 'outline' ? 2 : 0,
            borderColor: '#B6C9D7',
          }}>
            {inner}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}
