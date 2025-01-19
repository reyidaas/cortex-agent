import { runAgent } from '@/services/agent';
import type { ResultRequestHandler } from '@/types/common';

export const chatController: ResultRequestHandler<string> = async (_, res) => {
  const finalAnswer = await runAgent();
  res.json({ data: finalAnswer, result: 'success' });
};
