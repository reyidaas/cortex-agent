import { Router } from 'express';

import { chatController } from '@/controllers/chat';

export const router = Router();

router.post('/chat', chatController);
