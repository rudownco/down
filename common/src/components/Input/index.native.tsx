import React from 'react';
import { View, Text, TextInput } from 'react-native';
import type { InputProps } from './types';

export function Input({ label, value, onChangeText, placeholder, multiline, numberOfLines, icon }: InputProps) {
  return (
    <View style={{ gap: 8 }}>
      {label && (
        <Text style={{ fontFamily: 'BeVietnamPro_500Medium', fontSize: 11, color: '#677A86', letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 4 }}>
          {label}
        </Text>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#DAE4EC', borderRadius: 14, overflow: 'hidden' }}>
        {icon && (
          <Text style={{ paddingLeft: 16, fontSize: 16 }}>{icon}</Text>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor='#677A86'
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={{
            flex: 1,
            fontFamily: 'BeVietnamPro_400Regular',
            fontSize: 16,
            color: '#131D23',
            paddingHorizontal: 16,
            paddingVertical: 16,
          }}
        />
      </View>
    </View>
  );
}
