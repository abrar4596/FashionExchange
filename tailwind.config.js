/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vinted: {
          50: '#E6FAFA',
          100: '#C9F0EE',
          200: '#A8E3E1',
          300: '#86CDCF',
          400: '#3EA8AC',
          500: '#007782', // Signature Vinted Deep Sea Teal
          600: '#00656F',
          700: '#004654',
          800: '#00333D',
          900: '#112E33',
        },
        surface: {
          dark: '#15191A',     // Primary text & headings
          muted: '#5A6566',    // Subtitle & secondary metadata
          border: '#B6BEBF',   // Normal borders & inactive icons
          divider: '#E1E6E6',  // Subtle dividers & card lines
          light: '#F8FAFA',    // Background surfaces & card hover
          canvas: '#FFFFFF',
        },
        accent: {
          gold: '#F9BB42',     // Swap value / special badge
          success: '#28865A',  // Success states & available pills
          danger: '#D9383A',   // Error & cancellation
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      aspectRatio: {
        'vinted': '310 / 430',
      },
      boxShadow: {
        'card': '0 1px 4px 0 rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 24px 0 rgba(0, 0, 0, 0.12)',
        'drawer': '-4px 0 24px 0 rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}
