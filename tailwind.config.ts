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
          950: '#0d2318',
          900: '#1b4332',
          800: '#2d6a4f',
          700: '#40916c',
          600: '#52b788',
          500: '#74c69d',
          400: '#95d5b2',
          300: '#b7e4c7',
          200: '#d8f3dc',
          100: '#f0faf3',
          50:  '#f8fdf9',
        },
        cream: {
          50:  '#fefdf9',
          100: '#fefae0',
          200: '#f8f2d0',
          300: '#f0e6b8',
          400: '#e4d49a',
        },
        gold: {
          300: '#f5d87a',
          400: '#f0c040',
          500: '#d4a017',
          600: '#b8860b',
          700: '#8b6508',
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
