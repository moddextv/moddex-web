import { heroui } from '@heroui/react';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/**/@heroui/theme/dist/**/*.{js,mjs,ts,mts}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-manrope)', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace']
      },

      fontSize: {
        micro: ['0.75rem', { lineHeight: '1.45' }],
        meta: ['0.8125rem', { lineHeight: '1.5' }],
        ui: ['0.875rem', { lineHeight: '1.5' }],
        base: ['0.9375rem', { lineHeight: '1.6' }],
        read: ['1rem', { lineHeight: '1.65' }],
        lead: ['1.125rem', { lineHeight: '1.6' }],
        h3: ['1.125rem', { lineHeight: '1.35', letterSpacing: '-0.01em' }],
        h2: ['1.375rem', { lineHeight: '1.3', letterSpacing: '-0.015em' }],
        h1: ['1.75rem', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
        display: [
          'clamp(2.25rem, 4.8vw, 3.75rem)',
          { lineHeight: '1.08', letterSpacing: '-0.035em' }
        ]
      },

      colors: {
        primary: {
          50: 'rgb(var(--primary-50) / <alpha-value>)',
          100: 'rgb(var(--primary-100) / <alpha-value>)',
          200: 'rgb(var(--primary-200) / <alpha-value>)',
          300: 'rgb(var(--primary-300) / <alpha-value>)',
          400: 'rgb(var(--primary-400) / <alpha-value>)',
          500: 'rgb(var(--primary-500) / <alpha-value>)',
          600: 'rgb(var(--primary-600) / <alpha-value>)',
          700: 'rgb(var(--primary-700) / <alpha-value>)',
          800: 'rgb(var(--primary-800) / <alpha-value>)',
          900: 'rgb(var(--primary-900) / <alpha-value>)',
          DEFAULT: 'rgb(var(--primary-500) / <alpha-value>)',
          foreground: 'rgb(var(--primary-100) / <alpha-value>)'
        },
        mod: 'rgb(var(--mod-rgb) / <alpha-value>)',
        vip: 'rgb(var(--vip-rgb) / <alpha-value>)',
        founder: 'rgb(var(--founder-rgb) / <alpha-value>)',
        artist: 'rgb(var(--artist-rgb) / <alpha-value>)',
        twitch: 'rgb(var(--twitch-rgb) / <alpha-value>)',
        discord: 'rgb(var(--discord-rgb) / <alpha-value>)'
      },

      // the values live in globals.css, so `rounded-lg` and `var(--radius-lg)`
      // cannot come apart, and the other two sites carry the same five names
      borderRadius: {
        DEFAULT: 'var(--radius-md)',
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-full)'
      },

      maxWidth: {
        page: '1440px',
        prose: '64ch'
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
            content1: '#111113',
            content2: '#232326',
            content3: '#33333A',
            content4: '#55555F',
            divider: '#232326',
            overlay: '#000000',

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
            default: {
              50: '#0B0B0C',
              100: '#18181B',
              200: '#2A2A2E',
              300: '#45454C',
              400: '#6E6E78',
              500: '#9A9AA4',
              600: '#C4C4CC',
              700: '#E2E2E7',
              800: '#F2F2F5',
              900: '#FFFFFF',
              DEFAULT: '#E2E2E7',
              foreground: '#18181B'
            },
            content1: '#F2F2F5',
            content2: '#E2E2E7',
            content3: '#C4C4CC',
            content4: '#9A9AA4',
            divider: '#E2E2E7',
            overlay: '#000000',

            mod: '#15803D',
            vip: '#DB2777',
            twitch: '#714ab8',
            discord: '#4752C4'
          }
        }
      }
    })
  ]
};
