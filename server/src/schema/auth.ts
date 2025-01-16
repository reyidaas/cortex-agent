import { z } from 'zod';

export const registerReqBodySchema = z.object({
  name: z.string().nonempty(),
});
