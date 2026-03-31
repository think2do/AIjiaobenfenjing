/**
 * 设计令牌 — 灵镜 Design System v1.0 (PRD 3.0)
 */

export const Colors = {
  primary: "#5F33E1",
  primaryBg: "#EBE5FD",

  background: "#FFFFFF",
  card: "#FFFFFF",
  foreground: "#1A1A1A",
  mutedForeground: "#717171",
  border: "#EBEBEB",
  greyBg: "#F7F7F7",

  // 语义色
  success: "#34C759",
  successBg: "#E8F9ED",
  error: "#FF3B30",
  errorBg: "#FFEDEB",
  warning: "#FF9500",
  warningBg: "#FFF3E0",
  info: "#007AFF",
  infoBg: "#E5F1FF",
};

export const Radius = {
  sm: 8,
  m: 12,
  lg: 16,
  xl: 24,
  pill: 100,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Shadows = {
  standard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, // ~#00000015
    shadowRadius: 16,
    elevation: 3,
  },
  elevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, // ~#00000020
    shadowRadius: 24,
    elevation: 6,
  },
  purple: {
    shadowColor: "#5F33E1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.19, // ~#5F33E130
    shadowRadius: 16,
    elevation: 6,
  },
};

export const Fonts = {
  primary: "Inter",
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    title: 34,
  },
};
