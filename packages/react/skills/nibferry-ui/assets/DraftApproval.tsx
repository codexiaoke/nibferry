'use client';

import { useRef, useState } from 'react';
import {
  AssistantMessage, Button, ConversationTurn, MessageCard, Tag, UserMessage,
} from 'nibferry';

export default function DraftApproval() {
  const [decision, setDecision] = useState<'已通过' | '已退回'>();
  const status = useRef<HTMLSpanElement>(null);

  function decide(next: '已通过' | '已退回') {
    setDecision(next);
    status.current?.focus();
  }

  return (
    <ConversationTurn>
      <UserMessage>整理一下新版手册的交接安排。</UserMessage>
      <AssistantMessage>
        <p>周三由编辑核对修订记录，周四交给支持团队试读。</p>
        <MessageCard title="手册交接草案"
          status={<Tag role="status" tabIndex={-1} ref={status}>{decision ?? '待确认'}</Tag>}
          actions={!decision && <>
            <Button variant="primary" onClick={() => decide('已通过')}>通过</Button>
            <Button onClick={() => decide('已退回')}>退回</Button>
          </>}>
          通过后，支持团队将按此安排试读。
        </MessageCard>
      </AssistantMessage>
    </ConversationTurn>
  );
}
