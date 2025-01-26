import type { Prisma, Memory, MemoryCategory } from '@prisma/client';

import { prisma } from '@/clients/prisma';

export const getMemories = async <T extends Prisma.MemoryDefaultArgs | undefined>(
  payload?: T,
): Promise<T extends undefined ? Memory[] : Prisma.MemoryGetPayload<T>[]> => {
  const memories = await prisma.memory.findMany(payload);

  return memories as T extends undefined ? Memory[] : Prisma.MemoryGetPayload<T>[];
};

export const getMemoryCategories = async <T extends Prisma.MemoryCategoryDefaultArgs | undefined>(
  payload?: T,
): Promise<T extends undefined ? MemoryCategory[] : Prisma.MemoryCategoryGetPayload<T>[]> => {
  const memoryCategories = await prisma.memoryCategory.findMany(payload);

  return memoryCategories as T extends undefined
    ? MemoryCategory[]
    : Prisma.MemoryCategoryGetPayload<T>[];
};
