import { Action } from '@/models/Action';
import { Document } from '@/models/Document';
import { hasPropertyOfType } from '@/util/types';
import type { State } from '@/models/State';

interface Payload {
  answer: string;
}

export class FinalAnswerText extends Action<Payload> {
  constructor() {
    super({ name: 'text' });
  }

  override validatePayload(payload: unknown): payload is Payload {
    return hasPropertyOfType('answer', 'string')(payload);
  }

  override async execute(
    payload: Payload,
    _message: string,
    _state: State,
  ): Promise<Document<'text'>> {
    return new Document('text', { text: payload.answer });
  }
}
