import { Tool } from '@/models/Tool';
import { actions } from './actions';

export class Web extends Tool<typeof actions> {
  constructor() {
    super({
      name: 'web',
    });
  }

  override validateActionName(actionName: unknown): actionName is keyof typeof actions {
    return typeof actionName === 'string' && Object.keys(actions).includes(actionName);
  }

  override getAction<T extends keyof typeof actions>(actionName: T): (typeof actions)[T] {
    return actions[actionName];
  }
}
