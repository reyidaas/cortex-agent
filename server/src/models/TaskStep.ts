import { randomUUID } from 'crypto';
import type { TaskStatus } from '@/models/Task';

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
}
