import { Tool } from '@/models/Tool';
import { actions } from './actions';

export class AiModel extends Tool<typeof actions> {
  constructor() {
    super({ name: 'ai-model', actions });
  }
}
