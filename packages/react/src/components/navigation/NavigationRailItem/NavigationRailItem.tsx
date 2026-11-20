import { PaneButton, type PaneButtonProps } from '../../layout/PaneButton/PaneButton.js';

export interface NavigationRailItemProps extends Omit<PaneButtonProps, 'text' | 'children'> {
  label: string;
  current?: boolean;
}

export function NavigationRailItem({ label, current, ...props }: NavigationRailItemProps) {
  return <PaneButton aria-label={label} title={label} aria-current={current ? 'page' : undefined}
    {...props} data-nf-rail-item="" />;
}
