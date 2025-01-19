import { Router } from 'express';

import { chatController } from '@/controllers/chat';
import { authMiddleware } from '@/middleware/auth';

export const router = Router();

router.post('/', chatController);
