import { GetterSetter } from '@/models/GetterSetter';
import { ThinkingPhase } from '@/models/ThinkingPhase';
import { PlanningPhase } from '@/models/PlanningPhase';
import { ExecutionPhase } from '@/models/ExecutionPhase';
import { Config } from '@/models/Config';

interface StateProperties {
  thinking: ThinkingPhase;
  planning: PlanningPhase;
  execution: ExecutionPhase;
  config: Config;
}

export class State extends GetterSetter<StateProperties> {
  constructor(config: Config) {
    super({
      config: config,
      thinking: new ThinkingPhase(),
      planning: new PlanningPhase(),
      execution: new ExecutionPhase(),
    });
  }
}
