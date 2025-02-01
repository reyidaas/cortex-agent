import { GetterSetter } from '@/models/GetterSetter';
import type { Task } from '@/models/Task';
import type { Memory } from '@/prompts/memories';

interface PlanningState {
  tasks: Task[];
  memories: Memory[];
}

export class PlanningPhase extends GetterSetter<PlanningState> {
  constructor() {
    super({ tasks: [], memories: [] });
  }
}
