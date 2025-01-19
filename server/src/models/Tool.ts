import type { ToolName } from '@/tools';

interface ToolArgs {
  name: ToolName;
  description: string;
  instruction: string;
}

export abstract class Tool {
  name: ToolName;
  description: string;
  instruction: string;

  constructor({ name, description, instruction }: ToolArgs) {
    this.name = name;
    this.description = description;
    this.instruction = instruction;
  }

  abstract execute(): void;
}
