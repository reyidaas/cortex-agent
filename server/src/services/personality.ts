import { prisma } from '@/clients/prisma';

export const createOrUpdatePersonality = async (userId: string, content: string): Promise<void> => {
  const personality = await prisma.personality.findUnique({ where: { userId } });

  if (personality) {
    await prisma.personality.update({ where: { id: personality.id }, data: { content } });
  } else {
    await prisma.personality.create({ data: { userId, content } });
  }
};
