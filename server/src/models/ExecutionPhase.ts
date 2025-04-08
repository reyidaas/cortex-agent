import { Signale } from 'signale';

import { generateToolPayloadPrompt } from '@/prompts/tools';
import { getJsonCompletion } from '@/util/openai';
import { hasPropertyOfType } from '@/util/types';
import { parseKebabCase } from '@/util/formatting';
import { GetterSetter } from '@/models/GetterSetter';
import { StatusError } from '@/models/StatusError';
import { Document, type DocumentType } from '@/models/Document';
import { tools } from '@/tools';
import { Tool } from '@/models/Tool';
import type { Task } from '@/models/Task';
import type { State } from '@/models/State';

interface ExecutionState {
  task: Task | null;
  payload: unknown;
  finished: boolean;
  logger: Signale;
}

export class ExecutionPhase extends GetterSetter<ExecutionState> {
  constructor() {
    super({
      task: null,
      payload: null,
      finished: false,
      logger: new Signale({ scope: 'exectution' }),
    });
  }

  async generateToolPayload(message: string, state: State): Promise<unknown> {
    const task = this.get('task');
    if (!task) {
      throw new StatusError('No task step to generate payload for.');
    }

    const tool = state
      .get('config')
      .get('tools')
      .find(({ name }) => name === task.tool);
    if (!tool) {
      throw new StatusError('Tool not found');
    }

    const action = tool.actions.find(({ name }) => name === task.action);
    if (!action) {
      throw new StatusError('Action not found');
    }

    this.get('logger').note(`Generating payload for tool: ${tool.name}, action: ${action.name}`);

    const response = await getJsonCompletion({
      message,
      name: 'generate-tool-payload',
      system: generateToolPayloadPrompt(state),
      log: { state, name: `generate-tool-payload-${parseKebabCase(task.name)}` },
    });

    if (!hasPropertyOfType('result', 'object')(response)) {
      throw new StatusError('Incorrect generated JSON');
    }

    return response.result;
  }

  async useTool<T extends DocumentType>(message: string, state: State): Promise<Document<T>> {
    const task = this.get('task');
    if (!task) {
      throw new StatusError("Can't use tool - no current task");
    }

    if (!Tool.isValidToolName(task.tool)) {
      throw new StatusError("Can't use tool - invalid tool name in current task");
    }
    const SelectedTool = tools[task.tool];
    const toolInstance = new SelectedTool();

    if (!toolInstance.validateActionName(task.action)) {
      throw new StatusError("Can't use tool - invalid action name in current task");
    }

    this.get('logger').note(`Using tool: ${task.tool}, action: ${task.action}`);

    // @ts-ignore
    const SelectedAction = toolInstance.getAction(task.action);
    const actionInstance = new SelectedAction();

    const payload = this.get('payload');
    if (!actionInstance.validatePayload(payload)) {
      throw new StatusError("Can't use tool - invalid action payload");
    }

    const result = await actionInstance.execute(payload, message, state);

    return result;
  }
}
