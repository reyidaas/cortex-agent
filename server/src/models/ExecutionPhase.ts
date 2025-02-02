import { z } from 'zod';

import { generateTaskStepsPrompt } from '@/prompts/tasks';
import { getStructuredCompletion } from '@/util/openai';
import { generateResultWithReasoningSchema } from '@/schema/common';
import { GetterSetter } from '@/models/GetterSetter';
import type { Task } from '@/models/Task';
import type { State } from '@/models/State';
import { TaskStep } from '@/models/TaskStep';

interface ExecutionState {
  current: {
    task: Task | null;
    step: TaskStep | null;
  };
}

// type GeneratedTaskStep = Pick<TaskStep, 'name' | 'description' | 'tool' | 'action'>;

export class ExecutionPhase extends GetterSetter<ExecutionState> {
  constructor() {
    super({ current: { task: null, step: null } });
  }

  async generateCurrentTaskSteps(message: string, state: State): Promise<TaskStep[]> {
    const schema = generateResultWithReasoningSchema(
      z.array(
        z.object({
          id: z.null(),
          status: z.literal('pending'),
          name: z.string(),
          description: z.string(),
          tool: z.string(),
          action: z.string(),
        }),
      ),
    );

    const response = await getStructuredCompletion({
      schema,
      name: 'generate-task-steps',
      system: generateTaskStepsPrompt(state),
      message,
    });
    console.log('GENERATE TASK STEPS', response);

    const steps = response?.result ?? [];
    this.get('current').task!.update({ steps: steps.map((step) => new TaskStep(step)) });

    return this.get('current').task!.steps;
  }
}
