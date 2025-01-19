interface StateProperties {
  environment: string | null;
  personality: string | null;
}

type Setter<T extends keyof StateProperties> = (
  currentValue: StateProperties[T],
) => StateProperties[T];

export class State {
  private state: StateProperties = {
    environment: null,
    personality: null,
  };

  get<T extends keyof StateProperties>(key: T): StateProperties[T] {
    return this.state[key];
  }

  set<T extends keyof StateProperties>(key: T, value: StateProperties[T] | Setter<T>): void {
    this.state[key] = typeof value === 'function' ? value(this.state[key]) : value;
  }
}
