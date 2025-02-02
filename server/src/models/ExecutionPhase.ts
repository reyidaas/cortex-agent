import { z } from 'zod';

import { generateTaskStepsPrompt } from '@/prompts/tasks';
import { generateToolPayloadPrompt } from '@/prompts/tools';
import { getStructuredCompletion, getJsonCompletion } from '@/util/openai';
import { hasPropertyOfType } from '@/util/types';
import { generateResultWithReasoningSchema } from '@/schema/common';
import { GetterSetter } from '@/models/GetterSetter';
import { StatusError } from '@/models/StatusError';
import type { Task } from '@/models/Task';
import type { State } from '@/models/State';
import { TaskStep } from '@/models/TaskStep';

interface ExecutionState {
  task: Task | null;
  step: TaskStep | null;
}

// type GeneratedTaskStep = Pick<TaskStep, 'name' | 'description' | 'tool' | 'action'>;

export class ExecutionPhase extends GetterSetter<ExecutionState> {
  constructor() {
    super({ task: null, step: null });
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
    this.get('task')!.update({ steps: steps.map((step) => new TaskStep(step)) });

    return this.get('task')!.steps;
  }

  async generateToolPayload(message: string, state: State): Promise<unknown> {
    const step = this.get('step');
    if (!this.get('task') || !step) {
      throw new StatusError('No task step to generate payload for.');
    }

    const tool = state
      .get('config')
      .get('tools')
      .find(({ name }) => name === step.tool);
    if (!tool) {
      throw new StatusError('Tool not found');
    }

    const action = tool.actions.find(({ name }) => name === step.action);
    if (!action) {
      throw new StatusError('Action not found');
    }

    const response = await getJsonCompletion({
      message,
      system: generateToolPayloadPrompt(state),
    });
    console.log('GENERATE TOOL PAYLOAD', response);

    if (!hasPropertyOfType('result', 'object')(response)) {
      throw new StatusError('Incorrect generated JSON');
    }

    return response.result;
  }
}
