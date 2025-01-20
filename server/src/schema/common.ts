import { z, type ZodType } from 'zod';

export const generateResultWithReasoningSchema = <T extends ZodType>(resultType: T) =>
  z.object({
    _thinking: z.string(),
    result: resultType,
  });
