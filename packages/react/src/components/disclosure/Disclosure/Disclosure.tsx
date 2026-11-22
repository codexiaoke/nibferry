import { ActivityDisclosure, type DisclosureProps } from '../../conversation/ActivityDisclosure/ActivityDisclosure.js';

export type { DisclosureProps };

export function Disclosure(props: DisclosureProps) {
  return <ActivityDisclosure {...props} data-nf-disclosure-panel="" />;
}
