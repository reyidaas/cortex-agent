import { Action } from '@/models/Action';

interface Payload {
  queries: string[];
}

export class WebSearch extends Action<Payload> {
  constructor() {
    super({
      name: 'search',
    });
  }

  override async execute(payload: Payload): Promise<string[]> {
    console.log('EXECTUTING WEB SEARCH', payload);
    return payload.queries;
  }

  override validatePayload(payload: unknown): payload is Payload {
    if (typeof payload !== 'object' || payload === null) return false;
    if (!('queries' in payload) || !Array.isArray(payload.queries)) return false;
    if (!payload.queries.every((item) => typeof item === 'string')) return false;
    return true;
  }
}
