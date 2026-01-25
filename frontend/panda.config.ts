import { defineConfig } from '@pandacss/dev';

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ['./src/**/*.{js,jsx,ts,tsx}'],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
      tokens: {
        colors: {
          base: { value: 'var(--colors-base)' },
          surface: { value: 'var(--colors-surface)' },
          overlay: { value: 'var(--colors-overlay)' },
          muted: { value: 'var(--colors-muted)' },
          subtle: { value: 'var(--colors-subtle)' },
          text: { value: 'var(--colors-text)' },
          love: { value: 'var(--colors-love)' },
          gold: { value: 'var(--colors-gold)' },
          rose: { value: 'var(--colors-rose)' },
          pine: { value: 'var(--colors-pine)' },
          foam: { value: 'var(--colors-foam)' },
          iris: { value: 'var(--colors-iris)' },
          'highlight-low': { value: 'var(--colors-highlight-low)' },
          'highlight-med': { value: 'var(--colors-highlight-med)' },
          'highlight-high': { value: 'var(--colors-highlight-high)' },
        },
        fontSizes: {
          xs: { value: 'var(--font-sizes-xs)' },
          sm: { value: 'var(--font-sizes-sm)' },
          md: { value: 'var(--font-sizes-md)' },
          lg: { value: 'var(--font-sizes-lg)' },
          xl: { value: 'var(--font-sizes-xl)' },
          '2xl': { value: 'var(--font-sizes-2xl)' },
          '3xl': { value: 'var(--font-sizes-3xl)' },
          '4xl': { value: 'var(--font-sizes-4xl)' },
          '5xl': { value: 'var(--font-sizes-5xl)' },
          '6xl': { value: 'var(--font-sizes-6xl)' },
          '7xl': { value: 'var(--font-sizes-7xl)' },
          '8xl': { value: 'var(--font-sizes-8xl)' },
        },
      },
    },
  },

  // The output directory for your css system
  outdir: 'styled-system',
});
