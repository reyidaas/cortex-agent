import { randomUUID } from 'crypto';

import { prisma } from '@/clients/prisma';
import { hash } from '@/util/crypto';
import { createPublicApiKey } from '@/util/auth';

export const register = async (name: string): Promise<string> => {
  const apiKey = randomUUID();
  const hashedApiKey = await hash(apiKey);
  const user = await prisma.user.create({ data: { name, apiKey: hashedApiKey } });

  return createPublicApiKey(apiKey, user.id);
};
