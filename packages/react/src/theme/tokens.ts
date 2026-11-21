import values from './values.json';

/** Numeric motion values are milliseconds on every platform. */
export const theme = {
  ...values,
  easing: values.easing as [number, number, number, number],
};

/** Palettes contain colors only. Motion is configured independently. */
export const palettes = {
  neutral: theme.color,
  graphite: {
    canvas: '#202020',
    subtle: '#2B2B2B',
    ink: '#F5F5F5',
    secondary: '#CACACA',
    muted: '#A5A5A5',
    line: '#484848',
    primary: '#F2F2F2',
    onPrimary: '#121212',
    accent: '#74AAFF',
    accentText: '#A2C7FF',
    shadow: 'rgb(0 0 0 / 24%)',
  },
} satisfies Record<string, typeof theme.color>;

export { themeVariables, type ThemeColors, type ThemeConfig } from './config.js';
