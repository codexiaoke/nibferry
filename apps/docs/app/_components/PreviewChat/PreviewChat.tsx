'use client';

import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import File from '@hugeicons/core-free-icons/File01Icon';
import Search from '@hugeicons/core-free-icons/Search01Icon';
import Code from '@hugeicons/core-free-icons/SourceCodeIcon';
import Attach from '@hugeicons/core-free-icons/Attachment01Icon';
import Edit from '@hugeicons/core-free-icons/PencilEdit01Icon';
import {
  CopyButton, ActionGroup, ActionResult, type ActionResultValue, ActionRow, ActivitySequence, AssistantMessage, ConversationComposer, ConversationTurn,
  ComposerActionMenu, type ComposerMenuMatch, ComposerModelSelect, ComposerSelect, ContextUsage, ConversationView,
  Alert, AttachmentItem, AttachmentList, AttachmentThumbnail, Button, MenuItem, MessageActions, MessageMarkdown, MessageQuote, Pagination,
  PaneButton, StreamingText, type StreamingEffect, Tooltip, TurnProcess, UserMessage,
} from 'nibferry';
import { layoutSource, type PreviewSource } from '../WorkspacePreview/preview-sources';
import { ChatAttachments, useChatFiles, type ChatFile } from './ChatAttachments';
import { PreviewVoiceAction, usePreviewVoice, VoiceStatus } from './PreviewVoiceAction';
import { MessageTime, PreviewReplyActions } from './PreviewMessageActions';
import { ApprovalCard, CanvasCard, useReplyControls } from './ReplyCards';
import { layoutCitations, layoutMarkdownLines } from './reply-examples';
import { basePath } from '../../site-links';
import './PreviewChat.css';

const sketchPrompt = '给我一张工作区布局草图';
const sketchTime = Date.UTC(2026, 10, 22, 8, 34);
const permissions = [{ value: 'full', label: '完全访问' }, { value: 'read', label: '只读' }];
const models = [
  { value: 'default', label: '默认', detail: '推荐模型集' },
  { value: 'deepseek/chat', label: 'DeepSeek Chat', provider: 'DeepSeek' },
  { value: 'deepseek/reasoner', label: 'DeepSeek Reasoner', provider: 'DeepSeek' },
  ...['GPT-6.2 Sol', 'GPT-6.2 Astra', 'GPT-6.1 Terra', 'GPT-6.1 Sol', 'GPT-6 Astra',
    'GPT-6 Sol', 'GPT-6 Luna', 'GPT-5.6 Sol', 'GPT-5.6 Terra', 'GPT-5.6 Luna'].map(label => ({ value: label, label, provider: 'OpenAI' })),
];
const levels = ['低', '中', '高', '极高', '超高', '最高'].map(label => ({ value: label, label }));
const query = 'React useState 官方文档 site:react.dev';
const sources = [
  { title: 'useState – React', url: 'https://react.dev/reference/react/useState' },
  { title: 'useState – React 中文文档', url: 'https://zh-hans.react.dev/reference/react/useState' },
];

// This sample's block types belong to the host. The library only sees stable IDs and React nodes.
type Block =
  | { id: string; kind: 'text' | 'markdown'; text: string }
  | { id: string; kind: 'tool'; label: string; group?: string; detail: ActionResultValue }
  | { id: string; kind: 'sketch' | 'source' | 'links' | 'approval' | 'canvas' | 'attachment' };

const diagram = { title: '交接流程图.svg', path: '/previews/handoff.svg' };

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
type Example = 'layout' | 'search' | 'files' | 'plain' | 'markdown' | 'cards';
const examples: Record<Example, { work: Block[]; reply: Block[]; tail?: string }> = {
  layout: { work, reply: sketchReply },
  search: { work: searchWork, reply: searchReply },
  files: { work: [], reply: [{ id: 'received', kind: 'text', text: '已收到附件。' }] },
  plain: { work: [], reply: [], tail: plainText },
  markdown: { work: [], reply: [] },
  cards: { work: [], reply: [
    { id: 'intro', kind: 'text', text: '这是交接流程草案。你可以先审批，也可以在画布上选中节点，调整名称。' },
    { id: 'review', kind: 'approval' },
    { id: 'workflow', kind: 'canvas' },
    { id: 'diagram', kind: 'attachment' },
  ], tail: '起草时整理待交接事项，核对时确认接手人与交付范围，交付时把最终版本交给接手人。每个节点都可以用团队常用的名称。' },
};

interface Quote { turnId: string; text: string }
interface Turn {
  groupId?: string;
  quote?: Quote;
  answerText?: string;
  id: string;
  prompt: string;
  files?: ChatFile[];
  example: Example;
  step: number;
  state: 'running' | 'done' | 'stopped' | 'send-error' | 'reply-error';
  sentAt: number;
  started: number;
  finishedAt?: number;
  seconds?: number;
}

function lastStep(example: Example) {
  if (example === 'markdown') return layoutMarkdownLines.length;
  const { work, reply, tail } = examples[example];
  return work.length + reply.length + (tail?.length ?? 0);
}

const archiveExamples = [
  ['最初的设计目标是什么？', '让对话、执行过程和资料预览可以在同一个工作区内使用。'],
  ['附件可以单独发送吗？', '可以。选择文件后等待上传完成，直接点发送即可。'],
  ['键盘怎样切换右栏标签？', '聚焦标签后，使用左右方向键切换。'],
  ['归档资料放在哪里？', '在右侧工作区打开归档资料，对话会保留在主区域。'],
  ['工具调用的细节在哪里？', '展开处理过程，再点对应的工具调用可以查看结果。'],
  ['引用文档后怎样返回？', '收起右侧工作区即可继续阅读对话。'],
  ['流程草图在哪里查看？', '在对话中点击画布附件，可以在右栏查看原图。'],
  ['怎样调整阅读宽度？', '拖动工作区分隔线，内容会随可用宽度重新排列。'],
  ['哪些材料支持预览？', '图片和 PDF 可直接查看，文档可阅读提取的正文。'],
  ['如何查看更早的回答？', '向上滚动到对话顶部，即可加载更早的消息。'],
  ['下一步如何交接？', '先核对草稿，确认接手人，再把最终资料交给对方。'],
  ['如何核对布局？', '展开右侧工作区，将对话和布局资料并排阅读。'],
];
const archive: Turn[] = archiveExamples.map(([prompt, answerText], i) => {
  const time = sketchTime - (archiveExamples.length - i) * 60000;
  return { id: 'history-' + i, prompt, answerText, example: 'plain', step: answerText.length, state: 'done',
    sentAt: time, started: time, finishedAt: time };
});
const pageSize = 4;

function initialTurns(seeded: boolean): Turn[] {
  if (!seeded) return [];
  const preview = new URLSearchParams(window.location.search).get('example');
  if (preview === 'chat') return [...archive.slice(-pageSize), { id: 'chat-guide', prompt: '展示 Markdown 排版',
    example: 'markdown', state: 'done', step: lastStep('markdown'), sentAt: sketchTime, started: sketchTime, finishedAt: sketchTime }];
  if (preview === 'cards' || preview === 'markdown') {
    const now = Date.now();
    const cards = preview === 'cards';
    return [{ id: preview, prompt: cards ? '展示审批与画布' : '展示 Markdown 排版', example: preview,
      step: cards ? 1 : lastStep(preview), state: cards ? 'running' : 'done', started: now, sentAt: now, finishedAt: cards ? undefined : now }];
  }
  return [{ id: 'layout-example', prompt: sketchPrompt, example: 'layout', step: lastStep('layout'), state: 'done',
    sentAt: sketchTime, started: sketchTime, finishedAt: sketchTime + 4000, seconds: 4 }];
}

function LayoutSketch({ three, toggle }: { three: boolean; toggle: () => void }) {
  return <div className="preview-sketch" role="group" aria-label="工作区布局草图">
    <div className="preview-sketch-content">
      <div className="preview-sketch-head">
        <strong>工作区布局</strong>
        <button type="button" aria-pressed={three} onClick={toggle}>显示右栏</button>
      </div>
      <div className="preview-sketch-panes">
        <span>项目</span><span>对话</span>{three && <span>资料</span>}
      </div>
    </div>
  </div>;
}

type OpenSource = (source: PreviewSource) => void;

function PreviewTurn({ turn, effect, busy, online, hidden, onEdit, onRetry, onQuote, onOpenQuote, versionControl, onOpenSource }: {
  turn: Turn; effect: StreamingEffect; busy: boolean; online: boolean; hidden: boolean; onEdit: () => void; onRetry: () => void; onOpenSource: OpenSource;
  onQuote: (quote: Quote) => void; onOpenQuote: (quote: Quote) => void; versionControl: React.ReactNode;
}) {
  const controls = useReplyControls(turn.id);
  const running = turn.state === 'running';
  const sample = examples[turn.example];
  const search = turn.example === 'search';
  const process = sample.work.slice(0, turn.step);
  const replyStep = Math.max(0, turn.step - sample.work.length);
  const answer = sample.reply.slice(0, replyStep);
  if (turn.example === 'markdown' && replyStep > 0) {
    answer.push({ id: 'guide', kind: 'markdown', text: layoutMarkdownLines.slice(0, replyStep).join('\n') });
  }
  const tail = turn.answerText ?? sample.tail;
  if (tail && replyStep > sample.reply.length) {
    answer.push({ id: 'tail', kind: 'text', text: tail.slice(0, replyStep - sample.reply.length) });
  }
  const replyText = answer.flatMap(block => {
    if (block.kind === 'text' || block.kind === 'markdown') return [block.text];
    if (block.kind === 'links') return sources.map(source => source.url);
    if (block.kind === 'source') return [layoutSource.title + ' ' + layoutSource.path];
    if (block.kind === 'sketch') return ['工作区布局'];
    if (block.kind === 'approval') return ['流程草案审批'];
    if (block.kind === 'canvas') return ['交接流程画布'];
    if (block.kind === 'attachment') return [diagram.title];
    return [];
  }).join('\n\n');
  const failedSend = turn.state === 'send-error';
  const retry = <Button variant="ghost" disabled={busy || !online} onClick={onRetry}>{failedSend ? '重新发送' : '重试'}</Button>;
  function renderBlock(block: Block) {
    switch (block.kind) {
      case 'text': return <p>{block.id === 'tail'
        ? <StreamingText streaming={running} effect={effect}>{block.text}</StreamingText> : block.text}</p>;
      case 'markdown': return <MessageMarkdown onOpenLink={href => {
        const source = layoutCitations.find(item => item.href === href);
        if (source) onOpenSource(source);
      }}>{block.text}</MessageMarkdown>;
      case 'approval': return <ApprovalCard {...controls} />;
      case 'canvas': return <CanvasCard {...controls} />;
      case 'attachment': return <AttachmentList layout="strip" aria-label="回复附件"><AttachmentItem name={diagram.title}
        preview={<AttachmentThumbnail src={basePath + diagram.path} alt="" />} onOpen={() => onOpenSource(diagram)} /></AttachmentList>;
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
      case 'sketch': return <LayoutSketch three={Boolean(controls.value.showRight)} toggle={() => controls.change({ showRight: !controls.value.showRight })} />;
      case 'source': return <button type="button" className="preview-source-link" onClick={() => onOpenSource(layoutSource)}>
        <HugeiconsIcon icon={File} size={15} aria-hidden="true" />打开布局文档
      </button>;
    }
  }
  return <ConversationTurn data-revision={turn.id}>
    <UserMessage actions={<>
      {failedSend && <Alert tone="danger" title={online ? '发送失败' : '发送失败，联网后可重新发送'} action={retry} />}
      <MessageActions aria-label="用户消息操作" timestamp={<MessageTime value={turn.sentAt} />}>
        <CopyButton label="复制消息" text={turn.prompt || turn.files?.map(file => file.title).join('\n') || ''} />
        <Tooltip content="编辑消息"><PaneButton icon={Edit} aria-label="编辑消息" disabled={busy} onClick={onEdit} /></Tooltip>
      </MessageActions>
    </>} attachments={(turn.quote || Boolean(turn.files?.length)) && <>
      {turn.quote && <MessageQuote source="助手回复" text={turn.quote.text} onOpen={() => onOpenQuote(turn.quote!)} />}
      {turn.files && <ChatAttachments files={turn.files} onOpen={onOpenSource} />}
    </>}>
      {turn.prompt}
    </UserMessage>
    {failedSend && versionControl}
    {!failedSend && process.length > 0 && <TurnProcess running={running} defaultExpanded={search}
      label={turn.state === 'stopped' ? '处理已停止' : '已处理 ' + (turn.seconds ?? 0) + ' 秒'}>
      <ActivitySequence items={process} getKey={block => block.id} renderItem={renderBlock}
        group={{ by: block => block.kind === 'tool' ? block.group : undefined,
          render: (blocks, rows) => <ActionGroup defaultExpanded={search}
            icon={search ? <HugeiconsIcon icon={Search} size={14} /> : undefined}
            label={search ? '已搜索网页、抓取网页' : '查看了 ' + blocks.length + ' 项布局设置'}>{rows}</ActionGroup> }} />
    </TurnProcess>}
    {!failedSend && <AssistantMessage data-reply-id={turn.id} streaming={running} actions={turn.finishedAt != null && <PreviewReplyActions revision={turn.id} text={replyText}
      time={turn.finishedAt} busy={busy || !online} hidden={hidden} vote={controls.value.vote} onVote={vote => controls.change({ vote })} versions={versionControl} onQuote={() => onQuote({ turnId: turn.id, text: replyText })} onRegenerate={onRetry} />}>
      <ActivitySequence items={answer} getKey={block => block.id} renderItem={renderBlock} />
      {running && <span role="status" aria-label="正在生成" className="preview-stream-status"
        data-waiting={!answer.length && !process.length || undefined}>{!answer.length && !process.length && '正在生成'}</span>}
      {turn.state === 'stopped' && <small>已停止生成</small>}
      {turn.state === 'reply-error' && versionControl}
      {turn.state === 'reply-error' && <Alert tone="danger" title={online ? '回复中断' : '回复中断，联网后可重试'} action={retry} />}
    </AssistantMessage>}
  </ConversationTurn>;
}

export default function PreviewChat({ seeded, hidden, effect, onOpenSource, onReplyComplete }: {
  seeded: boolean; hidden: boolean; effect: StreamingEffect; onOpenSource: OpenSource; onReplyComplete: () => void;
}) {
  const [draft, setDraft] = useState('');
  const [quote, setQuote] = useState<Quote>();
  const voice = usePreviewVoice(hidden);
  const root = useRef<HTMLDivElement>(null);
  const [jump, setJump] = useState<Quote>();
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [olderCount, setOlderCount] = useState(() => seeded && new URLSearchParams(window.location.search).get('example') === 'chat'
    ? archive.length - pageSize : 0);
  const [permission, setPermission] = useState('full');
  const [model, setModel] = useState('GPT-6.2 Astra');
  const [level, setLevel] = useState('极高');
  const input = useRef<HTMLTextAreaElement>(null);
  const attachments = useChatFiles(input);
  const [editing, setEditing] = useState<{ id: string; draft: string; files: ChatFile[]; quote?: Quote } | null>(null);
  const insertedCaret = useRef<number | null>(null);
  const [turns, setTurns] = useState<Turn[]>(() => initialTurns(seeded));
  const groups = new Map<string, Turn[]>();
  for (const turn of turns) {
    const id = turn.groupId ?? turn.id;
    const versions = groups.get(id);
    if (versions) versions.push(turn);
    else groups.set(id, [turn]);
  }
  function loadOlder() {
    const start = Math.max(0, olderCount - pageSize);
    const older = archive.slice(start, olderCount);
    setTurns(all => [...older, ...all]);
    setOlderCount(start);
  }
  function cite(value: Quote) {
    setQuote(value);
    input.current?.focus({ preventScroll: true });
  }
  function openQuote(value: Quote) {
    const source = turns.find(turn => turn.id === value.turnId);
    if (!source) return;
    setSelected(all => ({ ...all, [source.groupId ?? source.id]: source.id }));
    setJump(value);
  }
  useLayoutEffect(() => {
    if (!jump) return;
    const el = root.current?.querySelector<HTMLElement>('[data-reply-id="' + CSS.escape(jump.turnId) + '"]');
    const view = root.current?.querySelector<HTMLElement>('[data-nf-thread-scroll]');
    if (el && view) {
      el.tabIndex = -1;
      el.addEventListener('blur', () => el.removeAttribute('tabindex'), { once: true });
      el.focus({ preventScroll: true });
      view.scrollTop += el.getBoundingClientRect().top - view.getBoundingClientRect().top - 12;
    }
    setJump(undefined);
  }, [jump]);
  function addVersion(source: Turn, turn: Turn) {
    const groupId = source.groupId ?? source.id;
    setTurns(all => [...all, { ...turn, groupId }]);
    setSelected(all => ({ ...all, [groupId]: turn.id }));
  }
  const current = turns.find(turn => turn.state === 'running');
  const running = Boolean(current);
  const [online, setOnline] = useState(true);
  const notifyReplyComplete = useEffectEvent(onReplyComplete);
  useEffect(() => {
    function syncNetwork() {
      setOnline(navigator.onLine);
      if (!navigator.onLine) setTurns(all => all.map(turn => turn.state === 'running' ? { ...turn, state: 'reply-error' } : turn));
    }
    syncNetwork();
    window.addEventListener('online', syncNetwork);
    window.addEventListener('offline', syncNetwork);
    return () => {
      window.removeEventListener('online', syncNetwork);
      window.removeEventListener('offline', syncNetwork);
    };
  }, []);
  useEffect(() => {
    if (!current) return;
    const sample = examples[current.example];
    const timer = setTimeout(() => {
      if (!navigator.onLine) return;
      const step = current.step + 1;
      const done = step >= (current.answerText?.length ?? lastStep(current.example));
      setTurns(all => all.map(turn => turn === current ? {
        ...turn, step, state: done ? 'done' : 'running', finishedAt: done ? Date.now() : undefined,
        seconds: Math.round((Date.now() - turn.started) / 1000),
      } : turn));
      if (done) notifyReplyComplete();
    }, current.example === 'markdown' ? 100 : current.step >= sample.work.length + sample.reply.length ? 32 : 550);
    return () => clearTimeout(timer);
  }, [current]);

  function restoreDraft() {
    setDraft(editing?.draft ?? '');
    setQuote(editing?.quote);
    attachments.setFiles(editing?.files ?? []);
    setEditing(null);
    input.current?.focus();
  }

  function edit(turn: Turn) {
    setEditing({ id: turn.id, draft, files: attachments.files, quote });
    setDraft(turn.prompt);
    setQuote(turn.quote);
    attachments.setFiles(turn.files ?? []);
    input.current?.focus();
  }

  function send(text: string) {
    const prompt = text.trim();
    if ((!prompt && !attachments.files.length) || !attachments.ready || running) return;
    let example: Example = 'plain';
    if (attachments.files.length) example = 'files';
    else if (/审批|画布/.test(prompt)) example = 'cards';
    else if (/markdown|排版|表格|正文引用/i.test(prompt)) example = 'markdown';
    else if (/useState/i.test(prompt)) example = 'search';
    else if (/草图|布局/.test(prompt)) example = 'layout';
    const now = Date.now();
    const state = !navigator.onLine ? 'send-error' : lastStep(example) === 1 ? 'done' : 'running';
    const turn: Turn = { id: crypto.randomUUID(), prompt, quote, files: attachments.files, example,
      sentAt: now, started: now, step: state === 'send-error' ? 0 : 1, state, finishedAt: state === 'done' ? now : undefined };
    if (editing) addVersion(turns.find(item => item.id === editing.id)!, turn);
    else setTurns(all => [...all, turn]);
    restoreDraft();
  }

  function retry(turn: Turn) {
    if (running || editing || !navigator.onLine) return;
    if (turn.state === 'done' || turn.state === 'stopped') {
      const now = Date.now();
      const answerText = turn.example === 'plain' && !turn.answerText
        ? '用左上角的侧栏按钮切换项目列表。收起侧栏后，对话会获得更多阅读空间。' : turn.answerText;
      addVersion(turn, { ...turn, id: crypto.randomUUID(), answerText, started: now, finishedAt: undefined, seconds: 0, step: 0, state: 'running' });
      return;
    }
    const resuming = turn.state === 'reply-error';
    setTurns(all => all.map(item => item.id !== turn.id ? item : {
      ...item, state: 'running', started: Date.now() - (resuming ? (item.seconds ?? 0) * 1000 : 0), finishedAt: undefined,
      step: resuming ? item.step : 0, seconds: resuming ? item.seconds : 0,
    }));
    input.current?.focus({ preventScroll: true });
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

  function focusCaret() {
    const caret = insertedCaret.current;
    insertedCaret.current = null;
    input.current?.focus({ preventScroll: true });
    if (caret !== null) input.current?.setSelectionRange(caret, caret);
  }
  function restoreCaret(event: Event) {
    const caret = insertedCaret.current;
    if (caret === null) return;
    event.preventDefault();
    focusCaret();
  }

  function insertDictation(text: string) {
    insertText(text, null);
    requestAnimationFrame(focusCaret);
  }
  const quoteOnly = Boolean(quote && !draft.trim() && !attachments.files.length && !editing && !running);
  const microphone = <PreviewVoiceAction voice={voice} mode="dictation" primary={quoteOnly} onSelect={insertDictation} />;
  return <ConversationView ref={root} hidden={hidden} className="preview-chat"
    onLoadEarlier={olderCount ? loadOlder : undefined}
    onQuoteSelection={({ text, message }) => cite({ text, turnId: message.dataset.replyId! })}
    empty={<h2>想先看什么？</h2>}
    composer={<ConversationComposer ref={input} value={draft} onValueChange={setDraft} onSend={() => send(draft)}
      readOnly={Boolean(voice.mode)} contextContent={<>
        {quote && <MessageQuote source="助手回复" text={quote.text} onOpen={() => openQuote(quote)} onRemove={() => {
          setQuote(undefined);
          input.current?.focus({ preventScroll: true });
        }} />}
        <VoiceStatus voice={voice} onSample={insertDictation}
          onDismiss={() => { voice.cancel(); input.current?.focus({ preventScroll: true }); }} />
      </>} attachments={attachments.files.length > 0 && <ChatAttachments files={attachments.files} onOpen={onOpenSource}
        onRemove={attachments.remove} transferFor={attachments.transferFor} />}
      onFilesAdd={attachments.add} canSend={!voice.mode && attachments.ready && Boolean(draft.trim() || attachments.files.length)}
      sendLabel={editing ? '保存并重新发送' : undefined}
      running={running} onStop={() => setTurns(all => all.map(turn => turn === current ? { ...turn, state: 'stopped', finishedAt: Date.now() } : turn))}
      placeholder={quote ? '针对这段回复提问…' : '输入消息，@ 引用文档，/ 选择操作'} tools={<>
        {attachments.picker}
        {editing && <Button variant="ghost" onClick={restoreDraft}>取消编辑</Button>}
        <ComposerActionMenu className="preview-composer-menu" onCloseAutoFocus={event => {
          attachments.onCloseAutoFocus(event);
          restoreCaret(event);
        }}>
          {match => [
            !match && <MenuItem key="file" icon={Attach} onSelect={attachments.choose}>添加文件</MenuItem>,
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
        {!quoteOnly && microphone}
      </>} emptyAction={quoteOnly ? microphone : editing ? undefined : <PreviewVoiceAction voice={voice} mode="chat" onSelect={text => {
        insertedCaret.current = 0;
        send(text);
      }} onCloseAutoFocus={restoreCaret} />} />}>
    {Array.from(groups, ([groupId, versions]) => {
      const turn = versions.find(item => item.id === selected[groupId]) ?? versions[versions.length - 1];
      return <PreviewTurn key={groupId} turn={turn} effect={effect} busy={running || Boolean(editing)} online={online} hidden={hidden}
        onQuote={cite} onOpenQuote={openQuote} onEdit={() => edit(turn)} onRetry={() => retry(turn)} onOpenSource={onOpenSource}
        versionControl={versions.length > 1 && <Pagination aria-label="回复版本" page={versions.indexOf(turn) + 1} pageCount={versions.length}
          previousLabel="上一版回复" nextLabel="下一版回复" onPageChange={page => setSelected(all => ({ ...all, [groupId]: versions[page - 1].id }))} />} />;
    })}
  </ConversationView>;
}
