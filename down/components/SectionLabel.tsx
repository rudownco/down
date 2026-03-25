import React from "react";
import { Text, type TextProps } from "react-native";
import { cn } from "../lib/utils";

interface SectionLabelProps extends TextProps {
  text: string;
  className?: string;
}

export function SectionLabel({ text, className, ...props }: SectionLabelProps) {
  return (
    <Text
      className={cn(
        "font-label text-xs text-on-surface-variant tracking-widest uppercase",
        className
      )}
      {...props}
    >
      {text}
    </Text>
  );
}
