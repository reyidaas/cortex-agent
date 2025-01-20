import { infer as ZodInfer } from 'zod';

import { runAgent } from '@/services/agent';
import type { messageSchema } from '@/schema/chat';
import type { ResultRequestHandler } from '@/types/common';

export const chatController: ResultRequestHandler<string, ZodInfer<typeof messageSchema>> = async (
  req,
  res,
  next,
) => {
  try {
    const finalAnswer = await runAgent(req.userId, req.body.message);
    res.json({ data: finalAnswer, result: 'success' });
  } catch (error) {
    next(error);
  }
};
