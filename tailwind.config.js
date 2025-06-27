/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e3a8a',
        secondary: '#dc2626',
        accent: '#16a34a',
        surface: '#f8fafc',
        background: '#ffffff',
        success: '#16a34a',
        warning: '#f59e0b',
        error: '#dc2626',
        info: '#3b82f6',
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['DM Sans', 'ui-sans-serif', 'system-ui'],
        mono: ['ui-monospace', 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Consolas', 'Liberation Mono', 'Menlo', 'Courier New', 'monospace']
      }
    },
  },
  plugins: [],
}