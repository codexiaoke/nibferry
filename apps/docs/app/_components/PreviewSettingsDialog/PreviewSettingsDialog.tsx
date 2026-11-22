'use client';

import { useState } from 'react';
import { RadioGroup, SettingsDialog } from 'nibferry';
import General from '@hugeicons/core-free-icons/SlidersHorizontalIcon';
import User from '@hugeicons/core-free-icons/UserCircleIcon';
import Info from '@hugeicons/core-free-icons/InformationCircleIcon';
import { version } from '../../../../../packages/react/package.json';
import './PreviewSettingsDialog.css';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showRail: boolean;
  onRailChange: (show: boolean) => void;
}

export default function PreviewSettingsDialog({ open, onOpenChange, showRail, onRailChange }: Props) {
  const [section, setSection] = useState('general');
  return <SettingsDialog className="preview-settings" open={open} onOpenChange={onOpenChange}
    value={section} onValueChange={setSection}
    onClose={event => {
      // Changing the desktop layout can replace the avatar that opened the dialog.
      const dialog = event.currentTarget;
      if (dialog.open || dialog.ownerDocument.activeElement !== dialog.ownerDocument.body) return;
      const triggers = dialog.parentElement?.querySelectorAll<HTMLButtonElement>('[data-nf-account-trigger]');
      Array.from(triggers ?? []).find(button => button.checkVisibility() && !button.closest('[inert]'))?.focus();
    }}
    sections={[
      { id: 'general', label: '通用', icon: General, content: <>
        <RadioGroup className="preview-settings-layout" label="桌面导航" variant="cards"
          value={showRail ? 'rail' : 'sidebar'} onValueChange={value => onRailChange(value === 'rail')}
          options={[
            { value: 'sidebar', label: '项目侧栏' }, { value: 'rail', label: '常驻导航栏' },
          ].map(option => ({ ...option, visual: <span className="preview-settings-diagram">
            {option.value === 'rail' && <i className="preview-settings-mini-rail" />}
            <i className="preview-settings-mini-sidebar" /><i className="preview-settings-mini-page" />
          </span> }))} />
        <dl className="preview-settings-details"><div><dt>界面语言</dt><dd>简体中文</dd></div></dl>
      </> },
      { id: 'account', label: '账户', icon: User, content: <dl className="preview-settings-details">
        <div><dt>用户名</dt><dd>xiaoke</dd></div>
        <div><dt>当前套餐</dt><dd>Pro</dd></div>
      </dl> },
      { id: 'about', label: '关于', icon: Info, content: <dl className="preview-settings-details">
        <div><dt>组件库</dt><dd>Nibferry</dd></div>
        <div><dt>版本</dt><dd>{version}</dd></div>
      </dl> },
    ]} />;
}
