import { Signale } from 'signale';

import type { Document } from '@/models/Document';
import type { State } from '@/models/State';

interface ActionArgs {
  name: string;
}

export abstract class Action<T> {
  name: string;
  logger: Signale;

  constructor({ name }: ActionArgs) {
    this.name = name;
    this.logger = new Signale({ scope: name });
  }

  abstract execute(payload: T, message: string, state: State): Promise<Document<any>>;

  abstract validatePayload(payload: unknown): payload is T;
}
