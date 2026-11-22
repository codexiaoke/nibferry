import { ComposerDemo, MessagesDemo, ProcessDemo } from './ConversationExamples';
import { ContextMenuDemo, DialogDemo, FloatingDemo, SearchDemo } from './OverlayExamples';
import { ProjectListDemo, SidebarDemo, TabsDemo } from './NavigationExamples';
import { ScrollDemo, SpacingDemo, SummaryDemo, WorkspaceDemo } from './LayoutExamples';
import { DropdownDemo } from './DropdownDemo';
import { ModelSelectDemo } from './ModelSelectDemo';
import { ChoicesDemo, FeedbackDemo, FieldsDemo, IdentityDemo } from './FoundationExamples';
import { ContentControlsDemo, RangeProgressDemo } from './ContentControlsExamples';

import { SourcePickerDemo, AttachmentsDemo, RecordsDemo } from './ResourceExamples';
import { SkeletonDemo } from './SkeletonDemo';

const examples: Record<string, React.ComponentType> = {
  Popover: SourcePickerDemo,
  AttachmentList: AttachmentsDemo,
  Table: RecordsDemo,
  Skeleton: SkeletonDemo,
  Field: FieldsDemo,
  RadioGroup: ChoicesDemo,
  Tabs: ContentControlsDemo,
  Slider: RangeProgressDemo,
  Avatar: IdentityDemo,
  Alert: FeedbackDemo,
  ConversationView: MessagesDemo,
  ConversationComposer: ComposerDemo,
  ComposerModelSelect: ModelSelectDemo,
  TurnProcess: ProcessDemo,
  NavigationRail: SidebarDemo,
  ConversationList: ProjectListDemo,
  WorkspaceTabList: TabsDemo,
  WorkspaceLayout: WorkspaceDemo,
  DropdownMenu: DropdownDemo,
  ContextMenu: ContextMenuDemo,
  SearchDialog: SearchDemo,
  Dialog: DialogDemo,
  FloatingPanel: FloatingDemo,
  SummaryCard: SummaryDemo,
  Stack: SpacingDemo,
  ScrollArea: ScrollDemo,
};

export function getExample(name: string) {
  const Demo = examples[name];
  if (!Demo) throw new Error('Missing component preview for ' + name);
  return Demo;
}
