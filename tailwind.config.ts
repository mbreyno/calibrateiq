import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: 'rgb(var(--forest-950) / <alpha-value>)',
          900: 'rgb(var(--forest-900) / <alpha-value>)',
          800: 'rgb(var(--forest-800) / <alpha-value>)',
          700: 'rgb(var(--forest-700) / <alpha-value>)',
          600: 'rgb(var(--forest-600) / <alpha-value>)',
          500: 'rgb(var(--forest-500) / <alpha-value>)',
          400: 'rgb(var(--forest-400) / <alpha-value>)',
          300: 'rgb(var(--forest-300) / <alpha-value>)',
          200: 'rgb(var(--forest-200) / <alpha-value>)',
          100: 'rgb(var(--forest-100) / <alpha-value>)',
          50:  'rgb(var(--forest-50)  / <alpha-value>)',
        },
        cream: {
          50:  'rgb(var(--cream-50)  / <alpha-value>)',
          100: 'rgb(var(--cream-100) / <alpha-value>)',
          200: 'rgb(var(--cream-200) / <alpha-value>)',
          300: 'rgb(var(--cream-300) / <alpha-value>)',
          400: 'rgb(var(--cream-400) / <alpha-value>)',
        },
        gold: {
          300: 'rgb(var(--gold-300) / <alpha-value>)',
          400: 'rgb(var(--gold-400) / <alpha-value>)',
          500: 'rgb(var(--gold-500) / <alpha-value>)',
          600: 'rgb(var(--gold-600) / <alpha-value>)',
          700: 'rgb(var(--gold-700) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter var', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(27,67,50,0.08), 0 1px 2px -1px rgba(27,67,50,0.05)',
        'card-hover': '0 4px 12px 0 rgba(27,67,50,0.12), 0 2px 4px -2px rgba(27,67,50,0.08)',
        'elevated': '0 10px 40px -10px rgba(27,67,50,0.18)',
      },
    },
  },
  plugins: [],
}
export default config
