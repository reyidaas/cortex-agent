import { State } from '@/models/State';
import { Config } from '@/models/Config';
import { TaskStep } from '@/models/TaskStep';
import { StatusError } from '@/models/StatusError';

export class Agent {
  state: State;
  message: string;
  userId: string;

  private constructor(userId: string, message: string, config: Config) {
    this.state = new State(config);
    this.message = message;
    this.userId = userId;
  }

  async think(): Promise<void> {
    const [environment, personality] = await Promise.all([
      this.state.get('thinking').extractEnvironment(this.message, this.state),
      this.state.get('thinking').extractPersonality(this.message, this.state),
    ]);

    this.state.get('thinking').set('environment', environment);
    this.state.get('thinking').set('personality', personality);

    const [tools, memoriesCategories] = await Promise.all([
      this.state.get('thinking').generateToolsQueries(this.message, this.state),
      this.state.get('thinking').generateMemoryCategoriesQueries(this.message, this.state),
    ]);

    this.state.get('thinking').set('tools', tools);
    this.state.get('thinking').set('memories', memoriesCategories);
  }

  async plan(): Promise<void> {
    const generatedTasks = await this.state
      .get('planning')
      .generateTasks(this.message, this.state);
    this.state.get('planning').set('tasks', generatedTasks);
  }

  async execute(): Promise<void> {
    const nextTask = this.state
      .get('planning')
      .get('tasks')
      .find(({ status }) => status === 'pending');
    if (!nextTask) {
      throw new StatusError('No next task was found');
    }

    this.state.get('execution').set('task', nextTask);

    const generatedSteps = await this.state
      .get('execution')
      .generateCurrentTaskSteps(this.message, this.state);
    const steps = generatedSteps.map((step) => new TaskStep(step));
    nextTask.update({ steps });

    for (const step of nextTask.steps) {
      this.state.get('execution').set('step', step);

      const payload = await this.state
        .get('execution')
        .generateToolPayload(this.message, this.state);
      this.state.get('execution').set('payload', payload);

      const result = await this.state.get('execution').useTool(this.message, this.state);
      step.update({ status: 'completed' });
      step.update({ result });

      if (step.tool === 'final-answer') {
        nextTask.update({ finished: true });
        break;
      }
    }

    nextTask.update({ status: 'completed' });
  }

  static async new(userId: string, message: string): Promise<Agent> {
    const config = await Config.new(userId);
    return new Agent(userId, message, config);
  }
}
