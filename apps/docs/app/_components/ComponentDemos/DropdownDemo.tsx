'use client';

import { useState } from 'react';
import {
  DropdownMenu, MenuContent, MenuGroup, MenuItem,
  MenuSeparator, MenuSub, MenuSubContent, MenuSubTrigger, MenuTrigger,
} from 'nibferry';
import { HugeiconsIcon } from '@hugeicons/react';
import Down from '@hugeicons/core-free-icons/ArrowDown01Icon';
import Pin from '@hugeicons/core-free-icons/PinIcon';

export function DropdownDemo() {
  const [pinned, setPinned] = useState(false);
  const [compact, setCompact] = useState(false);
  return (
    <div className="component-demo" role="group" aria-label="下拉菜单示例">
      <div className="demo-conversation" style={{ paddingBlock: compact ? '4px' : 'var(--nf-space-md)' }}>
        <span>{pinned && <HugeiconsIcon icon={Pin} size={15} aria-label="已置顶" />}工作区布局</span>
        <DropdownMenu>
          <MenuTrigger className="demo-menu-button">会话操作 <HugeiconsIcon icon={Down} size={14} aria-hidden="true" /></MenuTrigger>
          <MenuContent>
            <MenuGroup label="当前会话">
              <MenuItem icon={Pin} onSelect={() => setPinned(!pinned)}>{pinned ? '取消置顶' : '置顶'}</MenuItem>
            </MenuGroup>
            <MenuSeparator />
            <MenuSub>
              <MenuSubTrigger>显示密度</MenuSubTrigger>
              <MenuSubContent>
                <MenuItem onSelect={() => setCompact(false)}>标准</MenuItem>
                <MenuItem onSelect={() => setCompact(true)}>紧凑</MenuItem>
              </MenuSubContent>
            </MenuSub>
          </MenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
