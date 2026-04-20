import React from "react";
import type { ButtonProps } from "./types";

const VARIANT_CLASSES: Record<string, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary/90 shadow-md shadow-primary/20",
  secondary:
    "bg-primary-container text-on-primary-container hover:bg-primary-container/80",
  outline:
    "border-2 border-outline-variant text-primary hover:bg-surface-container",
  ghost: "text-primary hover:bg-surface-container",
  danger: "bg-error text-on-error hover:bg-error/90",
};

export function Button({
  title,
  onPress,
  variant = "primary",
  fullWidth = true,
  disabled = false,
  loading = false,
  iconRight,
  className,
}: ButtonProps) {
  return (
    <button
      onClick={onPress}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-full
        font-heading font-semibold text-base px-7 py-4
        transition-all duration-150 active:scale-[0.97]
        disabled:opacity-50 disabled:pointer-events-none
        ${fullWidth ? "w-full" : ""}
        ${VARIANT_CLASSES[variant]}
        ${className ?? ""}
      `}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {title}
          {iconRight}
        </>
      )}
    </button>
  );
}
