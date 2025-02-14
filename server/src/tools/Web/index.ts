import { Tool } from '@/models/Tool';
import { actions } from './actions';

export class Web extends Tool<typeof actions> {
  constructor() {
    super({
      name: 'web',
      actions,
    });
  }
}
