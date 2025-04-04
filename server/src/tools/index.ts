import { FinalAnswer } from './FinalAnswer';
import { Web } from './Web';
import { AiModel } from './AiModel';
import { Todo } from './Todo';

export const tools = {
  'final-answer': FinalAnswer,
  'web': Web,
  'ai-model': AiModel,
  'todo': Todo,
};

export type ToolName = keyof typeof tools;
