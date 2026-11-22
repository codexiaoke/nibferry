'use client';

import { useState } from 'react';
import {
  AssistantMessage, ConversationComposer, ConversationTurn, ConversationView,
  MessageMarkdown, UserMessage,
} from 'nibferry';

const source = '[接入项目](https://codexiaoke.github.io/nibferry/docs/installation/)';

// 预览从两条本地摘录取答案。接入产品时由宿主请求回复和来源。
function answer(question: string) {
  if (/样式|css/i.test(question)) {
    return '在应用入口引入一次 `nibferry/styles.css`。';
  }
  if (/版本|react/i.test(question)) {
    return '项目需要 React 19 和 React DOM 19。';
  }
  return '这份接入说明只收录了 React 版本和样式入口。';
}

export default function DocumentAssistant({
  firstQuestion = '需要哪个版本的 React？', onOpenLink,
}: { firstQuestion?: string; onOpenLink?: (href: string) => void }) {
  const [draft, setDraft] = useState('');
  const [turns, setTurns] = useState([{ id: 'first', question: firstQuestion }]);

  function send() {
    const turn = { id: crypto.randomUUID(), question: draft.trim() };
    setTurns(previous => [...previous, turn]);
    setDraft('');
  }

  return (
    <ConversationView composer={
      <ConversationComposer value={draft} onValueChange={setDraft} onSend={send}
        aria-label="向文档提问" placeholder="向文档提问" />
    }>
      {turns.map(turn => (
        <ConversationTurn key={turn.id}>
          <UserMessage>{turn.question}</UserMessage>
          <AssistantMessage>
            <MessageMarkdown onOpenLink={onOpenLink}>
              {answer(turn.question) + '\n\n来源：' + source}
            </MessageMarkdown>
          </AssistantMessage>
        </ConversationTurn>
      ))}
    </ConversationView>
  );
}
