import type { AddTaskArgs } from '@doist/todoist-api-typescript';

import { Action } from '@/models/Action';
import { Document } from '@/models/Document';
import { State } from '@/models/State';
import { hasPropertyOfType } from '@/util/types';
import { createTask } from '@/util/todoist';

export class TodoCreateTask extends Action<AddTaskArgs> {
  constructor() {
    super({ name: 'create-task' });
  }

  override validatePayload(payload: unknown): payload is AddTaskArgs {
    return hasPropertyOfType('content', 'string')(payload);
  }

  override async execute(
    payload: AddTaskArgs,
    _message: string,
    _state: State,
  ): Promise<Document<'text'>> {
    const task = await createTask(payload);
    return new Document('text', { text: `Task created: "${task.content}"` });
  }
}
