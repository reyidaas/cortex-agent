import { FinalAnswer } from './FinalAnswer';
import { WebSearch } from './WebSearch';

export const tools = {
  finalAnswer: FinalAnswer,
  webSearch: WebSearch,
};

export type ToolName = keyof typeof tools;
