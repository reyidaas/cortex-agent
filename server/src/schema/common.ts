import { z, type ZodType } from 'zod';

export const generateResultWithReasoningSchema = <T extends ZodType>(resultType: T) =>
  z.object({
    result: resultType,
    _thinking: z.string(),
  });
