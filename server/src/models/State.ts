import { GetterSetter } from '@/models/GetterSetter';
import { ThinkingPhase } from '@/models/ThinkingPhase';
import { PlanningPhase } from '@/models/PlanningPhase';
import { ExecutionPhase } from '@/models/ExecutionPhase';

interface StateProperties {
  thinking: ThinkingPhase;
  planning: PlanningPhase;
  execution: ExecutionPhase;
}

export class State extends GetterSetter<StateProperties> {
  constructor() {
    super({
      thinking: new ThinkingPhase(),
      planning: new PlanningPhase(),
      execution: new ExecutionPhase(),
    });
  }
}
