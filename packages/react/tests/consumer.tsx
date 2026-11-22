import Gallery from '../../../apps/docs/local-preview/Gallery';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import Folder from '@hugeicons/core-free-icons/Folder01Icon';
import Search from '@hugeicons/core-free-icons/Search01Icon';
import {
  ActivitySequence, ComposerActionMenu, ComposerModelSelect, ComposerSelect, ConversationComposer,
  ConversationGroup, Dialog, MenuItem, SearchDialog, SummaryGroup,
} from 'nibferry';
import { themeVariables } from 'nibferry/theme';

function GroupedStream() {
  const [items, setItems] = useState(['a']);
  return <><button onClick={() => setItems(['a', 'b'])}>追加</button>
    <ActivitySequence items={items} getKey={id => id} renderItem={id => <input aria-label={id} />}
      group={{ by: () => 'form', render: (_, rows) => <section>{rows}</section> }} /></>;
}

function DialogSelectors() {
  const [model, setModel] = useState('a');
  const options = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }];
  return <Dialog open onOpenChange={() => {}} aria-label="设置" style={themeVariables({ colors: { canvas: '#facade' } })}>
    <ComposerModelSelect models={options} model={model} onModelChange={setModel} levels={[]} level="" onLevelChange={() => {}} />
    <ComposerSelect label="权限" options={options} value={model} onValueChange={setModel} />
  </Dialog>;
}

function SymbolMenus() {
  const [draft, setDraft] = useState('');
  const [commands, setCommands] = useState(true);
  return <><button onClick={() => setCommands(false)}>移除命令</button>
    <ConversationComposer value={draft} onValueChange={setDraft} onSend={() => {}} tools={<>
      <ComposerActionMenu label="引用" triggers={['@']}>
        {match => match && <MenuItem>{'引用 ' + match.query}</MenuItem>}
      </ComposerActionMenu>
      {commands && <ComposerActionMenu label="命令" triggers={['/', '@@']}>
        {match => <MenuItem>{match ? match.symbol + ' ' + match.query : '命令列表'}</MenuItem>}
      </ComposerActionMenu>}
    </>} /></>;
}

function AttachmentComposer() {
  const [attached, setAttached] = useState(false);
  const [sent, setSent] = useState(0);
  return <><output>{sent}</output>
    <ConversationComposer value="" onValueChange={() => {}} canSend={attached}
      onSend={() => setSent(count => count + 1)} emptyAction={<button>语音</button>}
      tools={<button onClick={() => setAttached(value => !value)}>切换附件</button>} /></>;
}

function RemoteSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(true);
  const [selected, select] = useState('');
  return <><output>{selected}</output><SearchDialog open={open} onOpenChange={setOpen} label="搜索"
    query={query} onQueryChange={setQuery} filterItem={false}
    groups={[{ id: 'files', label: '文件', items: query === '123' ? [
      { id: 'a', label: '照片', onSelect: () => select('a') },
    ] : [] }]} renderItem={item => <strong>{item.label}</strong>} /></>;
}

function HeaderSlots() {
  const [expanded, setExpanded] = useState(false);
  return <><SummaryGroup label="来源" actions={<button onClick={() => setExpanded(true)}>添加来源</button>} />
    <ConversationGroup label="项目" icon={Search} expandedIcon={Folder} expanded={expanded}
      onToggle={() => setExpanded(value => !value)}>项目内容</ConversationGroup></>;
}

const fixtures = { foundation: Gallery, stream: GroupedStream, dialog: DialogSelectors, menus: SymbolMenus, attachment: AttachmentComposer,
  search: RemoteSearch, headings: HeaderSlots };
const Fixture = fixtures[document.body.dataset.fixture as keyof typeof fixtures];
createRoot(document.getElementById('root')!).render(<Fixture />);
