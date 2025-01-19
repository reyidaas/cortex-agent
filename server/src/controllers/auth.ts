import type { infer as ZodInfer } from 'zod';

import { register } from '@/services/auth';
import type { ResultRequestHandler } from '@/types/common';
import type { registerReqBodySchema } from '@/schema/auth';

export const registerController: ResultRequestHandler<
  string,
  ZodInfer<typeof registerReqBodySchema>
> = async (req, res, next) => {
  try {
    const apiKey = await register(req.body.name);
    res.json({ result: 'success', data: apiKey });
  } catch (error) {
    next(error);
  }
};
