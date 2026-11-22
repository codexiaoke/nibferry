'use client';

import { useEffect, useRef, useState } from 'react';
import Mic from '@hugeicons/core-free-icons/Mic02Icon';
import Waveform from '@hugeicons/core-free-icons/AudioWave01Icon';
import { Button, DropdownMenu, MenuContent, MenuGroup, MenuItem, MenuTrigger, PaneButton, Tooltip, useConversationScrollToLatest } from 'nibferry';

type Mode = 'dictation' | 'chat';
const sampleTranscript = '怎样收起侧栏？';
interface Recognition {
  lang: string;
  onresult: ((event: { results: SpeechRecognitionResultList }) => void) | null;
  onstart: (() => void) | null;
  onspeechend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export function usePreviewVoice(hidden: boolean) {
  const [status, setStatus] = useState('');
  const [mode, setMode] = useState<Mode>();
  const recognition = useRef<Recognition | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  function dispose() {
    clearTimeout(timer.current);
    const rec = recognition.current;
    recognition.current = null;
    if (rec) {
      rec.onstart = rec.onresult = rec.onspeechend = rec.onend = rec.onerror = null;
      rec.abort();
    }
  }
  function cancel() { dispose(); setStatus(''); setMode(undefined); }
  useEffect(() => { if (hidden) cancel(); return dispose; }, [hidden]);

  function start(kind: Mode, sample: boolean, accept: (text: string) => void) {
    dispose();
    setMode(kind);
    if (sample) {
      setStatus('正在转写');
      timer.current = setTimeout(() => { cancel(); accept(sampleTranscript); }, 350);
      return;
    }
    const browser = window as Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const Engine = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    function fail(message: string) { dispose(); setMode(undefined); setStatus(message); }
    if (!Engine) { fail('此浏览器不支持语音识别，可使用示例转写'); return; }
    try {
      const rec = new Engine();
      recognition.current = rec;
      rec.lang = 'zh-CN';
      setStatus('等待麦克风权限');
      rec.onstart = () => setStatus('正在录音');
      rec.onspeechend = () => setStatus('正在转写');
      rec.onresult = event => {
        const text = Array.from(event.results).map(result => result[0]?.transcript ?? '').join('').trim();
        if (!text) { fail('未识别到语音，请重试'); return; }
        cancel();
        accept(text);
      };
      rec.onerror = event => fail(event.error === 'not-allowed' ? '麦克风权限被拒绝，请检查浏览器设置' : '语音识别失败，请重试');
      rec.onend = () => fail('未识别到语音，请重试');
      rec.start();
    } catch { fail('无法启动麦克风，请重试'); }
  }
  function finish() { setStatus('正在转写'); recognition.current?.stop(); }
  return { status, mode, start, finish, cancel };
}

export function PreviewVoiceAction({ mode, voice, onSelect, onCloseAutoFocus, primary }: {
  mode: Mode; voice: ReturnType<typeof usePreviewVoice>; onSelect: (text: string) => void; onCloseAutoFocus?: (event: Event) => void; primary?: boolean;
}) {
  const chat = mode === 'chat';
  const requestLatest = useConversationScrollToLatest();
  const label = chat ? '语音对话' : '语音输入';
  function begin(sample: boolean) {
    voice.start(mode, sample, text => { onSelect(text); if (chat) requestLatest(); });
  }
  if (!chat) return <Tooltip content="听写到输入框"><PaneButton
    className={primary ? 'preview-voice-chat' : 'preview-dictation'} icon={Mic} aria-label={label}
    disabled={Boolean(voice.mode)} onClick={() => begin(false)} /></Tooltip>;
  return <DropdownMenu modal={false}>
    <MenuTrigger asChild><PaneButton className="preview-voice-chat" icon={Waveform}
      disabled={Boolean(voice.mode)} aria-label={label} title={label} /></MenuTrigger>
    <MenuContent side="top" align="end" className="preview-composer-menu" onCloseAutoFocus={onCloseAutoFocus}>
      <MenuItem icon={Mic} onSelect={() => begin(false)}>录音并发送</MenuItem>
      <MenuGroup label="发送示例语音消息">
        <MenuItem onSelect={() => begin(true)}>{sampleTranscript}</MenuItem>
      </MenuGroup>
    </MenuContent>
  </DropdownMenu>;
}

function RecordingTime() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);
  return <time role="timer" aria-label="录音时长">{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</time>;
}

export function VoiceStatus({ voice, onSample, onDismiss }: {
  voice: ReturnType<typeof usePreviewVoice>; onSample: (text: string) => void; onDismiss: () => void;
}) {
  if (!voice.status) return null;
  const recording = voice.status === '正在录音';
  return <div className="preview-voice-status" data-recording={recording || undefined}>
    <span role="status">{voice.status}</span>{recording && <RecordingTime />}
    {recording && <Button variant="ghost" onClick={voice.finish}>结束录音</Button>}
    {!voice.mode && <Button variant="ghost" onClick={() => { voice.cancel(); onSample(sampleTranscript); }}>试用示例听写</Button>}
    <Button variant="ghost" onClick={onDismiss}>{voice.mode ? '取消录音' : '关闭提示'}</Button>
  </div>;
}
