import React, { useMemo } from "react";
import { View, type ViewProps } from "react-native";
import { cn } from "../lib/utils";
import { randomTilt } from "../lib/animations";

interface SketchCardProps extends ViewProps {
  tilt?: number;
  variant?: "default" | "nested" | "accent";
  className?: string;
  children: React.ReactNode;
}

export function SketchCard({
  tilt,
  variant = "default",
  className,
  children,
  style,
  ...props
}: SketchCardProps) {
  const rotation = useMemo(() => tilt ?? randomTilt(1.5), [tilt]);

  const variantClass = {
    default: "bg-surface-container-lowest",
    nested: "bg-surface-container-low",
    accent: "bg-tertiary-container",
  }[variant];

  return (
    <View
      className={cn(
        "rounded-card-lg p-5",
        variantClass,
        className
      )}
      style={[
        {
          transform: [{ rotate: `${rotation}deg` }],
          // Ambient shadow per DESIGN.md
          shadowColor: "#131D23",
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
