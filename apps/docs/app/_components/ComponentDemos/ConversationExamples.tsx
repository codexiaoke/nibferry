'use client';

import { useState } from 'react';
import {
  ActionGroup, ActionResult, ActionRow, ActivitySequence, AssistantMessage, ComposerActionMenu,
  ComposerSelect, ContextUsage, ConversationComposer, ConversationTurn, ConversationView,
  MenuItem, TurnProcess, UserMessage,
} from 'nibferry';
import { HugeiconsIcon } from '@hugeicons/react';
import File from '@hugeicons/core-free-icons/File01Icon';

export function MessagesDemo() {
  return (
    <div className="component-demo">
      <ConversationView className="example-thread">
        <ConversationTurn>
          <UserMessage>今天先看哪个组件？</UserMessage>
          <AssistantMessage>先从输入框开始。它负责编辑草稿、插入引用和发送消息。</AssistantMessage>
        </ConversationTurn>
      </ConversationView>
    </div>
  );
}

export function ComposerDemo() {
  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState('');
  const [mode, setMode] = useState('chat');
  return (
    <div className="component-demo">
      <div className="example-column">
        {sent && <ConversationTurn aria-live="polite"><UserMessage>{sent}</UserMessage></ConversationTurn>}
        <ConversationComposer
          aria-label="示例消息" placeholder="输入消息，或用 @ 引用文档"
          value={draft} onValueChange={setDraft} onSend={() => { setSent(draft); setDraft(''); }}
          tools={
            <ComposerActionMenu triggers={['@']}>
              {match => <MenuItem icon={File} onSelect={() => {
                const start = match?.start ?? draft.length;
                const end = match?.end ?? draft.length;
                setDraft(draft.slice(0, start) + '《组件指南》' + draft.slice(end));
              }}>引用组件指南</MenuItem>}
            </ComposerActionMenu>
          }
          rightTools={<>
            <ContextUsage value={32} />
            <ComposerSelect label="回复模式" value={mode} onValueChange={setMode}
              options={[{ value: 'chat', label: '对话' }, { value: 'plan', label: '规划' }]} />
          </>}
        />
      </div>
    </div>
  );
}

const documents = [
  { title: '读取组件指南', result: { 文件: '组件指南', 章节数: 6 } },
  { title: '读取主题配置', result: { 文件: '主题配置', 章节数: 3 } },
];

export function ProcessDemo() {
  return (
    <div className="component-demo">
      <div className="example-column">
        <TurnProcess label="已处理 2 秒" defaultExpanded>
          <ActivitySequence items={documents} getKey={item => item.title}
            group={{ by: () => 'docs', render: (items, rows) =>
              <ActionGroup label={`已读取 ${items.length} 份文档`} defaultExpanded>{rows}</ActionGroup> }}
            renderItem={item =>
              <ActionRow label={item.title} icon={<HugeiconsIcon icon={File} size={14} aria-hidden="true" />}>
                <ActionResult value={item.result} />
              </ActionRow>}
          />
        </TurnProcess>
      </div>
    </div>
  );
}
