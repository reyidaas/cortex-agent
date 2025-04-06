import { Tool } from '@/models/Tool';
import { actions } from './actions';

export class Obsidian extends Tool<typeof actions> {
  constructor() {
    super({
      name: 'obsidian',
      actions,
    });
  }
}