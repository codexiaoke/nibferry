import { useRef } from 'react';
import Companion from '@hugeicons/core-free-icons/BotIcon';
import Personalize from '@hugeicons/core-free-icons/SmileIcon';
import Profile from '@hugeicons/core-free-icons/UserCircleIcon';
import Settings from '@hugeicons/core-free-icons/Settings01Icon';
import Help from '@hugeicons/core-free-icons/LifebuoyIcon';
import Logout from '@hugeicons/core-free-icons/LogoutSquare01Icon';
import { MenuGroup, MenuItem, MenuSeparator, MenuSub, MenuSubContent, MenuSubTrigger, NavigationRailAccount, type NavigationRailAccountProps } from 'nibferry';
import type { PreviewSource } from '../WorkspacePreview/preview-sources';
import '../PreviewConversationMenu/PreviewConversationMenu.css';

interface Props {
  variant?: NavigationRailAccountProps['variant'];
  onOpenPage: (page: PreviewSource) => void;
  onOpenSettings: () => void;
}

export default function PreviewAccountMenu({ variant, onOpenPage, onOpenSettings }: Props) {
  const settingsSelected = useRef(false);
  return (
    <NavigationRailAccount name="xiaoke" detail="Pro" variant={variant} menuProps={{
      className: 'preview-conversation-menu',
      onCloseAutoFocus() {
        if (settingsSelected.current) {
          settingsSelected.current = false;
          onOpenSettings();
        }
      },
    }}>
      <MenuGroup>
        <MenuItem icon={Companion} shortcut="⌥Space">显示智能伙伴</MenuItem>
        <MenuItem icon={Personalize}>个性化</MenuItem>
        <MenuItem icon={Profile}>个人资料</MenuItem>
        <MenuItem icon={Settings} shortcut="⌘," aria-haspopup="dialog" onSelect={() => { settingsSelected.current = true; }}>设置</MenuItem>
      </MenuGroup>
      <MenuSeparator />
      <MenuGroup>
        <MenuSub>
          <MenuSubTrigger icon={Help}>帮助</MenuSubTrigger>
          <MenuSubContent className="preview-conversation-menu">
            <MenuItem onSelect={() => onOpenPage({ title: '接入项目', path: '/docs/installation/' })}>接入项目</MenuItem>
            <MenuItem onSelect={() => onOpenPage({ title: '组件总览', path: '/docs/components/' })}>组件总览</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuItem icon={Logout}>退出登录</MenuItem>
      </MenuGroup>
    </NavigationRailAccount>
  );
}
