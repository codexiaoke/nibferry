import { Fragment, type Key, type ReactNode } from 'react';

export interface ActivitySequenceProps<T> {
  items: readonly T[];
  getKey: (item: T) => Key;
  renderItem: (item: T) => ReactNode;
  group?: {
    by: (item: T) => string | undefined;
    render: (items: readonly T[], children: ReactNode) => ReactNode;
  };
}

/** Only adjacent items with the same defined group key can share a disclosure. */
export function ActivitySequence<T>({ items, getKey, renderItem, group }: ActivitySequenceProps<T>) {
  const output: ReactNode[] = [];
  const render = (item: T) => <Fragment key={getKey(item)}>{renderItem(item)}</Fragment>;
  for (let start = 0; start < items.length;) {
    const item = items[start];
    const kind = group?.by(item);
    let end = start + 1;
    if (group && kind !== undefined) {
      while (end < items.length && group.by(items[end]) === kind) end++;
      const run = items.slice(start, end);
      output.push(<Fragment key={getKey(item)}>{group.render(run, run.map(render))}</Fragment>);
    } else {
      output.push(render(item));
    }
    start = end;
  }
  return output;
}
