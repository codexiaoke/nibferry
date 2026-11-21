import { ActivityDisclosure, type DisclosureProps } from '../ActivityDisclosure/ActivityDisclosure.js';

export interface TurnProcessProps extends DisclosureProps {
  running?: boolean;
}

export function TurnProcess({ running, ...props }: TurnProcessProps) {
  return <ActivityDisclosure {...props} data-nf-turn-process="" reveal={Boolean(running)} />;
}
