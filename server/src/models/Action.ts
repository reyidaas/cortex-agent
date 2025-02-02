interface ActionArgs {
  name: string;
}

export abstract class Action<T> {
  name: string;

  constructor({ name }: ActionArgs) {
    this.name = name;
  }

  abstract execute(payload: T): Promise<unknown>;

  abstract validatePayload(payload: unknown): payload is T;
}
