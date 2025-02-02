import { randomUUID } from 'crypto';
import type { TaskStatus } from '@/models/Task';

type UpdateObject = {
  [Key in keyof Omit<TaskStep, 'update'>]?: TaskStep[Key];
};

export class TaskStep {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  tool: string;
  action: string;
  createdAt: Date;
  updatedAt: Date;

  constructor({
    name,
    description,
    tool,
    action,
  }: Pick<TaskStep, 'name' | 'description' | 'tool' | 'action'>) {
    this.id = randomUUID();
    this.name = name;
    this.description = description;
    this.status = 'pending';
    this.tool = tool;
    this.action = action;
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
