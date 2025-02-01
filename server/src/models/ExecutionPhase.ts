import { GetterSetter } from '@/models/GetterSetter';
import type { Task } from '@/models/Task';
import type { TaskStep } from '@/models/TaskStep';

interface ExecutionState {
  current: {
    task: Task;
    step: TaskStep;
  } | null;
}

export class ExecutionPhase extends GetterSetter<ExecutionState> {
  constructor() {
    super({ current: null });
  }
}
