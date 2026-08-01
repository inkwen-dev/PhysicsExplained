import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 品牌色彩：深紫色 + 青色
        primary: {
          DEFAULT: "#2d1b4e",      // 深紫色
          light: "#1a0d2e",         // 更深的紫色
        },
        accent: {
          DEFAULT: "#00d4ff",      // 青色/蓝绿色
          light: "#00bcd4",        // 稍深的青色
        },
        background: "#ffffff",
        surface: "#f8f9fa",
        "bg-secondary": "#f8f9fa",
        border: "#ecf0f1",
        "text-primary": "#2c3e50",
        "text-secondary": "#7f8c8d",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} satisfies Config;

export default config;

