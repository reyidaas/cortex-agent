import { Router } from 'express';

import { environmentController, personalityController } from '@/controllers/user';
import { validateReqBody } from '@/middleware/validation';
import { updateContentSchema } from '@/schema/user';

export const router = Router();

router.put('/environment', validateReqBody(updateContentSchema), environmentController);

router.put('/personality', validateReqBody(updateContentSchema), personalityController);
