import { infer as ZodInfer } from 'zod';

import { ResultRequestHandler } from '@/types/common';
import { updateContentSchema } from '@/schema/user';
import { createOrUpdateEnvironment, createOrUpdatePersonality } from '@/services/user';

export const environmentController: ResultRequestHandler<
  never,
  ZodInfer<typeof updateContentSchema>
> = async (req, res, next) => {
  try {
    const { content } = await updateContentSchema.parseAsync(req.body);
    await createOrUpdateEnvironment(req.userId, content);
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
    const { content } = await updateContentSchema.parseAsync(req.body);
    await createOrUpdatePersonality(req.userId, content);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};
