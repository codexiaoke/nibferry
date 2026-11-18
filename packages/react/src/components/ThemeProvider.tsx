import type { ReactNode } from 'react';
import { themeVariables, type ThemeConfig } from '../theme/config.js';
import styles from './controls.module.css';

export interface ThemeProviderProps extends ThemeConfig {
  children: ReactNode;
}

/** CSS inheritance keeps nested workspaces independent without re-mounting them. */
export function ThemeProvider({ colors, motion, children }: ThemeProviderProps) {
  return (
    <div className={styles.themeScope} style={themeVariables({ colors, motion })}>
      {children}
    </div>
  );
}
