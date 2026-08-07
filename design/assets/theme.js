/**
 * the tailwind play-cdn config for the static design comps.
 *
 * this is a flattened copy of what `tailwind.config.mjs` gets out of the heroui
 * plugin: heroui generates `primary-*`, `content*`, `divider` and the semantic
 * role colours from its theme object, which the cdn build has no plugin for.
 * spelling them out here keeps every class name in these html files identical
 * to the ones in `src/`, so markup can be copied straight across.
 *
 * if the palette moves in tailwind.config.mjs, move it here too.
 */
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        lato: ['Lato', 'Helvetica', 'sans-serif'],
        cairo: ['Cairo', 'Helvetica', 'sans-serif']
      },
      colors: {
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
        default: {
          100: '#E7E7EA',
          200: '#D2D2D8',
          300: '#B4B4BC',
          400: '#8A8A93',
          500: '#55555F',
          600: '#33333A',
          700: '#232326',
          800: '#111113',
          900: '#0B0B0C',
          DEFAULT: '#232326'
        },

        // elevation: canvas -> raised surface -> hover -> pressed
        content1: '#111113',
        content2: '#232326',
        content3: '#33333A',
        content4: '#55555F',
        divider: '#232326',

        // semantic role colours. mod green and vip pink are the only two hues
        // the ui spends; founder amber and artist blue come from misc/roles.ts
        // and are reserved for the roles that are not fully wired up yet.
        mod: '#4ADE80',
        vip: '#F472B6',
        founder: '#FBBF24',
        artist: '#60A5FA',
        twitch: '#714ab8',
        discord: '#7289da'
      }
    }
  }
};
