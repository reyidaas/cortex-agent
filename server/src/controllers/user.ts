import { infer as ZodInfer } from 'zod';

import { ResultRequestHandler } from '@/types/common';
import { updateContentSchema } from '@/schema/user';
import { createOrUpdateEnvironment } from '@/services/environment';
import { createOrUpdatePersonality } from '@/services/personality';

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
    const { content } = await updateContentSchema.parseAsync(req.body);
    await createOrUpdatePersonality(req.userId, content);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};
