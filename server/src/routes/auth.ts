import { Router } from 'express';

import { validateReqBody } from '@/middleware/validation';
import { registerReqBodySchema } from '@/schema/auth';
import { registerHandler } from '@/controllers/auth';

export const router = Router();

router.post('/register', validateReqBody(registerReqBodySchema), registerHandler);
