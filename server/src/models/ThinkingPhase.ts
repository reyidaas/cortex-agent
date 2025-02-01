import { GetterSetter } from '@/models/GetterSetter';

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
}

export class ThinkingPhase extends GetterSetter<ThinkingState> {
  constructor() {
    super({
      environment: null,
      personality: null,
      tools: null,
      memories: null,
    });
  }

  parseToPromptText(fields: (keyof ThinkingState)[]): string {
    let parsedText = '';

    fields.forEach(field => {
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
    })

    return parsedText;
  }

  private parseEnvironmentToPromptText(): string {
    const environment = this.get('environment') ?? '';

    return `\
<environment>
${environment}
</environment>\
`;
  }

  private parsePersonalityToPromptText(): string {
    const personality = this.get('personality') ?? '';

    return `\
<personality>
${personality}
</personality>\
`;
  }

  private parseToolsToPromptText(): string {
    const tools = (this.get('tools') ?? [])
      .map(
        ({ tool, query }) => `\
<tool name="${tool}">
${query}
</tool>\
`,
      )
      .join('\n');

    return `\
<initial_thoughts_about_needed_tools>
${tools}
</initial_thoughts_about_needed_tools>\
`;
  }

  private parseMemoryCategoriesToPromptText(): string {
    const memoryCategories = (this.get('memories') ?? [])
      .map(
        ({ category, query }) => `\
<memory_category name="${category}">
${query}
</memory_category>\
`,
      )
      .join('\n');

    return `\
<initial_thoughts_about_needed_memory_categories>
${memoryCategories}
</initial_thoughts_about_needed_memory_categories>\
`;
  }
}
