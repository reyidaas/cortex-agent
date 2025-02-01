import { randomUUID } from 'crypto';

import type { TaskStep } from '@/models/TaskStep';

export type TaskStatus = 'pending' | 'completed';

type UpdateObject = {
  [Key in keyof Omit<Task, 'update'>]?: Task[Key];
};

export class Task {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  steps: TaskStep[];
  createdAt: Date;
  updatedAt: Date;

  constructor({ name, description }: Pick<Task, 'name' | 'description'>) {
    this.id = randomUUID();
    this.name = name;
    this.description = description;
    this.status = 'pending';
    this.steps = [];
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
