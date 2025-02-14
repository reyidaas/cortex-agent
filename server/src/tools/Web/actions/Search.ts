import { Action } from '@/models/Action';
import { Document } from '@/models/Document';
import { hasPropertyOfType } from '@/util/types';

interface Payload {
  queries: string[];
}

export class WebSearch extends Action<Payload> {
  constructor() {
    super({
      name: 'search',
    });
  }

  override async execute(payload: Payload): Promise<Document<'text'>> {
    return new Document('text', { text: payload.queries.join(', ') });
  }

  override validatePayload(payload: unknown): payload is Payload {
    if (!hasPropertyOfType('queries', 'object')(payload)) return false
    if (!Array.isArray(payload.queries)) return false;
    if (!payload.queries.every((item) => typeof item === 'string')) return false;
    return true;
  }
}
