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
      "keymanager": "540px",
      "extension": "579px",
      "extension2": "588px",
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
      keyframes: {
        // Currency dropdown animation
        'popup-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'popup-out': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },

        // Keymanager dropdown animation
        'reveal': {
          '0%': { maxHeight: '0' },
          '100%': { maxHeight: '1500px' },
        },
        'conceal': {
          '0%': { maxHeight: '1500px' },
          '100%': { maxHeight: '0' },
        },

        // Keymanager Add Controller
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeOut: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      
      animation: {
        // Currency dropdown animation
        'popup-in': 'popup-in 0.2s ease-out forwards',
        'popup-out': 'popup-out 0.2s ease-out forwards',
        
        // Keymanager dropdown animation
        'reveal': 'reveal 0.5s ease-in-out forwards',
        'conceal': 'conceal 0.5s ease-in-out forwards',

        // Keymanager Add Controller
        'fade-in': 'fadeIn 0.2s ease-in-out forwards',
        'fade-out': 'fadeOut 0.2s ease-in-out forwards',
      },
    },
    colors: {
      background: "#f8fafb",
      black: "#000000",
      white: "#ffffff",
      purple: "#646eb5",
      lightPurple: "#8993d1",
      green: '#4cca61',
      red: '#ca4c4c',
    },
  },
  plugins: [],
}
export default config
