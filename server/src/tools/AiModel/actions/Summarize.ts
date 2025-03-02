import { Action } from '@/models/Action';
import { Document } from '@/models/Document';
import { hasPropertyOfType } from '@/util/types';
import type { State } from '@/models/State';

interface Payload {
  text: string;
}

export class AiModelSummarize extends Action<Payload> {
  constructor() {
    super({ name: 'summarize' });
  }

  override validatePayload(payload: unknown): payload is Payload {
    return hasPropertyOfType('text', 'string')(payload);
  }

  override async execute(
    payload: Payload,
    _message: string,
    _state: State,
  ): Promise<Document<'text'>> {
    return new Document('text', { text: `Summarized text: ${payload.text}` });
  }
}
