export interface CatalogPart {
  name: string;
  title: string;
  url: string;
}

export interface CatalogEntry extends CatalogPart {
  parts: CatalogPart[];
}

export interface CatalogGroup {
  slug: string;
  title: string;
  entries: CatalogEntry[];
}

const categories: {
  title: string;
  slug: string;
  pages: { title: string; parts: Record<string, string> }[];
}[] = [
  { title: '对话与消息', slug: 'messages', pages: [
    { title: '对话与消息', parts: {
      ConversationView: '对话视图',
      ConversationTurn: '对话回合',
      UserMessage: '用户消息',
      AssistantMessage: '助手消息',
    } },
  ] },
  { title: '输入与模型', slug: 'input', pages: [
    { title: '对话输入框', parts: {
      ConversationComposer: '对话输入框',
      ComposerActionMenu: '输入框操作菜单',
      ComposerSelect: '底栏单选菜单',
      ContextUsage: '上下文用量',
    } },
    { title: '模型选择器', parts: {
      ComposerModelSelect: '模型选择器',
    } },
  ] },
  { title: '执行过程', slug: 'process', pages: [
    { title: '回合执行过程', parts: {
      TurnProcess: '回合执行过程',
      ActivitySequence: '流式内容序列',
      ActionGroup: '操作分组',
      ActionRow: '操作行',
      ActionResult: '操作结果',
    } },
  ] },
  { title: '导航与工作区', slug: 'workspace', pages: [
    { title: '图标导航栏', parts: {
      NavigationRail: '图标导航栏',
      NavigationRailItem: '图标导航项',
      SidebarMenu: '侧栏菜单',
      CountBadge: '计数徽标',
    } },
    { title: '会话列表', parts: {
      ConversationList: '会话列表',
      ConversationGroup: '项目分组',
      ConversationItem: '会话条目',
      ProjectInfo: '项目信息卡',
    } },
    { title: '工作区标签栏', parts: {
      WorkspaceTabList: '工作区标签栏',
      WorkspaceTab: '工作区标签',
      WorkspaceTabAdd: '新增标签按钮',
      WorkspaceTabClose: '关闭标签按钮',
    } },
    { title: '工作区布局', parts: {
      WorkspaceLayout: '工作区布局',
      LeftPane: '左侧栏',
      LeftPaneToggle: '左栏开关',
      MainPane: '主体区域',
      RightPane: '右侧栏',
      RightPaneToggle: '右栏开关',
      RightPaneFullscreenToggle: '右栏全屏按钮',
      PaneHeader: '区域标题栏',
      PaneButton: '栏内操作按钮',
      PaneResizeHandle: '分栏拖动手柄',
    } },
  ] },
  { title: '菜单与浮层', slug: 'overlay', pages: [
    { title: '下拉菜单', parts: {
      DropdownMenu: '下拉菜单',
      MenuTrigger: '菜单触发器',
      MenuContent: '菜单面板',
      MenuGroup: '菜单分组',
      MenuItem: '菜单项',
      MenuSeparator: '菜单分隔线',
      MenuSub: '子菜单',
      MenuSubTrigger: '子菜单触发器',
      MenuSubContent: '子菜单面板',
    } },
    { title: '右键菜单', parts: {
      ContextMenu: '右键菜单',
    } },
    { title: '搜索弹框', parts: {
      SearchDialog: '搜索弹框',
    } },
    { title: '模态弹框', parts: {
      Dialog: '模态弹框',
    } },
    { title: '悬浮面板', parts: {
      FloatingPanel: '悬浮面板',
      FloatingPanelTrigger: '悬浮面板开关',
    } },
  ] },
  { title: '摘要与基础布局', slug: 'layout', pages: [
    { title: '摘要卡片', parts: {
      SummaryCard: '摘要卡片',
      SummaryGroup: '摘要分组',
      SummaryItem: '摘要条目',
      SummaryToggle: '摘要开关',
    } },
    { title: '间距布局', parts: {
      Stack: '纵向排列',
      Inline: '横向排列',
    } },
    { title: '悬浮滚动条', parts: {
      ScrollArea: '悬浮滚动条',
    } },
  ] },
  { title: '基础控件', slug: 'foundation', pages: [
    { title: '表单与按钮', parts: { Field: '表单字段', Input: '文本输入框', Button: '按钮' } },
    { title: '选择控件', parts: { RadioGroup: '单选组', Checkbox: '复选框', Switch: '开关', Select: '下拉选择器' } },
    { title: '内容编辑与切换', parts: { Tabs: '内容标签页', Textarea: '多行输入框', Disclosure: '折叠面板' } },
    { title: '数值与进度', parts: { Slider: '滑杆', Progress: '进度指示' } },
    { title: '浮层与搜索选择', parts: { Popover: '锚定浮层', Combobox: '可搜索选择器' } },
    { title: '附件与移除确认', parts: { AttachmentList: '附件列表', AttachmentItem: '附件项', AlertDialog: '确认弹框' } },
    { title: '表格与加载', parts: { Table: '数据表格', Pagination: '分页', NumberField: '数字输入框', Spinner: '加载指示' } },
    { title: '骨架屏', parts: { Skeleton: '骨架屏' } },
    { title: '头像与标签', parts: { Avatar: '头像', Tag: '状态标签' } },
    { title: '提示与反馈', parts: { Alert: '行内提示', Tooltip: '悬停提示', Toast: '短暂提示', EmptyState: '空状态' } },
  ] },
];

const standalone: Record<string, string> = {
  ComposerModelSelect: '/docs/model-select',
  DropdownMenu: '/docs/dropdown-menu',
};

function componentPath(category: string, name: string) {
  const slug = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  return '/docs/components/' + category + '/' + slug;
}

export const catalog: CatalogGroup[] = categories.map(({ title, slug, pages }) => ({
  title, slug,
  entries: pages.map(page => {
    const [name] = Object.keys(page.parts);
    const url = standalone[name] ?? componentPath(slug, name);
    return {
      title: page.title, name, url,
      parts: Object.entries(page.parts).map(([part, title]) => ({
        name: part, title, url: part === name ? url : url + '/#' + part,
      })),
    };
  }),
}));

export const componentPages = catalog.flatMap(group => group.entries);
export const components = componentPages.flatMap(page => page.parts);
export const movedComponents = new Map(catalog.flatMap(group => group.entries.flatMap(page =>
  page.parts.slice(1).map(part => [componentPath(group.slug, part.name), part] as const)
)));
