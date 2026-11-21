import type { ReactNode } from 'react';
import { ActivityDisclosure, type DisclosureProps } from '../ActivityDisclosure/ActivityDisclosure.js';

export interface ActionRowProps extends DisclosureProps {
  icon?: ReactNode;
}

export function ActionRow({ icon, label, children, expanded, defaultExpanded, onExpandedChange, ...props }: ActionRowProps) {
  const heading = <>{icon && <span data-nf-action-icon="" aria-hidden="true">{icon}</span>}{label}</>;
  if (children == null) return <div {...props} data-nf-action-row="">{heading}</div>;
  return <ActivityDisclosure {...props} data-nf-action-row="" label={heading} expanded={expanded}
    defaultExpanded={defaultExpanded} onExpandedChange={onExpandedChange}>{children}</ActivityDisclosure>;
}
