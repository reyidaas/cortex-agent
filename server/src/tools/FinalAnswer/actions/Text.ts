import { Action } from '@/models/Action';

interface Payload {
  answer: string;
}

export class FinalAnswerText extends Action<Payload> {
  constructor() {
    super({ name: 'text' });
  }

  override validatePayload(payload: unknown): payload is Payload {
    if (typeof payload !== 'object' || payload === null) return false;
    if (!('ansewr' in payload) || typeof payload.ansewr !== 'string') return false;
    return true;
  }

  override async execute(payload: Payload): Promise<string> {
    console.log('EXECUTING FINAL ANSWER TEXT', payload);
    return payload.answer;
  }
}
