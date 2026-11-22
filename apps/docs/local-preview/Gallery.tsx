import { useEffect, useState, type ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import Layers from '@hugeicons/core-free-icons/Layers01Icon';
import Help from '@hugeicons/core-free-icons/InformationCircleIcon';
import Folder from '@hugeicons/core-free-icons/Folder01Icon';
import { Alert, Avatar, Button, Checkbox, EmptyState, Field, Input, RadioGroup, Select, Switch,
  Tag, Toast, Tooltip, palettes, themeVariables } from 'nibferry';
import { ContentControlsDemo, RangeProgressDemo } from '../app/_components/ComponentDemos/ContentControlsExamples';

import { SourcePickerDemo, AttachmentsDemo, RecordsDemo } from '../app/_components/ComponentDemos/ResourceExamples';
import { SkeletonDemo } from '../app/_components/ComponentDemos/SkeletonDemo';

const sections = [
  ['input', '输入与操作'],
  ['selection', '布局与偏好'],
  ['feedback', '状态与反馈'],
  ['content', '内容编辑与切换'],
  ['progress', '数值与进度'],
  ['picker', '浮层与搜索选择'],
  ['attachments', '附件与移除确认'],
  ['records', '表格与加载'],
  ['skeleton', '骨架屏'],
] as const;

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return <section id={id} aria-labelledby={id + '-title'} className="gallery-section">
    <h2 id={id + '-title'}>{title}</h2>
    <div className="gallery-panel">{children}</div>
  </section>;
}

function LayoutSketch({ rail }: { rail?: boolean }) {
  return <span className="layout-sketch">
    {rail && <i className="sketch-rail" />}
    <i className="sketch-sidebar" />
    <span className="sketch-page"><i /><i /><i /></span>
  </span>;
}

export default function Gallery() {
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [name, setName] = useState('设计工作区');
  const [draft, setDraft] = useState(name);
  const [error, setError] = useState('');
  const [layout, setLayout] = useState('sidebar');
  const [density, setDensity] = useState('normal');
  const [language, setLanguage] = useState('zh');
  const [alerts, setAlerts] = useState(true);
  const [mentions, setMentions] = useState(false);
  const [synced, setSynced] = useState(false);
  const [hasSource, setHasSource] = useState(false);
  const [notice, setNotice] = useState({ id: 0, message: '' });

  useEffect(() => {
    const style = document.documentElement.style;
    const vars = themeVariables({ colors: palettes.graphite });
    for (const [key, value] of Object.entries(vars)) {
      if (dark) style.setProperty(key, value);
      else style.removeProperty(key);
    }
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    return () => {
      for (const key of Object.keys(vars)) style.removeProperty(key);
      delete document.documentElement.dataset.theme;
    };
  }, [dark]);

  function notify(message: string) {
    setNotice(previous => ({ id: previous.id + 1, message }));
  }

  return <>
    <header className="gallery-header">
      <div><span className="gallery-brand"><HugeiconsIcon icon={Layers} size={22} aria-hidden="true" />Nibferry</span>
        <span className="gallery-private">本地预览</span></div>
      <label className="gallery-control">深色外观 <Switch checked={dark} onChange={event => setDark(event.target.checked)} /></label>
    </header>
    <div className="gallery-page">
      <aside><nav aria-label="组件分组">{sections.map(([id, title]) => <a href={'#' + id} key={id}>{title}</a>)}</nav></aside>
      <main>
        <h1>基础组件</h1>
        <Section id="input" title="输入与操作">
          <div className="gallery-profile">
            <Avatar name={name} /><div><strong>{name}</strong><small>个人工作区</small></div><Tag>所有者</Tag>
          </div>
          <form className="gallery-form" noValidate onSubmit={event => {
            event.preventDefault();
            if (!draft.trim()) { setError('请输入工作区名称'); return; }
            setName(draft.trim()); setDraft(draft.trim()); setError(''); notify('工作区名称已保存');
          }}>
            <Field label="工作区名称" hint="头像默认取名称的前两个字。" error={error}>
              <Input value={draft} required onChange={event => { setDraft(event.target.value); setError(''); }} />
            </Field>
            <div className="gallery-actions"><Button type="button" disabled={draft === name}
              onClick={() => { setDraft(name); setError(''); }}>还原</Button><Button type="submit" variant="primary">保存名称</Button></div>
          </form>
        </Section>
        <Section id="selection" title="布局与偏好">
          <RadioGroup label="桌面导航" variant="cards" value={layout} onValueChange={setLayout}
            options={[{ value: 'sidebar', label: '项目侧栏', visual: <LayoutSketch /> },
              { value: 'rail', label: '常驻导航栏', visual: <LayoutSketch rail /> }]} />
          <div className="gallery-columns">
            <RadioGroup label="列表密度" value={density} onValueChange={setDensity} options={[
              { value: 'normal', label: '标准' }, { value: 'compact', label: '紧凑' },
            ]} />
            <div className="gallery-language"><span>回复语言</span><Select label="回复语言" value={language} onValueChange={setLanguage}
              options={[{ value: 'zh', label: '简体中文' }, { value: 'en', label: 'English' }, { value: 'ja', label: '日本語' }]} /></div>
          </div>
          <div className="gallery-notifications">
            <label className="gallery-row">桌面通知<Switch checked={alerts} onChange={event => setAlerts(event.target.checked)} /></label>
            <label className="gallery-control"><Checkbox checked={mentions} disabled={!alerts}
              onChange={event => setMentions(event.target.checked)} />仅在提到我时通知</label>
          </div>
        </Section>
        <Section id="feedback" title="状态与反馈">
          <div className="gallery-row"><div className="gallery-control"><strong>资料同步</strong>
            <Tooltip content="同步工作区中已添加的来源"><Button className="gallery-icon" variant="ghost" aria-label="同步说明">
              <HugeiconsIcon icon={Help} size={16} aria-hidden="true" />
            </Button></Tooltip></div>
            <Tag tone={synced ? 'accent' : 'neutral'}>{synced ? '已同步' : '待同步'}</Tag>
          </div>
          <Alert tone={synced ? 'info' : 'danger'} title={synced ? '同步完成' : '上次同步失败'}
            action={<Button onClick={() => { setSynced(!synced); if (!synced) notify('同步已完成'); }}>
              {synced ? '重置示例' : '重试'}</Button>}>
            {synced ? '工作区已是最新状态。' : '示例连接已中断，可以重新同步。'}
          </Alert>
          <div className="gallery-sources"><strong>来源</strong>
            {hasSource ? <div className="gallery-source gallery-row">
              <span className="gallery-control"><HugeiconsIcon icon={Folder} size={17} aria-hidden="true" />设计规范</span>
              <Button variant="danger" onClick={() => setHasSource(false)}>移除来源</Button>
            </div> : <EmptyState title="还没有来源" icon={<HugeiconsIcon icon={Folder} size={24} />}
              action={<Button onClick={() => setHasSource(true)}>添加示例来源</Button>} />}
          </div>
        </Section>
        <Section id="content" title="内容编辑与切换"><ContentControlsDemo /></Section>
        <Section id="progress" title="数值与进度"><RangeProgressDemo /></Section>
        <Section id="picker" title="浮层与搜索选择"><SourcePickerDemo /></Section>
        <Section id="attachments" title="附件与移除确认"><AttachmentsDemo /></Section>
        <Section id="records" title="表格与加载"><RecordsDemo /></Section>
        <Section id="skeleton" title="骨架屏"><SkeletonDemo /></Section>
      </main>
    </div>
    <Toast notificationId={notice.id} className="gallery-toast" message={notice.message} onDismiss={() => notify('')} />
  </>;
}
