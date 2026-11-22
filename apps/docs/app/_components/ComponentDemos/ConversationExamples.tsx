'use client';

import { useRef, useState } from 'react';
import {
  CopyButton, ActionGroup, ActionResult, ActionRow, ActivitySequence, AssistantMessage, ComposerActionMenu,
  ComposerSelect, ContextUsage, ConversationComposer, ConversationTurn, ConversationView,
  MenuItem, MessageActions, MessageMarkdown, MessageQuote, Pagination, Tabs, TurnProcess, UserMessage,
} from 'nibferry';
import { HugeiconsIcon } from '@hugeicons/react';
import File from '@hugeicons/core-free-icons/File01Icon';
import Attach from '@hugeicons/core-free-icons/Attachment01Icon';
import { CanvasCard, ApprovalCard, useReplyControls } from '../PreviewChat/ReplyCards';
import { ReplyMotionPreview } from '../PreviewChat/ReplyMotionPreview';
import { ChatAttachments, FileViewer, useChatFiles, type ChatFile } from '../PreviewChat/ChatAttachments';

export function MessagesDemo() {
  const controls = useReplyControls('demo');
  const question = '今天先看哪个组件？';
  const replies = ['先从输入框开始。它负责编辑草稿、插入引用和发送消息。', '先试用消息操作。可以引用原文，也可以切换回复版本。'];
  const [version, setVersion] = useState(1);
  const [quote, setQuote] = useState('');
  const reply = replies[version - 1];
  return <div className="component-demo">
    <Tabs className="example-column" label="消息示例" items={[
      { value: 'actions', label: '消息操作', content: (
      <ConversationView className="example-thread" onQuoteSelection={({ text }) => setQuote(text)}
        composer={quote && <MessageQuote source="助手回复" text={quote} onRemove={() => setQuote('')} />}>
        <ConversationTurn>
          <UserMessage actions={<MessageActions aria-label="用户消息操作" timestamp="16:34">
            <CopyButton label="复制消息" text={question} />
          </MessageActions>}>{question}</UserMessage>
          <AssistantMessage actions={<MessageActions aria-label="回复操作" timestamp="16:36">
            <CopyButton label="复制回复" text={reply} />
            <Pagination aria-label="回复版本" page={version} pageCount={replies.length} onPageChange={setVersion}
              previousLabel="上一版回复" nextLabel="下一版回复" />
          </MessageActions>}>{reply}</AssistantMessage>
        </ConversationTurn>
      </ConversationView>
      ) },
      { value: 'markdown', label: 'Markdown 正文', content: (
        <MessageMarkdown>{[
          '1. 确定需要展示的区域。', '2. 将资料放入右栏。', '',
          '| 区域 | 组件 |', '| --- | --- |', '| 主区域 | `MainPane` |', '| 右栏 | `RightPane` |', '',
          '```tsx', '<RightPane resizable>资料</RightPane>', '```',
        ].join('\n')}</MessageMarkdown>
      ) },
      { value: 'cards', label: '流内卡片', content: <div className="example-message-cards"><ApprovalCard {...controls} /><CanvasCard {...controls} /></div> },
      { value: 'motion', label: '回复动效', content: <ReplyMotionPreview /> },
    ]} />
  </div>;
}

export function ComposerDemo() {
  const field = useRef<HTMLTextAreaElement>(null);
  const attachments = useChatFiles(field);
  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState('');
  const [sentFiles, setSentFiles] = useState<ChatFile[]>([]);
  const [preview, setPreview] = useState<ChatFile>();
  const [mode, setMode] = useState('chat');
  return (
    <div className="component-demo chat-file-demo">
      <ConversationView className="example-column" composer={
        <ConversationComposer
          ref={field} canSend={attachments.ready && Boolean(draft.trim() || attachments.files.length)} onFilesAdd={attachments.add}
          attachments={attachments.files.length > 0 && <ChatAttachments files={attachments.files} onOpen={setPreview} onRemove={attachments.remove} transferFor={attachments.transferFor} />}
          aria-label="示例消息" placeholder="输入消息，或用 @ 引用文档"
          value={draft} onValueChange={setDraft} onSend={() => {
            setSent(draft); setSentFiles(attachments.files); setDraft(''); attachments.clear();
          }}
          tools={<>
            {attachments.picker}
            <ComposerActionMenu triggers={['@']} onCloseAutoFocus={attachments.onCloseAutoFocus}>
              {match => [
                !match && <MenuItem key="file" icon={Attach} onSelect={attachments.choose}>添加文件</MenuItem>,
                <MenuItem key="reference" icon={File} onSelect={() => {
                  const start = match?.start ?? draft.length;
                  const end = match?.end ?? draft.length;
                  setDraft(draft.slice(0, start) + '《组件指南》' + draft.slice(end));
                }}>引用组件指南</MenuItem>,
              ]}
            </ComposerActionMenu>
          </>}
          rightTools={<>
            <ContextUsage value={32} />
            <ComposerSelect label="回复模式" value={mode} onValueChange={setMode}
              options={[{ value: 'chat', label: '对话' }, { value: 'plan', label: '规划' }]} />
          </>}
        />
      }>
        {(sent || sentFiles.length > 0) && <ConversationTurn aria-live="polite">
          <UserMessage attachments={sentFiles.length > 0 && <ChatAttachments files={sentFiles} onOpen={setPreview} />}>{sent}</UserMessage>
        </ConversationTurn>}
      </ConversationView>
      {preview && <aside className="chat-file-demo-preview" aria-label="附件预览">
        <header><strong title={preview.title}>{preview.title}</strong>
          <button type="button" onClick={() => { setPreview(undefined); field.current?.focus(); }}>关闭</button></header>
        <FileViewer key={preview.path} file={preview.file} />
      </aside>}
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
