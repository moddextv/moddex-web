import { nextui } from '@nextui-org/react';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        lato: ['var(--font-lato)', 'Helvetica', 'sans-serif'],
        cairo: ['var(--font-cairo)', 'Helvetica', 'sans-serif']
      }
    }
  },
  darkMode: 'class',
  plugins: [
    nextui({
      prefix: 'mc',
      themes: {
        dark: {
          layout: {},
          colors: {
            background: '#18181B',
            foreground: '#D4D4D8',
            focus: '#A1A1AA',
            primary: {
              50: '#F4F4F4',
              100: '#F4F4F4',
              200: '#E4E4E4',
              300: '#D4D4D4',
              400: '#A1A1A1',
              500: '#717171',
              600: '#525252',
              700: '#3F3F3F',
              800: '#272727',
              900: '#181818'
            },
            success: {
              100: '#6dec8c',
              200: '#28a745',
              300: '#186429'
            },
            danger: {
              100: '#e47575',
              200: '#ef3e3e',
              300: '#a70e0e'
            },
            twitch: '#714ab8',
            discord: '#7289da'
          }
        }
      }
    })
  ]
};
