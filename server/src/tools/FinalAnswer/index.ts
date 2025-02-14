import { Tool } from '@/models/Tool';
import { actions } from './actions';

export class FinalAnswer extends Tool<typeof actions> {
  constructor() {
    super({
      name: 'final-answer',
      actions,
    });
  }
}
