import { prisma } from '@/clients/prisma';

export const createOrUpdateEnvironment = async (userId: string, content: string): Promise<void> => {
  const environment = await prisma.environment.findUnique({ where: { userId } });

  if (environment) {
    await prisma.environment.update({ where: { id: environment.id }, data: { content } });
  } else {
    await prisma.environment.create({ data: { userId, content } });
  }
};
