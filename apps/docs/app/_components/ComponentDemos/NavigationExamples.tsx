'use client';

import { useId, useRef, useState } from 'react';
import {
  ConversationGroup, ConversationItem, ConversationList, CountBadge, NavigationRail,
  NavigationRailItem, PaneButton, ProjectInfo, SidebarMenu, WorkspaceTab, WorkspaceTabAdd, WorkspaceTabList,
} from 'nibferry';
import Chat from '@hugeicons/core-free-icons/BubbleChatIcon';
import File from '@hugeicons/core-free-icons/File01Icon';
import Folder from '@hugeicons/core-free-icons/Folder01Icon';

const sections = [
  { label: '会话', icon: Chat, items: ['工作区布局', '输入框设计'] },
  { label: '文档', icon: Folder, items: ['接入指南', '主题配置'] },
];

export function SidebarDemo() {
  const [section, setSection] = useState(sections[0]);
  const [selected, setSelected] = useState(sections[0].items[0]);
  return (
    <div className="component-demo">
      <div className="example-sidebar">
        <NavigationRail label="切换侧栏">
          {sections.map(item =>
            <NavigationRailItem key={item.label} icon={item.icon} label={item.label}
              current={section === item} onClick={() => { setSection(item); setSelected(item.items[0]); }} />)}
        </NavigationRail>
        <SidebarMenu label={section.label} actions={<CountBadge count={section.items.length} />}>
          {section.items.map(label =>
            <PaneButton key={label} icon={section.icon} text={label} aria-pressed={selected === label}
              onClick={() => setSelected(label)} />)}
        </SidebarMenu>
      </div>
    </div>
  );
}

const chats = ['整理组件文档', '讨论工作区布局'];

export function ProjectListDemo() {
  const [expanded, setExpanded] = useState(true);
  const [selected, setSelected] = useState(chats[0]);
  return (
    <div className="component-demo">
      <ConversationList label="项目" className="example-list">
        <ConversationGroup label="Nibferry" expanded={expanded} onToggle={() => setExpanded(!expanded)}
          details={<ProjectInfo name="Nibferry" chatCount={2} activeChatCount={1} repository="codexiaoke/nibferry" />}>
          {chats.map(label =>
            <ConversationItem key={label} current={selected === label} onClick={() => setSelected(label)}>
              {label}
            </ConversationItem>)}
        </ConversationGroup>
      </ConversationList>
    </div>
  );
}

export function TabsDemo() {
  const prefix = useId();
  const next = useRef(3);
  const [tabs, setTabs] = useState([
    { id: prefix + '-1', label: '文档', content: '工作区支持并排阅读会话和文档。' },
    { id: prefix + '-2', label: '变更', content: '已更新组件目录。' },
  ]);
  const [active, setActive] = useState(tabs[0].id);
  const addButton = useRef<HTMLButtonElement>(null);
  function add() {
    const n = next.current++;
    const tab = { id: prefix + '-' + n, label: '文档 ' + n, content: '新文档 ' + n };
    setTabs([...tabs, tab]);
    setActive(tab.id);
  }
  function close(id: string) {
    const rest = tabs.filter(tab => tab.id !== id);
    const index = tabs.findIndex(tab => tab.id === id);
    const target = active === id ? rest[Math.min(index, rest.length - 1)]?.id : active;
    setTabs(rest);
    setActive(target ?? '');
    if (target) document.getElementById(target)?.focus();
    else addButton.current?.focus();
  }
  return (
    <div className="component-demo">
      <div className="example-tabs">
        <div className="example-tabs-bar">
          <WorkspaceTabList aria-label="打开的文档"
            onReorder={ids => setTabs(ids.map(id => tabs.find(tab => tab.id === id)!))}>
            {tabs.map(tab =>
              <WorkspaceTab key={tab.id} id={tab.id} panelId={tab.id + '-panel'} label={tab.label}
                icon={File} selected={tab.id === active} onClick={() => setActive(tab.id)} onClose={() => close(tab.id)} />)}
          </WorkspaceTabList>
          <WorkspaceTabAdd ref={addButton} onClick={add} />
        </div>
        {tabs.map(tab =>
          <div key={tab.id} role="tabpanel" id={tab.id + '-panel'} aria-labelledby={tab.id}
            hidden={tab.id !== active}>{tab.content}</div>)}
        {!tabs.length && <div className="example-empty">暂无打开的文档</div>}
      </div>
    </div>
  );
}
