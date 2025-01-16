import { z, ZodSchema, ZodError } from 'zod';
import type { RequestHandler } from 'express';

import { StatusError } from '@/models/StatusError';

export const validateReqBody =
  <T extends ZodSchema>(schema: T): RequestHandler<unknown, unknown, z.infer<T>> =>
  async (req, _, next): Promise<void> => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      // TODO: improve error message
      next(new StatusError((error as ZodError).message, 400));
    }
  };
