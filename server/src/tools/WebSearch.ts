import { Tool } from '@/models/Tool';

export class WebSearch extends Tool {
  constructor() {
    super({
      name: 'webSearch',
      instruction: '',
      description: '',
    });
  }

  override execute(): void {}
}
