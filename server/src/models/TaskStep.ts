import { randomUUID } from 'crypto';

// TODO: task step - unimplemented
export class TaskStep {
  id: string;

  constructor() {
    this.id = randomUUID();
  }
}
