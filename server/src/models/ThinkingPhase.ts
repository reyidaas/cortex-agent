import { z } from 'zod';
import { Signale } from 'signale';

import { extractEnvironmentPrompt } from '@/prompts/environment';
import { extractPersonalityPrompt } from '@/prompts/personality';
import { generateToolsQueriesPrompt } from '@/prompts/tools';
import { generateMemoryCategoriesQueriesPrompt } from '@/prompts/memories';
import { getStructuredCompletion } from '@/util/openai';
import { generateResultWithReasoningSchema } from '@/schema/common';
import { GetterSetter } from '@/models/GetterSetter';
import { State } from '@/models/State';

export interface ToolQuery {
  query: string;
  tool: string;
}

export interface MemoryQuery {
  query: string;
  category: string;
}

interface ThinkingState {
  environment: string | null;
  personality: string | null;
  tools: ToolQuery[] | null;
  memories: MemoryQuery[] | null;
  logger: Signale;
}

export class ThinkingPhase extends GetterSetter<ThinkingState> {
  constructor() {
    super({
      environment: null,
      personality: null,
      tools: null,
      memories: null,
      logger: new Signale({ scope: 'thinking' }),
    });
  }

  parseToPromptText(fields: (keyof ThinkingState)[]): string {
    let parsedText = '';

    fields.forEach((field) => {
      if (parsedText) parsedText += '\n\n';

      parsedText += (() => {
        switch (field) {
          case 'environment':
            return this.parseEnvironmentToPromptText();
          case 'personality':
            return this.parsePersonalityToPromptText();
          case 'tools':
            return this.parseToolsToPromptText();
          case 'memories':
            return this.parseMemoryCategoriesToPromptText();
          default:
            return '';
        }
      })();
    });

    return parsedText;
  }

  private parseEnvironmentToPromptText(): string {
    const environment = this.get('environment') ?? '';

    return `\
<environment>
${environment}
</environment>`;
  }

  private parsePersonalityToPromptText(): string {
    const personality = this.get('personality') ?? '';

    return `\
<personality>
${personality}
</personality>`;
  }

  private parseToolsToPromptText(): string {
    const tools = (this.get('tools') ?? [])
      .map(
        ({ tool, query }) => `\
<tool name="${tool}">
${query}
</tool>`,
      )
      .join('\n');

    return `\
<initial_thoughts_about_needed_tools>
${tools}
</initial_thoughts_about_needed_tools>`;
  }

  private parseMemoryCategoriesToPromptText(): string {
    const memoryCategories = (this.get('memories') ?? [])
      .map(
        ({ category, query }) => `\
<memory_category name="${category}">
${query}
</memory_category>`,
      )
      .join('\n');

    return `\
<initial_thoughts_about_needed_memory_categories>
${memoryCategories}
</initial_thoughts_about_needed_memory_categories>`;
  }

  async extractEnvironment(message: string, state: State): Promise<string | null> {
    this.get('logger').note('Extracting environment...');

    const environment = state.get('config').get('environment')?.content;
    if (!environment) {
      this.set('environment', null);
      return null;
    }

    const schema = generateResultWithReasoningSchema(z.string().or(z.null()));
    const response = await getStructuredCompletion({
      schema,
      name: 'extract-environment',
      system: extractEnvironmentPrompt(environment),
      message,
      log: { state },
    });

    let env = `Current date: ${new Date().toDateString()}\nCurrent time: ${new Date().toLocaleTimeString()}`;

    if (response?.result) env += `\n${response.result}`;

    return env;
  }

  async extractPersonality(message: string, state: State): Promise<string | null> {
    this.get('logger').note('Extracting personality...');

    const personality = state.get('config').get('personality')?.content;
    if (!personality) {
      this.set('personality', null);
      return null;
    }

    const schema = generateResultWithReasoningSchema(z.string().or(z.null()));
    const response = await getStructuredCompletion({
      schema,
      name: 'extract-personality',
      system: extractPersonalityPrompt(personality),
      message,
      log: { state },
    });

    return response && response.result;
  }

  async generateToolsQueries(message: string, state: State): Promise<ToolQuery[] | null> {
    this.get('logger').note('Generating initial tool queries...');

    const tools = state.get('config').get('tools');
    const schema = generateResultWithReasoningSchema(
      z
        .array(
          z.object({
            query: z.string(),
            tool: z.string(),
          }),
        )
        .or(z.null()),
    );
    const response = await getStructuredCompletion({
      schema,
      name: 'generate-tools-queries',
      system: generateToolsQueriesPrompt(tools, state),
      message,
      log: { state },
    });

    return response && response.result;
  }

  async generateMemoryCategoriesQueries(
    message: string,
    state: State,
  ): Promise<MemoryQuery[] | null> {
    this.get('logger').note('Generating initial memory categories queries...');

    const memoryCategories = state.get('config').get('memoryCategories');
    const schema = generateResultWithReasoningSchema(
      z
        .array(
          z.object({
            query: z.string(),
            category: z.string(),
          }),
        )
        .or(z.null()),
    );

    const response = await getStructuredCompletion({
      schema,
      name: 'generate-memory-categories-queries',
      system: generateMemoryCategoriesQueriesPrompt(memoryCategories, state),
      message,
      log: { state },
    });

    return response && response.result;
  }
}
