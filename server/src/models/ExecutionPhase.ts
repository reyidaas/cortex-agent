import { z } from 'zod';

import { generateTaskStepsPrompt } from '@/prompts/tasks';
import { generateToolPayloadPrompt } from '@/prompts/tools';
import { getStructuredCompletion, getJsonCompletion } from '@/util/openai';
import { hasPropertyOfType } from '@/util/types';
import { log } from '@/util/log';
import { generateResultWithReasoningSchema } from '@/schema/common';
import { GetterSetter } from '@/models/GetterSetter';
import { StatusError } from '@/models/StatusError';
import { TaskStep } from '@/models/TaskStep';
import { Document, type DocumentType } from '@/models/Document';
import { tools } from '@/tools';
import { Tool } from '@/models/Tool';
import type { Task } from '@/models/Task';
import type { State } from '@/models/State';

interface ExecutionState {
  task: Task | null;
  step: TaskStep | null;
  payload: unknown;
}

type GeneratedTaskStep = Pick<TaskStep, 'name' | 'description' | 'tool' | 'action'>;

export class ExecutionPhase extends GetterSetter<ExecutionState> {
  constructor() {
    super({ task: null, step: null, payload: null });
  }

  async generateCurrentTaskSteps(message: string, state: State): Promise<GeneratedTaskStep[]> {
    const schema = generateResultWithReasoningSchema(
      z.array(
        z.object({
          id: z.null(),
          status: z.literal('pending'),
          name: z.string(),
          description: z.string(),
          tool: z.enum(Object.keys(tools) as [string, ...string[]]),
          action: z.string(),
        }),
      ),
    );

    const response = await getStructuredCompletion({
      schema,
      name: 'generate-task-steps',
      system: await log(generateTaskStepsPrompt(state), {
        type: 'prompts',
        state,
        name: 'GENERATE TASK STEPS',
      }),
      message,
    });
    console.log('GENERATE TASK STEPS', response);

    return (response?.result as GeneratedTaskStep[]) ?? [];
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
      system: await log(generateToolPayloadPrompt(state), {
        type: 'prompts',
        state,
        name: 'GENERATE TOOL PAYLOAD',
      }),
    });
    console.log('GENERATE TOOL PAYLOAD', response);

    if (!hasPropertyOfType('result', 'object')(response)) {
      throw new StatusError('Incorrect generated JSON');
    }

    return response.result;
  }

  async useTool<T extends DocumentType>(): Promise<Document<T>> {
    const step = this.get('step');
    if (!step) {
      throw new StatusError("Can't use tool - no current step");
    }

    console.log('STEP', step);
    if (!Tool.isValidToolName(step.tool)) {
      throw new StatusError("Can't use tool - invalid tool name in current step");
    }
    const SelectedTool = tools[step.tool];
    const toolInstance = new SelectedTool();

    if (!toolInstance.validateActionName(step.action)) {
      throw new StatusError("Can't use tool - invalid action name in current step");
    }

    // @ts-ignore
    const SelectedAction = toolInstance.getAction(step.action);
    const actionInstance = new SelectedAction();

    const payload = this.get('payload');
    if (!actionInstance.validatePayload(payload)) {
      throw new StatusError("Can't use tool - invalid action payload");
    }

    const result = await actionInstance.execute(payload);
    console.log('ACTION RESULT', result);

    return result;
  }
}
