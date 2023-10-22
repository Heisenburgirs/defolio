import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    borderRadius: {
      "5": "5px",
      "10": "10px",
      "15": "15px",
      "20": "20px"
    },
    screens: {
      "sm": "250px",
      "base": "420px",
      "md": "768px",
      "lg": "1100px",
      "xl": "1400px"
    },
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontSize: {
        xxsmall: '12px',
        xsmall: '14px',
        small: '16px',
        medium: '20px',
        large: '32px',
        xlarge: '48px',
      },
    },
    colors: {
      black: "#000000",
      white: "#ffffff"
    },
  },
  plugins: [],
}
export default config
