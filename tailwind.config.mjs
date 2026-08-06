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
      prefix: 'mdx',
      themes: {
        dark: {
          layout: {},
          colors: {
            background: '#0B0B0C',
            foreground: '#E7E7EA',
            focus: '#8A8A93',
            // neutral ramp, 900 = canvas -> 50 = brightest text. the chrome is
            // deliberately colourless; colour is reserved for the data itself.
            primary: {
              50: '#F5F5F7',
              100: '#E7E7EA',
              200: '#D2D2D8',
              300: '#B4B4BC',
              400: '#8A8A93',
              500: '#55555F',
              600: '#33333A',
              700: '#232326',
              800: '#111113',
              900: '#0B0B0C'
            },
            // heroui's own semantic tokens. without these its components fall
            // back to stock greys that belong to no palette -- and `content1`
            // is the surface behind every dropdown, tooltip and popover, so
            // leaving it unset is what made those read as foreign.
            // the ramp is lifted from `primary` above so a heroui surface sits
            // one step above the canvas rather than on it.
            default: {
              50: '#F5F5F7',
              100: '#E7E7EA',
              200: '#D2D2D8',
              300: '#B4B4BC',
              400: '#8A8A93',
              500: '#55555F',
              600: '#33333A',
              700: '#232326',
              800: '#111113',
              900: '#0B0B0C',
              DEFAULT: '#232326',
              foreground: '#E7E7EA'
            },
            // elevation: canvas -> raised surface -> hover -> pressed
            content1: '#111113',
            content2: '#232326',
            content3: '#33333A',
            content4: '#55555F',
            divider: '#232326',
            overlay: '#000000',

            // semantic role colours: the twitch mod sword is green, the vip
            // gem is pink. these are the only two hues the ui spends.
            mod: '#4ADE80',
            vip: '#F472B6',
            twitch: '#714ab8',
            discord: '#7289da'
          }
        },
        light: {
          layout: {},
          colors: {
            background: '#FFFFFF',
            foreground: '#18181B',
            focus: '#8A8A93',
            primary: {
              50: '#0B0B0C',
              100: '#18181B',
              200: '#2A2A2E',
              300: '#45454C',
              400: '#6E6E78',
              500: '#9A9AA4',
              600: '#C4C4CC',
              700: '#E2E2E7',
              800: '#F2F2F5',
              900: '#FFFFFF'
            },
            // darkened so the same tokens stay legible on white
            mod: '#16A34A',
            vip: '#DB2777',
            twitch: '#714ab8',
            discord: '#7289da'
          }
        }
      }
    })
  ]
};
