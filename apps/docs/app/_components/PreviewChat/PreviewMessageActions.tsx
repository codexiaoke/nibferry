'use client';

import { useEffect, useRef, useState } from 'react';
import Feedback from '@hugeicons/core-free-icons/ThumbsUpDownIcon';
import Like from '@hugeicons/core-free-icons/ThumbsUpIcon';
import Dislike from '@hugeicons/core-free-icons/ThumbsDownIcon';
import More from '@hugeicons/core-free-icons/MoreHorizontalIcon';
import Volume from '@hugeicons/core-free-icons/VolumeHighIcon';
import Stop from '@hugeicons/core-free-icons/StopIcon';
import Reload from '@hugeicons/core-free-icons/ReloadIcon';
import { CopyButton, DropdownMenu, MenuContent, MenuItem, MenuTrigger, MessageActions, PaneButton, Tooltip } from 'nibferry';

export function MessageTime({ value }: { value: number }) {
  const date = new Date(value);
  return <time dateTime={date.toISOString()} suppressHydrationWarning>
    {date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
  </time>;
}

export function PreviewReplyActions({ revision, text, time, busy, hidden, vote, onVote, versions, onQuote, onRegenerate }: {
  vote?: 'up' | 'down'; onVote: (vote?: 'up' | 'down') => void;
  versions: React.ReactNode; onQuote: () => void;
  revision: string; text: string; time: number; busy: boolean; hidden: boolean; onRegenerate: () => void;
}) {
  const quoting = useRef(false);
  const [speaking, setSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const voice = useRef<SpeechSynthesisUtterance | null>(null);
  useEffect(() => {
    setSpeaking(false);
    setSpeechError('');
    return () => {
      if (voice.current) {
        voice.current.onend = voice.current.onerror = null;
        voice.current = null;
        window.speechSynthesis.cancel();
      }
    };
  }, [hidden, revision]);
  function read() {
    setSpeechError('');
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      setSpeechError('当前浏览器不支持朗读');
      return;
    }
    window.speechSynthesis.cancel();
    if (speaking) { setSpeaking(false); return; }
    const utterance = new SpeechSynthesisUtterance(text);
    voice.current = utterance;
    utterance.lang = 'zh-CN';
    function finish(error?: string) {
      if (voice.current !== utterance) return;
      voice.current = null;
      setSpeaking(false);
      if (error && error !== 'canceled' && error !== 'interrupted') setSpeechError('无法朗读，请检查设备语音设置');
    }
    utterance.onend = () => finish();
    utterance.onerror = event => finish(event.error);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }
  const speechLabel = speaking ? '停止朗读' : '朗读回复';
  return <MessageActions aria-label="回复操作" timestamp={<MessageTime value={time} />}>
    <CopyButton label="复制回复" text={text} />
    <DropdownMenu modal={false}>
      <MenuTrigger asChild><PaneButton icon={vote === 'up' ? Like : vote === 'down' ? Dislike : Feedback}
        aria-label="评价回复" title="评价回复" /></MenuTrigger>
      <MenuContent side="top" align="start">
        <MenuItem icon={Like} onSelect={() => onVote(vote === 'up' ? undefined : 'up')}>{vote === 'up' ? '撤销有帮助' : '有帮助'}</MenuItem>
        <MenuItem icon={Dislike} onSelect={() => onVote(vote === 'down' ? undefined : 'down')}>{vote === 'down' ? '撤销无帮助' : '无帮助'}</MenuItem>
      </MenuContent>
    </DropdownMenu>
    <Tooltip content={speechLabel}><PaneButton icon={speaking ? Stop : Volume} disabled={!text}
      aria-label={speechLabel} aria-pressed={speaking} onClick={read} /></Tooltip>
    <DropdownMenu modal={false}>
      <MenuTrigger asChild><PaneButton icon={More} aria-label="更多回复操作" title="更多回复操作" /></MenuTrigger>
      <MenuContent side="top" align="start" onCloseAutoFocus={event => {
        if (quoting.current) { event.preventDefault(); quoting.current = false; }
      }}>
        <MenuItem icon={Reload} disabled={busy} onSelect={onRegenerate}>重新生成</MenuItem>
        <MenuItem disabled={!text} onSelect={() => { quoting.current = true; onQuote(); }}>引用回复</MenuItem>
      </MenuContent>
    </DropdownMenu>
    {versions}
    {speechError && <span role="status">{speechError}</span>}
  </MessageActions>;
}
