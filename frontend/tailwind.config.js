/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "background": "#F8FAFC",
        "surface": "#FFFFFF",
        "on-surface": "#0F1B3D",
        "on-surface-variant": "#4B5563",
        "primary": "#2563EB",
        "primary-container": "#EFF6FF",
        "on-primary-container": "#1E3A8A",
        "secondary": "#3B82F6",
        "outline-variant": "#E2E8F0",
        "outline": "#94A3B8",
        "error": "#DC2626",
        "error-container": "#FEE2E2",
        "on-error-container": "#991B1B",
        "dark-navy": "#0F1B2E",
        "gold-logo": "#FBBF24"
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "full": "9999px"
      },
      spacing: {
        "sidebar-width": "240px",
        "gutter": "24px",
        "topbar-height": "72px",
        "margin-page": "32px",
        "stack-sm": "8px",
        "stack-md": "16px"
      },
      fontFamily: {
        "body-default": ["Inter", "Geist Sans", "sans-serif"],
        "body-sm": ["Inter", "Geist Sans", "sans-serif"],
        "headline-lg": ["Outfit", "Geist Sans", "sans-serif"],
        "headline-md": ["Outfit", "Geist Sans", "sans-serif"],
        "label-caps": ["Inter", "Geist Sans", "sans-serif"],
        "technical-data": ["Geist Mono", "monospace"]
      }
    },
  },
  plugins: [],
}
