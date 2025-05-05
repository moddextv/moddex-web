import { heroui } from '@heroui/react';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}'
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
    heroui({
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
            twitch: '#714ab8',
            discord: '#7289da'
          }
        },
        light: {
          layout: {},
          colors: {
            background: '#FFFFFF',
            foreground: '#333333',
            focus: '#A1A1AA',
            primary: {
              50: '#101010',
              100: '#202020',
              200: '#303030',
              300: '#404040',
              400: '#606060',
              500: '#808080',
              600: '#A0A0A0',
              700: '#C0C0C0',
              800: '#E0E0E0',
              900: '#F0F0F0'
            },
            twitch: '#714ab8',
            discord: '#7289da'
          }
        }
      }
    })
  ]
};
