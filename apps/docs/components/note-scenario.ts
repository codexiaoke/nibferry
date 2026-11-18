import type { TaskAttachment, TaskDecision } from '@nibferry/react';

export const initialTask = '把这三份访谈资料整理成一篇笔记，保留受访者的原话。';
export const materials: readonly (TaskAttachment & { finding: string })[] = [
  { id: 'outline', name: '访谈提纲.md', finding: '本次访谈关注用户如何回到原始材料核对结论。' },
  { id: 'transcript', name: '访谈逐字稿.txt', finding: '一位受访者说：“我想知道这句话是谁说的。”' },
  {
    id: 'observations',
    name: '观察记录.md',
    finding: '两位受访者在复盘时，同时打开了摘要和逐字稿。',
  },
];
export const existingNote = '上次访谈发现，用户习惯先读摘要，再决定是否查看完整材料。';
export const noteTitle = '产品访谈笔记';
export const conflict: TaskDecision = {
  id: 'duplicate-note',
  question: '已有一篇同名笔记，怎么保存？',
  options: [
    { id: 'merge', label: '合并到原笔记', description: '保留原文，把本次发现追加到末尾。' },
    { id: 'copy', label: '另存为新笔记', description: '生成一篇独立笔记，保留已有版本。' },
  ],
};
