/**
 * v2 "NATIVE" - tailwind play-cdn config.
 *
 * ------------------------------------------------------------------ premise
 * moddex is not a standalone product. It is a companion tool for one platform,
 * used by people who arrive from that platform and go straight back to it. So
 * it should look like it belongs there, and the way to do that is to copy the
 * host's actual decisions rather than invent a mood.
 *
 * Everything below is measured off Twitch's own interface: its surface ramp,
 * its 4px radius, its 50px nav, its 240px sidebar, its type stack, its button
 * sizes. Where moddex already has a value that does the same job, moddex's
 * value wins.
 *
 * ------------------------------------------------------------------- colour
 * The palette barely moves, because moddex's dark ramp is already almost
 * exactly Twitch's:
 *
 *     job              moddex     twitch
 *     base             #0B0B0C    #0E0E10
 *     raised           #111113    #18181B
 *     hover / line     #232326    #26262C
 *     border           #33333A    #3A3A3D
 *     text             #E7E7EA    #EFEFF1
 *     text alt         #8A8A93    #ADADB8
 *
 * Every one of those keeps moddex's value. The ramp was already right; it was
 * never the reason the site felt generic.
 *
 * ONE value changes: `twitch` goes from #714AB8 to #9146FF, which is Twitch's
 * actual current brand purple. #714AB8 is a dated approximation of it, and on a
 * direction whose whole argument is "look like the platform" using the real one
 * matters. It is also promoted from "the colour of the login button" to the
 * primary action colour, which is the job it does on Twitch.
 *
 * mod green and vip pink are untouched, and they turn out to be the most
 * native thing in the whole palette: Twitch's own moderator badge is a green
 * sword and its VIP badge is a pink gem. Rendering them at chat-badge scale
 * immediately before a username is not a moddex invention, it is the exact
 * convention Twitch chat uses.
 *
 * -------------------------------------------------------------------- type
 * Inter, which is what Twitch ships.
 *
 * The taste skill discourages Inter as a *default* and then names the override:
 * "acceptable when the user explicitly asks for a neutral / standard /
 * Linear-style feel". A brief of "look like the host platform" whose host
 * platform ships Inter is that override, stated out loud rather than snuck in.
 * Twitch's display face is Roobert, which is proprietary, so Inter carries both
 * roles here.
 */
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif']
      },

      // Twitch's type scale is small and tight. 13px does most of the work,
      // 12px carries metadata, and headings rarely exceed 24px outside a
      // marketing page.
      fontSize: {
        micro: ['0.6875rem', { lineHeight: '1.4' }],
        meta: ['0.75rem', { lineHeight: '1.5' }],
        ui: ['0.8125rem', { lineHeight: '1.5' }],
        base: ['0.875rem', { lineHeight: '1.6' }],
        read: ['0.9375rem', { lineHeight: '1.65' }],
        h3: ['1.125rem', { lineHeight: '1.35', letterSpacing: '-0.01em' }],
        h2: ['1.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        h1: ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.015em' }],
        display: ['clamp(1.75rem, 3.4vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.025em' }]
      },

      colors: {
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

        // the only changed value in the whole palette, and the reason is in the
        // header comment
        twitch: '#9146FF',
        'twitch-hover': '#A970FF',
        'twitch-press': '#772CE8',

        mod: '#4ADE80',
        vip: '#F472B6',
        founder: '#FBBF24',
        artist: '#60A5FA',
        discord: '#5865F2',
        live: '#EB0400'
      },

      borderRadius: {
        // Twitch's radius language. The shipped design bans radius entirely on
        // the grounds that the mark has no curves, which is a nice rationale
        // and also part of what makes it read as austere dark-tech. A logo does
        // not have to dictate the radius of a button.
        DEFAULT: '4px',
        md: '4px',
        lg: '6px',
        pill: '9999px'
      },

      spacing: {
        nav: '50px',
        rail: '240px'
      },

      maxWidth: {
        page: '1280px',
        prose: '58ch'
      }
    }
  }
};
