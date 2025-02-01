import { randomUUID } from 'crypto';

export class TaskStep {
  id: string;

  constructor() {
    this.id = randomUUID();
  }
}
