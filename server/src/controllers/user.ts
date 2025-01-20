import { infer as ZodInfer } from 'zod';

import { ResultRequestHandler } from '@/types/common';
import { createOrUpdateEnvironment } from '@/services/environment';
import { createOrUpdatePersonality } from '@/services/personality';
import type { updateContentSchema } from '@/schema/user';

export const environmentController: ResultRequestHandler<
  never,
  ZodInfer<typeof updateContentSchema>
> = async (req, res, next) => {
  try {
    await createOrUpdateEnvironment(req.userId, req.body.content);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

export const personalityController: ResultRequestHandler<
  never,
  ZodInfer<typeof updateContentSchema>
> = async (req, res, next) => {
  try {
    await createOrUpdatePersonality(req.userId, req.body.content);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};
