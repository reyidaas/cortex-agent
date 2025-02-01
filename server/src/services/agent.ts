import { Agent } from '@/models/Agent';

export const runAgent = async (userId: string, message: string): Promise<string> => {
  const agent = await Agent.new(userId, message);

  await agent.think();
  await agent.plan();

  return '';
};
