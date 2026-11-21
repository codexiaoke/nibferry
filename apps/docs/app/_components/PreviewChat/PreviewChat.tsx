'use client';

import { useEffect, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import File from '@hugeicons/core-free-icons/File01Icon';
import Search from '@hugeicons/core-free-icons/Search01Icon';
import Code from '@hugeicons/core-free-icons/SourceCodeIcon';
import Mic from '@hugeicons/core-free-icons/Mic02Icon';
import Waveform from '@hugeicons/core-free-icons/AudioWave01Icon';
import {
  ActionGroup, ActionResult, type ActionResultValue, ActionRow, ActivitySequence, AssistantMessage, ConversationComposer, ConversationTurn,
  ComposerActionMenu, type ComposerMenuMatch, ComposerModelSelect, ComposerSelect, ContextUsage, ConversationView,
  DropdownMenu, MenuContent, MenuGroup, MenuItem, MenuTrigger, PaneButton, TurnProcess, UserMessage,
} from 'nibferry';
import { layoutSource, type PreviewSource } from '../WorkspacePreview/preview-sources';
import './PreviewChat.css';

const sketchPrompt = '给我一张工作区布局草图';
const permissions = [{ value: 'full', label: '完全访问' }, { value: 'read', label: '只读' }];
const models = [
  { value: 'default', label: '默认', detail: '推荐模型集' },
  { value: 'deepseek/chat', label: 'DeepSeek Chat', provider: 'DeepSeek' },
  { value: 'deepseek/reasoner', label: 'DeepSeek Reasoner', provider: 'DeepSeek' },
  ...['GPT-6.2 Sol', 'GPT-6.2 Astra', 'GPT-6.1 Terra', 'GPT-6.1 Sol', 'GPT-6 Astra',
    'GPT-6 Sol', 'GPT-6 Luna', 'GPT-5.6 Sol', 'GPT-5.6 Terra', 'GPT-5.6 Luna'].map(label => ({ value: label, label, provider: 'OpenAI' })),
];
const levels = ['低', '中', '高', '极高', '超高', '最高'].map(label => ({ value: label, label }));
const voiceExample = '怎样收起侧栏？';

function PreviewVoiceAction({ mode, onSelect, onCloseAutoFocus }: {
  mode: 'dictation' | 'chat'; onSelect: () => void; onCloseAutoFocus: (event: Event) => void;
}) {
  const chat = mode === 'chat';
  const label = chat ? '语音对话' : '语音输入';
  return <DropdownMenu modal={false}>
    <MenuTrigger asChild>
      <PaneButton className={chat ? 'preview-voice-chat' : 'preview-dictation'} icon={chat ? Waveform : Mic}
        aria-label={label} title={label} />
    </MenuTrigger>
    <MenuContent side="top" align="end" className="preview-composer-menu" onCloseAutoFocus={onCloseAutoFocus}>
      <MenuGroup label={chat ? '发送示例语音消息' : '插入示例转写'}>
        <MenuItem onSelect={onSelect}>{voiceExample}</MenuItem>
      </MenuGroup>
    </MenuContent>
  </DropdownMenu>;
}
const query = 'React useState 官方文档 site:react.dev';
const sources = [
  { title: 'useState – React', url: 'https://react.dev/reference/react/useState' },
  { title: 'useState – React 中文文档', url: 'https://zh-hans.react.dev/reference/react/useState' },
];

// This sample's block types belong to the host. The library only sees stable IDs and React nodes.
type Block =
  | { id: string; kind: 'text'; text: string }
  | { id: string; kind: 'tool'; label: string; group?: string; detail: ActionResultValue }
  | { id: string; kind: 'sketch' | 'source' | 'links' };

const work: Block[] = [
  { id: 'note', kind: 'text', text: '我先看一下工作区里各栏的职责。' },
  { id: 'read-layout', kind: 'tool', group: 'layout', label: '查看工作区布局', detail: {
    title: layoutSource.title, url: layoutSource.path, summary: '左栏放项目和会话，中间保留对话，右栏用于查看资料。',
    panes: ['LeftPane', 'MainPane', 'RightPane'],
  } },
  { id: 'read-width', kind: 'tool', group: 'layout', label: '查看栏宽设置', detail: '拖动分隔线可调整左右栏宽度。' },
  { id: 'note-width', kind: 'text', text: '再看窄屏下怎样切换。' },
  { id: 'read-compact', kind: 'tool', label: '查看窄屏布局', detail: '窄屏一次显示一个区域，通过标题栏按钮切换。' },
];
const sketchReply: Block[] = [
  { id: 'intro', kind: 'text', text: '可以先用两栏对话，需要核对资料时再展开右栏。' },
  { id: 'sketch', kind: 'sketch' },
  { id: 'after', kind: 'text', text: '打开右栏后，对话和文档可以并排阅读。' },
  { id: 'source', kind: 'source' },
];
const plainText = '点击窗口左上角的侧栏按钮，就能收起项目列表。再点一次，会回到刚才的会话。';

const searchWork: Block[] = [
  { id: 'note', kind: 'text', text: '我先查找 useState 的参考页，再读取正文。' },
  { id: 'search', kind: 'tool', group: 'web', label: '已搜索 ' + query, detail: { query, results: sources } },
  { id: 'read', kind: 'tool', group: 'web', label: '已抓取 useState – React', detail: {
    url: sources[0].url, title: sources[0].title, signature: 'const [state, setState] = useState(initialState)',
  } },
];
const searchReply: Block[] = [
  { id: 'answer', kind: 'text', text: 'useState 返回当前状态和更新它的函数。官方文档地址如下。' },
  { id: 'links', kind: 'links' },
];
const examples = {
  layout: { work, reply: sketchReply },
  search: { work: searchWork, reply: searchReply },
};

interface Turn {
  id: string;
  prompt: string;
  example: keyof typeof examples | 'plain';
  step: number;
  state: 'running' | 'done' | 'stopped';
  started: number;
  seconds?: number;
}

function lastStep(example: Turn['example']) {
  return example === 'plain' ? plainText.length : examples[example].work.length + examples[example].reply.length;
}

function LayoutSketch() {
  const [three, setThree] = useState(false);
  return <div className="preview-sketch" role="group" aria-label="工作区布局草图">
    <div className="preview-sketch-content">
      <div className="preview-sketch-head">
        <strong>工作区布局</strong>
        <button type="button" aria-pressed={three} onClick={() => setThree(!three)}>显示右栏</button>
      </div>
      <div className="preview-sketch-panes">
        <span>项目</span><span>对话</span>{three && <span>资料</span>}
      </div>
    </div>
  </div>;
}

type OpenSource = (source: PreviewSource) => void;

function PreviewTurn({ turn, onOpenSource }: { turn: Turn; onOpenSource: OpenSource }) {
  const running = turn.state === 'running';
  const sample = turn.example === 'plain' ? undefined : examples[turn.example];
  const search = turn.example === 'search';
  const process = sample?.work.slice(0, turn.step) ?? [];
  const answer: Block[] = sample
    ? sample.reply.slice(0, Math.max(0, turn.step - sample.work.length))
    : [{ id: 'reply', kind: 'text', text: plainText.slice(0, turn.step) }];
  function renderBlock(block: Block) {
    switch (block.kind) {
      case 'text': return <p>{block.text}</p>;
      case 'tool': return <ActionRow label={block.label}
        icon={<HugeiconsIcon icon={block.id === 'search' ? Search : File} size={14} />}>
        <ActionResult value={block.detail} />
      </ActionRow>;
      case 'links': return <ul className="preview-doc-sources">{sources.map(source =>
        <li key={source.url}><a href={source.url} onClick={event => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          onOpenSource({ title: source.title, path: source.url });
        }}>{source.url}</a></li>)}</ul>;
      case 'sketch': return <LayoutSketch />;
      case 'source': return <button type="button" className="preview-source-link" onClick={() => onOpenSource(layoutSource)}>
        <HugeiconsIcon icon={File} size={15} aria-hidden="true" />打开布局文档
      </button>;
    }
  }
  return <ConversationTurn>
    <UserMessage>{turn.prompt}</UserMessage>
    {process.length > 0 && <TurnProcess running={running} defaultExpanded={search}
      label={turn.state === 'stopped' ? '处理已停止' : '已处理 ' + (turn.seconds ?? 0) + ' 秒'}>
      <ActivitySequence items={process} getKey={block => block.id} renderItem={renderBlock}
        group={{ by: block => block.kind === 'tool' ? block.group : undefined,
          render: (blocks, rows) => <ActionGroup defaultExpanded={search}
            icon={search ? <HugeiconsIcon icon={Search} size={14} /> : undefined}
            label={search ? '已搜索网页、抓取网页' : '查看了 ' + blocks.length + ' 项布局设置'}>{rows}</ActionGroup> }} />
    </TurnProcess>}
    <AssistantMessage>
      <ActivitySequence items={answer} getKey={block => block.id} renderItem={renderBlock} />
      {running && <span role="status" aria-label="正在生成" className="preview-stream-dot" />}
      {turn.state === 'stopped' && <small>已停止生成</small>}
    </AssistantMessage>
  </ConversationTurn>;
}

export default function PreviewChat({ seeded, hidden, onOpenSource }: {
  seeded: boolean; hidden: boolean; onOpenSource: OpenSource;
}) {
  const [draft, setDraft] = useState('');
  const [permission, setPermission] = useState('full');
  const [model, setModel] = useState('GPT-6.2 Astra');
  const [level, setLevel] = useState('极高');
  const input = useRef<HTMLTextAreaElement>(null);
  const insertedCaret = useRef<number | null>(null);
  const [turns, setTurns] = useState<Turn[]>(() => seeded ? [{
    id: 'layout-example', prompt: sketchPrompt, example: 'layout', step: lastStep('layout'), state: 'done', started: 0, seconds: 4,
  }] : []);
  const current = turns.at(-1);
  const running = current?.state === 'running';
  useEffect(() => {
    if (!current || current.state !== 'running') return;
    const timer = setTimeout(() => {
      const step = current.step + 1;
      const done = step === lastStep(current.example);
      setTurns(all => all.map(turn => turn === current ? {
        ...turn, step, state: done ? 'done' : 'running', seconds: Math.round((Date.now() - turn.started) / 1000),
      } : turn));
    }, current.example === 'plain' ? 32 : 550);
    return () => clearTimeout(timer);
  }, [current]);

  function send(text: string) {
    const prompt = text.trim();
    if (!prompt || running) return;
    const example = /useState/i.test(prompt) ? 'search' : /草图|布局/.test(prompt) ? 'layout' : 'plain';
    setTurns(all => [...all, { id: crypto.randomUUID(), prompt, example,
      state: 'running', started: Date.now(), step: 1 }]);
    setDraft('');
  }

  function insertText(text: string, match: ComposerMenuMatch | null, caret = text.length) {
    const field = input.current!;
    const start = match?.start ?? field.selectionStart;
    insertedCaret.current = start + caret;
    setDraft(field.value.slice(0, start) + text + field.value.slice(match?.end ?? field.selectionEnd));
  }

  function insertCodeBlock(match: ComposerMenuMatch | null) {
    const { value, selectionStart, selectionEnd } = input.current!;
    const start = match?.start ?? selectionStart;
    const end = match?.end ?? selectionEnd;
    const prefix = start > 0 && value[start - 1] !== '\n' ? '\n' : '';
    const suffix = end < value.length && value[end] !== '\n' ? '\n' : '';
    const body = prefix + '```\n' + (match ? '' : value.slice(start, end));
    insertText(body + '\n```' + suffix, match, body.length);
  }

  function restoreCaret(event: Event) {
    const caret = insertedCaret.current;
    if (caret === null) return;
    insertedCaret.current = null;
    event.preventDefault();
    input.current?.focus();
    input.current?.setSelectionRange(caret, caret);
  }

  return <ConversationView hidden={hidden} className="preview-chat"
    empty={<h2>想先看什么？</h2>}
    composer={<ConversationComposer ref={input} value={draft} onValueChange={setDraft} onSend={() => send(draft)}
      running={running} onStop={() => setTurns(all => all.map(turn => turn === current ? { ...turn, state: 'stopped' } : turn))}
      placeholder="输入消息，@ 引用文档，/ 选择操作" tools={<>
        <ComposerActionMenu className="preview-composer-menu" onCloseAutoFocus={restoreCaret}>
          {match => [
            (!match?.query || ('引用布局文档' + layoutSource.title).includes(match.query)) &&
              <MenuItem key="document" icon={File} onSelect={() => insertText(`[${layoutSource.title}](${layoutSource.path})`, match)}>引用布局文档</MenuItem>,
            match?.symbol !== '@' && (!match?.query || '插入代码块'.includes(match.query)) &&
              <MenuItem key="code" icon={Code} onSelect={() => insertCodeBlock(match)}>插入代码块</MenuItem>,
          ]}
        </ComposerActionMenu>
        <ComposerSelect label="权限" value={permission} onValueChange={setPermission} options={permissions}
          className={permission === 'full' ? 'preview-full-access' : undefined} menuClassName="preview-composer-menu" />
      </>} rightTools={<>
        <ContextUsage value={38} />
        <ComposerModelSelect models={models} model={model} onModelChange={setModel} levels={levels}
          level={level} onLevelChange={setLevel} resetLevel="极高" panelClassName="preview-composer-menu" />
        <PreviewVoiceAction mode="dictation" onSelect={() => insertText(voiceExample, null)} onCloseAutoFocus={restoreCaret} />
      </>} emptyAction={<PreviewVoiceAction mode="chat" onSelect={() => {
        insertedCaret.current = 0;
        send(voiceExample);
      }} onCloseAutoFocus={restoreCaret} />} />}>
    {turns.map(turn => <PreviewTurn key={turn.id} turn={turn} onOpenSource={onOpenSource} />)}
  </ConversationView>;
}
