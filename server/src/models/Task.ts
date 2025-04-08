import { randomUUID } from 'crypto';

import type { Document, DocumentType } from './Document';

export type TaskStatus = 'pending' | 'completed';

type UpdateObject = {
  [Key in keyof Omit<Task, 'update'>]?: Task[Key];
};

export class Task {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  tool: string;
  action: string;
  result: Document<DocumentType> | null;
  createdAt: Date;
  updatedAt: Date;

  constructor({
    name,
    description,
    tool,
    action,
  }: Pick<Task, 'name' | 'description' | 'tool' | 'action'>) {
    this.id = randomUUID();
    this.name = name;
    this.description = description;
    this.tool = tool;
    this.action = action;
    this.result = null;
    this.status = 'pending';
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  update(updateObj: UpdateObject): void {
    const entries = Object.entries(updateObj);
    entries.forEach(([key, value]) => {
      if (value) this[key as keyof typeof this] = value as (typeof this)[keyof typeof this];
    });

    this.updatedAt = new Date();
  }
}
