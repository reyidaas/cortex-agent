import { FinalAnswer } from './FinalAnswer';
import { Web } from './Web';
import { AiModel } from './AiModel';
import { Todo } from './Todo';
import { Obsidian } from './Obsidian'

export const tools = {
  'final-answer': FinalAnswer,
  'web': Web,
  'ai-model': AiModel,
  'todo': Todo,
  'obsidian': Obsidian,
};

export type ToolName = keyof typeof tools;
