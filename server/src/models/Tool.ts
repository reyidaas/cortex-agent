import { tools } from '@/tools';

interface ToolArgs {
  name: keyof typeof tools;
}

export abstract class Tool<T extends object> {
  name: keyof typeof tools;

  constructor({ name }: ToolArgs) {
    this.name = name;
  }

  abstract validateActionName(actionName: unknown): actionName is keyof T;

  abstract getAction<U extends keyof T>(actionName: U): T[U];

  static isValidToolName(toolName: string): toolName is keyof typeof tools {
    return Object.keys(tools).includes(toolName);
  }
}
