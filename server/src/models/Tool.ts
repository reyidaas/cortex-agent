import { tools, type ToolName } from '@/tools';

interface ToolArgs<T extends object> {
  name: ToolName;
  actions: T;
}

export abstract class Tool<T extends object> {
  name: ToolName;
  actions: T;

  constructor({ name, actions }: ToolArgs<T>) {
    this.name = name;
    this.actions = actions;
  }

  validateActionName(actionName: unknown): actionName is keyof T {
    return typeof actionName === 'string' && actionName in this.actions;
  }

  getAction<U extends keyof T>(actionName: U): T[U] {
    return this.actions[actionName];
  }

  static isValidToolName(toolName: string): toolName is ToolName {
    return Object.keys(tools).includes(toolName);
  }
}
