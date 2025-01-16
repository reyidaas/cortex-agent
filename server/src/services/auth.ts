import { randomUUID } from 'crypto';

import { prisma } from '@/clients/prisma';
import { hash } from '@/util/crypto';

export const register = async (name: string): Promise<string> => {
  const apiKey = randomUUID();
  const hashedApiKey = await hash(apiKey);
  await prisma.user.create({ data: { name, apiKey: hashedApiKey } });
  return apiKey;
};
