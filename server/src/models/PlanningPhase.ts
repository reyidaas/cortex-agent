import { z } from 'zod';
import { Signale } from 'signale';

import { generateTasksPrompt } from '@/prompts/tasks';
import { getStructuredCompletion } from '@/util/openai';
import { generateResultWithReasoningSchema } from '@/schema/common';
import { State } from '@/models/State';
import { Task } from '@/models/Task';
import { GetterSetter } from '@/models/GetterSetter';
import type { Memory } from '@/prompts/memories';

interface PlanningState {
  tasks: Task[];
  memories: Memory[];
  logger: Signale;
}

export class PlanningPhase extends GetterSetter<PlanningState> {
  constructor() {
    super({ tasks: [], memories: [], logger: new Signale({ scope: 'planning' }) });
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
        ({ name, description, status, tool, action, result }) => `\
<task name="${name}" status="${status}" description="${description}" toolName="${tool}" actionName="${action}">
${
  result
    ? `\
<result>
${result.value.text}
</result>`
    : ''
}
`,
      )
      .join('\n');

    return `\
<tasks>
${tasks}
</tasks>`;
  }

  async generateTasks(message: string, state: State): Promise<Task[]> {
    this.get('logger').note('Generating tasks...');

    const schema = generateResultWithReasoningSchema(
      z.array(
        z.object({
          name: z.string(),
          description: z.string(),
          tool: z.string(),
          action: z.string(),
        }),
      ),
    );

    const response = await getStructuredCompletion({
      schema,
      name: 'generate-tasks',
      system: generateTasksPrompt(state),
      message,
      log: { state },
    });
    this.get('logger').info(
      'Here is the plan:\n',
      response && response.result.map(({ name }, i) => `${i + 1}. ${name}`).join('\n'),
    );

    return response?.result.map((task) => new Task({ ...task })) ?? [];
  }

  //   updateTasks(tasks: GeneratedTask[]) {
  //     this.set('tasks', (currentTasks) =>
  //       tasks.map(({ id, name, description }) => {
  //         const existingTask = id && currentTasks.find((task) => id === task.id);
  //         if (existingTask) {
  //           existingTask.update({ name, description });
  //           return existingTask;
  //         }
  //
  //         return new Task({ name, description });
  //       }),
  //     );
  //   }
}
