import { Agent } from '@/models/Agent';
import { StatusError } from '@/models/StatusError';

const MAX_ITERATIONS = 5 as const;

export const runAgent = async (userId: string, message: string): Promise<string> => {
  const agent = await Agent.new(userId, message);

  await agent.think();
  await agent.plan();
  await agent.execute();

  let iterations = 1;
  while (!agent.state.get('execution').get('finished')) {
    if (iterations > MAX_ITERATIONS) {
      throw new StatusError('Maximum iterations exceeded');
    }

    await agent.execute();
    iterations++;
  }

  return agent.state.get('execution').get('task')?.result?.value.text ?? 'Error';
};
