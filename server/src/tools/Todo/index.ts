import { Tool } from '@/models/Tool';

import { actions } from './actions';

export class Todo extends Tool<typeof actions> {
  constructor() {
    super({ name: 'todo', actions });
  }
}
