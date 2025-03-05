import { z } from 'zod';

import { generateOrUpdateTasksPrompt } from '@/prompts/tasks';
import { getStructuredCompletion } from '@/util/openai';
import { generateResultWithReasoningSchema } from '@/schema/common';
import { State } from '@/models/State';
import { Task } from '@/models/Task';
import { GetterSetter } from '@/models/GetterSetter';
import type { Memory } from '@/prompts/memories';

interface PlanningState {
  tasks: Task[];
  memories: Memory[];
}

type GeneratedTask = Pick<Task, 'name' | 'description' | 'status'> & {
  id: string | null;
};

export class PlanningPhase extends GetterSetter<PlanningState> {
  constructor() {
    super({ tasks: [], memories: [] });
  }

  parseToPromptText(fields: (keyof PlanningState)[]): string {
    let parsedText = '';

    fields.forEach((field) => {
      if (parsedText) parsedText += '\n\n';

      parsedText += (() => {
        switch (field) {
          case 'memories':
            return this.parseMemoriesToPromptText();
          case 'tasks':
            return this.parseTasksToPromptText();
          default:
            return '';
        }
      })();
    });

    return parsedText;
  }

  private parseMemoriesToPromptText(): string {
    const memories = this.get('memories')
      .map(
        ({ name, content }) => `\
<memory name="${name}">
${content}
</memory>`,
      )
      .join('\n');

    return `\
<memories>
${memories}
</memories>`;
  }

  private parseTasksToPromptText(): string {
    const tasks = this.get('tasks')
      .map(
        ({ name, description, status, steps }) => `\
<task name="${name}" status="${status}" description="${description}">
${
  steps.length
    ? `\
<steps>
${steps
  .map(
    (step) => `\
<step name="${step.name}" status="${step.status}" description="${step.description}">
${
  step.result
    ? `\
<result>
${step.result.value.text}
</result>`
    : ''
}
</step>`,
  )
  .join('\n')}
</steps>`
    : ''
}
</task>`,
      )
      .join('\n');

    return `\
<tasks>
${tasks}
</tasks>`;
  }

  async generateOrUpdateTasks(message: string, state: State): Promise<GeneratedTask[]> {
    const schema = generateResultWithReasoningSchema(
      z.array(
        z.object({
          id: z.string().or(z.null()),
          name: z.string(),
          description: z.string(),
          status: z.enum(['pending', 'completed']),
        }),
      ),
    );

    const response = await getStructuredCompletion({
      schema,
      name: 'generate-or-update-tasks',
      system: generateOrUpdateTasksPrompt(state),
      message,
      log: { state },
    });
    console.log('GENERATE OR UPDATE TASKS', response);

    return response?.result ?? [];
  }

  updateTasks(tasks: GeneratedTask[]) {
    this.set('tasks', (currentTasks) =>
      tasks.map(({ id, name, description }) => {
        const existingTask = id && currentTasks.find((task) => id === task.id);
        if (existingTask) {
          existingTask.update({ name, description });
          return existingTask;
        }

        return new Task({ name, description });
      }),
    );
  }
}
