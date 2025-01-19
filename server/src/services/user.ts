import type { User } from '@prisma/client';

import { prisma } from '@/clients/prisma';

export const createUser = async (name: string, hashedApiKey: string): Promise<User> =>
  prisma.user.create({ data: { name, apiKey: hashedApiKey } });

export const createOrUpdateEnvironment = async (userId: string, content: string): Promise<void> => {
  const environment = await prisma.environment.findUnique({ where: { userId } });

  if (environment) {
    await prisma.environment.update({ where: { id: environment.id }, data: { content } });
  } else {
    await prisma.environment.create({ data: { userId, content } });
  }
};

export const createOrUpdatePersonality = async (userId: string, content: string): Promise<void> => {
  const personality = await prisma.personality.findUnique({ where: { userId } });

  if (personality) {
    await prisma.personality.update({ where: { id: personality.id }, data: { content } });
  } else {
    await prisma.personality.create({ data: { userId, content } });
  }
};
