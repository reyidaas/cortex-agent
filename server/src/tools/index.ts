import { FinalAnswer } from './FinalAnswer';
import { Web } from './Web';
import { AiModel } from './AiModel';

export const tools = {
  'final-answer': FinalAnswer,
  'web': Web,
  'ai-model': AiModel,
};

export type ToolName = keyof typeof tools;
