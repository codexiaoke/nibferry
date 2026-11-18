export interface TaskAttachment {
  id: string;
  name: string;
}

export interface TaskDecision {
  id: string;
  question: string;
  options: readonly {
    id: string;
    label: string;
    description?: string;
  }[];
}
