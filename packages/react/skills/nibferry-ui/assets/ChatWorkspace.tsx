'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import {
  Button, ConversationItem, ConversationList, LeftPane, MainPane, PaneHeader, Stack,
  WorkspaceLayout,
} from 'nibferry';
import DocumentAssistant from './DocumentAssistant';
import './ChatWorkspace.css';

const chats = [
  { id: 'install', title: '项目接入', question: '需要哪个版本的 React？' },
  { id: 'styles', title: '主题样式', question: '样式要在哪里加载？' },
];

export default function ChatWorkspace() {
  const [active, setActive] = useState(chats[0]);
  const [browse, setBrowse] = useState(false);
  const selectedItem = useRef<HTMLButtonElement>(null);
  const listButton = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);

  useLayoutEffect(() => {
    if (browse) selectedItem.current?.focus();
    else if (returnFocus.current) listButton.current?.focus();
    returnFocus.current = browse;
  }, [browse]);

  return (
    <WorkspaceLayout compactPane={browse ? 'left' : 'main'} style={{ height: '100%' }}>
      <LeftPane width={192} aria-label="历史会话" className="chat-history">
        <ConversationList label="最近会话">
          {chats.map(chat => (
            <ConversationItem key={chat.id} current={active.id === chat.id}
              ref={active.id === chat.id ? selectedItem : undefined}
              onClick={() => { setActive(chat); setBrowse(false); }}>
              {chat.title}
            </ConversationItem>
          ))}
        </ConversationList>
      </LeftPane>
      <MainPane>
        <Stack gap="sm" style={{ height: '100%' }}>
          <PaneHeader className="chat-heading" actions={
            <Button ref={listButton} className="chat-history-button" variant="ghost" onClick={() => setBrowse(true)}>
              切换会话
            </Button>
          }>
            <strong>{active.title}</strong>
          </PaneHeader>
          {chats.map(chat => (
            <div key={chat.id} hidden={chat.id !== active.id} style={{ flex: 1, minHeight: 0 }}>
              <DocumentAssistant firstQuestion={chat.question} />
            </div>
          ))}
        </Stack>
      </MainPane>
    </WorkspaceLayout>
  );
}
