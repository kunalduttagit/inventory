import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        ink: {
          900: '#191918',
          700: '#37352f',
          500: '#787774',
          300: '#cfcecb',
        },
        paper: '#fbfbfa',
        night: {
          bg: '#191919',
          surface: '#242424',
          border: '#2f2f2e',
          text: '#e7e6e2',
          muted: '#9b9a96',
        },
        accent: {
          blue: '#2383e2',
          green: '#0f9d58',
          orange: '#d9730d',
          red: '#e03e3e',
          purple: '#6940a5',
        },
      },
    },
  },
  plugins: [],
};

export default config;
