import { z } from 'zod';

export const updateContentSchema = z.object({
  content: z.string().nonempty(),
});
