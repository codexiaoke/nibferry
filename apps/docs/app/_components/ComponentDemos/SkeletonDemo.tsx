'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import Document from '@hugeicons/core-free-icons/File01Icon';
import ImageFile from '@hugeicons/core-free-icons/Image01Icon';
import { Avatar, Skeleton, Switch } from 'nibferry';
import './SkeletonDemo.css';

const files = [
  { name: '工作区交接清单.md', detail: '18 KB · 今天 09:42', author: '林溪', icon: Document, width: '9em' },
  { name: '侧栏草图.png', detail: '320 KB · 昨天 16:08', author: '周宁', icon: ImageFile, width: '6em' },
];

export function SkeletonDemo() {
  const [loading, setLoading] = useState(true);
  return <div className="component-demo"><div className="example-skeleton">
    <div className="example-skeleton-toolbar">
      <strong>最近文件</strong>
      <label>显示骨架<Switch checked={loading} onChange={event => setLoading(event.target.checked)} /></label>
    </div>
    <ul aria-label="最近文件" aria-busy={loading}>
      {files.map(file => <li key={file.name}>
        {loading ? <Skeleton shape="block" className="example-file-tile" /> :
          <span className="example-file-tile"><HugeiconsIcon icon={file.icon} size={20} aria-hidden="true" /></span>}
        <div className="example-file-info">
          <strong>{loading ? <Skeleton style={{ width: file.width }} /> : file.name}</strong>
          <small>{loading ? <Skeleton style={{ width: '8em' }} /> : file.detail}</small>
        </div>
        {loading ? <Skeleton shape="circle" /> : <Avatar name={file.author} />}
      </li>)}
    </ul>
  </div></div>;
}
