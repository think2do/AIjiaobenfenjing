export interface Panel {
  panel_number: number;
  narrative_phase: string;
  scene: string;
  characters: string;
  dialogue: string;
  camera_angle: string;
  mood: string;
  image_prompt: string;
  image_url: string;
}

export interface ScriptResult {
  panels: Panel[];
  style: string;
  duration: number;
  aspect_ratio: string;
}

export type StyleKey =
  | "suspense_twist"
  | "comedy_absurd"
  | "healing_warm"
  | "dark_revenge"
  | "wuxia_fantasy"
  | "superpower_fantasy"
  | "horror_thriller"
  | "sweet_romance";

export interface StyleOption {
  key: StyleKey;
  label: string;
  emoji: string;
}

export const STYLE_OPTIONS: StyleOption[] = [
  { key: "suspense_twist", label: "悬疑反转", emoji: "🔍" },
  { key: "comedy_absurd", label: "搞笑沙雕", emoji: "😂" },
  { key: "healing_warm", label: "治愈温情", emoji: "🌸" },
  { key: "dark_revenge", label: "暗黑爆爽", emoji: "🔥" },
  { key: "wuxia_fantasy", label: "古风仙侠", emoji: "⚔️" },
  { key: "superpower_fantasy", label: "超能力奇幻", emoji: "✨" },
  { key: "horror_thriller", label: "恐怖惊悚", emoji: "👻" },
  { key: "sweet_romance", label: "甜宠恋爱", emoji: "💕" },
];

export const PANEL_OPTIONS = [4, 6, 9, 12];
