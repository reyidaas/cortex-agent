import { Router } from 'express';

import { environmentController, personalityController } from '@/controllers/user';

export const router = Router();

router.put('/environment', environmentController);

router.put('/personality', personalityController);
