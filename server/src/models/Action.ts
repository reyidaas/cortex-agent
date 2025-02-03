import type { Document } from '@/models/Document';

interface ActionArgs {
  name: string;
}

export abstract class Action<T> {
  name: string;

  constructor({ name }: ActionArgs) {
    this.name = name;
  }

  abstract execute(payload: T): Promise<Document<any>>;

  abstract validatePayload(payload: unknown): payload is T;
}
