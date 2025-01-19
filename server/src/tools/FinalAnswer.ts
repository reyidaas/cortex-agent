import { Tool } from '@/models/Tool';

export class FinalAnswer extends Tool {
  constructor() {
    super({
      name: 'finalAnswer',
      instruction: '',
      description: '',
    });
  }

  override execute(): void {}
}
