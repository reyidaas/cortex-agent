import { Router } from 'express';

import { chatController } from '@/controllers/chat';
import { validateReqBody } from '@/middleware/validation';
import { messageSchema } from '@/schema/chat';

export const router = Router();

router.post('/', validateReqBody(messageSchema), chatController);
