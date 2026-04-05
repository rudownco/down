import React from 'react';
import { View, Text, Pressable } from 'react-native';
import type { RSVPButtonsProps } from './index';
import type { RSVPStatus } from '../../types';

const BUTTONS: {
  status: RSVPStatus;
  label: string;
  emoji: string;
  bg: string;
  selectedBg: string;
  text: string;
  selectedText: string;
}[] = [
  { status: 'going',     label: "I'm down", emoji: '✅', bg: '#E5EFF8', selectedBg: '#BFEFBF', text: '#374955', selectedText: '#264F2C' },
  { status: 'maybe',     label: 'Maybe...',  emoji: '🤔', bg: '#E5EFF8', selectedBg: '#C4E7FF', text: '#374955', selectedText: '#274B5F' },
  { status: 'not_going', label: 'Flaking',   emoji: '😢', bg: '#E5EFF8', selectedBg: '#FFDAD6', text: '#374955', selectedText: '#93000A' },
];

export function RSVPButtons({ selectedStatus, onSelect, disabled }: RSVPButtonsProps) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {BUTTONS.map((btn) => {
        const isSelected = selectedStatus === btn.status;
        return (
          <Pressable
            key={btn.status}
            disabled={disabled}
            onPress={() => onSelect(btn.status)}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              paddingVertical: 12,
              borderRadius: 14,
              backgroundColor: isSelected ? btn.selectedBg : btn.bg,
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <Text style={{ fontSize: 18 }}>{btn.emoji}</Text>
            <Text style={{
              fontFamily: 'PlusJakartaSans_700Bold',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              color: isSelected ? btn.selectedText : btn.text,
            }}>
              {btn.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
