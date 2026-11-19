import type { theme } from './tokens.js';

export type ThemeColors = typeof theme.color;
export interface ThemeConfig {
  /** Only supplied roles override the enclosing scope. */
  colors?: Partial<ThemeColors>;
  layout?: Partial<typeof theme.layout>;
  space?: Partial<typeof theme.space>;
  motion?:
    | false
    | (Partial<typeof theme.motion> & {
        easing?: readonly [number, number, number, number];
      });
}

function cssName(role: string) {
  return role.replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase());
}

/** Shared by the build-time defaults and runtime theme scopes. */
export function themeVariables({
  colors,
  layout,
  space,
  motion,
}: ThemeConfig): Record<string, string> {
  const variables: Record<string, string> = {};
  for (const [role, value] of Object.entries(colors ?? {})) {
    if (value !== undefined) {
      variables['--nf-' + cssName(role)] = value;
    }
  }
  for (const [group, lengths] of Object.entries({ space, layout })) {
    for (const [role, px] of Object.entries(lengths ?? {})) {
      if (px === undefined) continue;
      if (!Number.isFinite(px) || px < 0)
        throw new RangeError(group + '.' + role + ' must be a non-negative length');
      variables['--nf-' + group + '-' + cssName(role)] = px + 'px';
    }
  }
  if (motion === false) {
    variables['--nf-motion-scale'] = '0';
  } else if (motion) {
    const { easing, ...durations } = motion;
    for (const [name, ms] of Object.entries(durations)) {
      if (ms === undefined) continue;
      if (!Number.isFinite(ms) || ms < 0)
        throw new RangeError(name + ' must be a non-negative duration in milliseconds');
      variables['--nf-motion-' + name] = ms + 'ms';
    }
    if (easing) {
      const [x1, , x2] = easing;
      if (
        easing.length !== 4 ||
        !easing.every(Number.isFinite) ||
        x1 < 0 ||
        x1 > 1 ||
        x2 < 0 ||
        x2 > 1
      ) {
        throw new RangeError(
          'Cubic Bézier easing needs four finite values and x coordinates between 0 and 1',
        );
      }
      variables['--nf-ease'] = 'cubic-bezier(' + easing.join(',') + ')';
    }
  }
  return variables;
}
