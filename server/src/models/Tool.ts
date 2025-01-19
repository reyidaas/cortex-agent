import type { ToolName } from '@/tools';

export abstract class Tool {
  name: ToolName;

  constructor(name: ToolName) {
    this.name = name;
  }

  abstract execute(): void;
}
