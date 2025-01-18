import type { RequestHandler } from 'express';
import { compare } from 'bcryptjs';

import { getBearerFromAuthorization } from '@/util/auth';
import { destructurePublicApiKey } from '@/util/auth';
import { prisma } from '@/clients/prisma';
import { StatusError } from '@/models/StatusError';

export const authMiddleware: RequestHandler = async (req, _, next) => {
  try {
    const publicApiKey = getBearerFromAuthorization(req);
    if (!publicApiKey) throw new StatusError('Unauthorized', 401);

    const destructuredApiKey = destructurePublicApiKey(publicApiKey);
    console.log('this', destructuredApiKey);
    if (!destructuredApiKey) throw new StatusError('Unauthorized', 401);

    const { userId, apiKey } = destructuredApiKey;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new StatusError('Unauthorized', 401);

    const isValidApiKey = await compare(apiKey, user.apiKey);
    if (!isValidApiKey) throw new StatusError('Unauthorized', 401);

    req.userId = user.id;

    next();
  } catch (error) {
    next(new StatusError('Unauthorized', 401));
  }
};
