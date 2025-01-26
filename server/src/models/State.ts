export interface ToolQuery {
  query: string;
  tool: string;
}

export interface MemoryQuery {
  query: string;
  category: string;
}

interface StateProperties {
  thinking: {
    environment: string | null;
    personality: string | null;
    tools: ToolQuery[] | null;
    memories: MemoryQuery[] | null;
  };
  planning: {};
  execution: {};
}

export class State {
  private state: StateProperties = {
    thinking: {
      environment: null,
      personality: null,
      tools: null,
      memories: null,
    },
    planning: {},
    execution: {},
  };

  updateThinkingPhase<T extends keyof StateProperties['thinking']>(
    key: T,
    value: StateProperties['thinking'][T],
  ): void {
    this.state.thinking[key] = value;
  }

  updatePlanningPhase<T extends keyof StateProperties['planning']>(
    key: T,
    value: StateProperties['planning'][T],
  ): void {
    this.state.planning[key] = value;
  }

  updateExecutionPhase<T extends keyof StateProperties['execution']>(
    key: T,
    value: StateProperties['execution'][T],
  ): void {
    this.state.execution[key] = value;
  }

  getFromThinkingPhase<T extends keyof StateProperties['thinking']>(
    key: T,
  ): StateProperties['thinking'][T] {
    return this.state.thinking[key];
  }

  getFromPlanningPhase<T extends keyof StateProperties['planning']>(
    key: T,
  ): StateProperties['planning'][T] {
    return this.state.planning[key];
  }

  getFromExecutionPhase<T extends keyof StateProperties['execution']>(
    key: T,
  ): StateProperties['execution'][T] {

    return this.state.execution[key];
  }
}
