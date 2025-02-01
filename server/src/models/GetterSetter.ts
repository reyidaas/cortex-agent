export abstract class GetterSetter<T extends object> {
  private state: T;

  constructor(initialState: T) {
    this.state = initialState;
  }

  get<U extends keyof T>(key: U): T[U] {
    return this.state[key];
  }

  set<U extends keyof T>(key: U, value: T[U] | ((prev: T[U]) => T[U])): void {
    this.state[key] = value instanceof Function ? value(this.state[key]) : value;
  }
}
