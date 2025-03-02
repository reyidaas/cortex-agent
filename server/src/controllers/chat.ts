import { infer as ZodInfer } from 'zod';

import { runAgent } from '@/services/agent';
// import { tools } from '@/tools';
import type { messageSchema } from '@/schema/chat';
import type { ResultRequestHandler } from '@/types/common';

export const chatController: ResultRequestHandler<string, ZodInfer<typeof messageSchema>> = async (
  req,
  res,
  next,
) => {
  try {
    const finalAnswer = await runAgent(req.userId, req.body.message);
    //     const web = new tools['web'];
    //     const search = new (web.getAction('search'));
    //     const result = await search.execute({
    //       queries: [
    //         'strategies to learn chess',
    //         'best chess openings for beginners',
    //         'how to learn chess effectively',
    //       ],
    //     });
    res.json({ data: finalAnswer, result: 'success' });
  } catch (error) {
    next(error);
  }
};
