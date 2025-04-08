import type { GetTasksArgs } from '@doist/todoist-api-typescript';

import { Action } from '@/models/Action';
import { Document } from '@/models/Document';
import { State } from '@/models/State';
import { getTasks } from '@/util/todoist';

export class GetTasks extends Action<GetTasksArgs> {
  constructor() {
    super({ name: 'get-tasks' });
  }

  override validatePayload(payload: unknown): payload is GetTasksArgs {
    return !!payload && typeof payload === 'object';
  }

  override async execute(
    payload: GetTasksArgs,
    _message: string,
    _state: State,
  ): Promise<Document<'text'>> {
    const tasks = await getTasks(payload);
    return tasks.length
      ? new Document('text', {
          text: `Tasks found: - ${tasks.map(({ content }) => `"${content}"`).join('\n- ')}`,
        })
      : new Document('text', { text: 'No tasks found' });
  }
}
