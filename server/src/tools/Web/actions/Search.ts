import { Action } from '@/models/Action';
import { Document } from '@/models/Document';

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
    if (typeof payload !== 'object' || payload === null) return false;
    if (!('queries' in payload) || !Array.isArray(payload.queries)) return false;
    if (!payload.queries.every((item) => typeof item === 'string')) return false;
    return true;
  }
}
