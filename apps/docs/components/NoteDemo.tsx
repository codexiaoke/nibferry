'use client';

import { useId, useLayoutEffect, useRef, useState } from 'react';
import { DecisionPanel, TaskComposer, TaskInputSurface } from '@nibferry/react';
import { HugeiconsIcon } from '@hugeicons/react';
import NotebookIcon from '@hugeicons/core-free-icons/Note01Icon';
import ArrowIcon from '@hugeicons/core-free-icons/ArrowRight01Icon';
import BackIcon from '@hugeicons/core-free-icons/ArrowLeft01Icon';
import ReloadIcon from '@hugeicons/core-free-icons/ReloadIcon';
import FilesIcon from '@hugeicons/core-free-icons/BookOpen01Icon';
import { conflict, existingNote, initialTask, materials, noteTitle } from './note-scenario';

export function NoteDemo() {
  const [revision, reset] = useState(0);
  return (
    <section className="demo" aria-label="资料整理示例">
      <div className="demo-bar">
        <div>
          <HugeiconsIcon icon={NotebookIcon} size={18} aria-hidden="true" />
          <strong>资料整理</strong>
          <span className="local-label">本地示例</span>
        </div>
        <button className="plain-action" onClick={() => reset(revision + 1)}>
          <HugeiconsIcon icon={ReloadIcon} size={16} aria-hidden="true" />
          重新体验
        </button>
      </div>
      <NoteSession key={revision} />
    </section>
  );
}

function NoteSession() {
  const [phase, setPhase] = useState<'compose' | 'decide' | 'done'>('compose');
  const [draft, setDraft] = useState(initialTask);
  const [choice, setChoice] = useState('');
  const [reader, setReader] = useState<'original' | 'result' | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState('');
  const [edited, setEdited] = useState('');
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState('');
  const refLink = useRef<HTMLButtonElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  const previousReader = useRef(reader);
  const result = useRef<HTMLButtonElement>(null);
  const steps = useId();
  const resultTitle = choice === 'copy' ? noteTitle + '（新）' : noteTitle;

  useLayoutEffect(() => {
    if (reader) back.current?.focus({ preventScroll: true });
    else if (previousReader.current)
      (phase === 'done' ? result : refLink).current?.focus({ preventScroll: true });
    previousReader.current = reader;
  }, [reader, phase]);

  useLayoutEffect(() => {
    if (phase === 'done') result.current?.focus({ preventScroll: true });
  }, [phase]);

  function choose(id: string) {
    const findings = materials.map((file) => file.finding).join('\n\n');
    setSaved(id === 'merge' ? existingNote + '\n\n' + findings : findings);
    setChoice(id);
    setReader(null);
    setPhase('done');
    setNotice('笔记已生成');
  }

  function closeReader() {
    setReader(null);
    setEditing(false);
  }

  return (
    <div className="demo-layout" data-reading={Boolean(reader)}>
      <div className="task-column">
        {phase === 'compose' ? (
          <div className="task-heading">
            <span className="sample-icon">
              <HugeiconsIcon icon={FilesIcon} size={24} aria-hidden="true" />
            </span>
            <h2>整理访谈资料</h2>
            <p>三份示例资料已就绪。发送任务后，可以核对原文，选择合并或另存。</p>
          </div>
        ) : (
          <div className="conversation">
            <p className="user-message">{draft}</p>
            <button
              className="steps-toggle"
              aria-expanded={expanded}
              aria-controls={steps}
              onClick={() => setExpanded(!expanded)}
            >
              <HugeiconsIcon icon={ArrowIcon} size={14} aria-hidden="true" />
              已读完 3 份资料
            </button>
            <div id={steps} className="steps-list" aria-hidden={!expanded} data-open={expanded}>
              <div>
                <ul>
                  {materials.map((file) => (
                    <li key={file.id}>{file.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        {phase === 'done' ? (
          <p className="receipt">
            已{choice === 'merge' ? '合并到' : '另存为'}
            <button
              ref={result}
              className="reference"
              onClick={() => {
                setReader('result');
                setNotice('');
              }}
            >
              《{resultTitle}》
            </button>
            。
          </p>
        ) : (
          <TaskInputSurface scene={phase}>
            {phase === 'compose' ? (
              <TaskComposer
                value={draft}
                onChange={setDraft}
                attachments={materials}
                onSubmit={(text) => {
                  setDraft(text);
                  setPhase('decide');
                }}
              />
            ) : (
              <DecisionPanel
                decision={conflict}
                onChoose={choose}
                reference={
                  <button ref={refLink} className="reference" onClick={() => setReader('original')}>
                    查看原文《{noteTitle}》
                  </button>
                }
              />
            )}
          </TaskInputSurface>
        )}
      </div>
      {reader && (
        <aside
          className="reader"
          aria-label={reader === 'result' ? '整理结果' : '原文'}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && !editing) closeReader();
          }}
        >
          <div className="reader-bar">
            <span>{reader === 'result' ? '整理结果' : '原文'}</span>
            <button className="plain-action" onClick={closeReader} ref={back} disabled={editing}>
              <HugeiconsIcon icon={BackIcon} size={16} aria-hidden="true" />
              返回任务
            </button>
          </div>
          <h3>{reader === 'result' ? resultTitle : noteTitle}</h3>
          {editing ? (
            <form
              className="note-form"
              onSubmit={(e) => {
                e.preventDefault();
                setSaved(edited);
                setEditing(false);
                setNotice('修改已保存在本次示例中');
              }}
            >
              <label htmlFor="note-body">笔记正文</label>
              <textarea
                id="note-body"
                value={edited}
                onChange={(e) => setEdited(e.target.value)}
                autoFocus
                rows={7}
              />
              <div>
                <button className="black-action">保存</button>{' '}
                <button type="button" className="plain-action" onClick={() => setEditing(false)}>
                  取消
                </button>
              </div>
            </form>
          ) : (
            <>
              <p className="note-content">{reader === 'result' ? saved : existingNote}</p>
              {reader === 'result' && (
                <button
                  className="black-action"
                  onClick={() => {
                    setEdited(saved);
                    setEditing(true);
                    setNotice('');
                  }}
                >
                  编辑笔记
                </button>
              )}
            </>
          )}
        </aside>
      )}
      <span role="status" className="live-notice">
        {notice}
      </span>
    </div>
  );
}
