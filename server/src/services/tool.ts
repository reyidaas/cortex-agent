import type { Prisma, Tool } from '@prisma/client';

import { prisma } from '@/clients/prisma';

export const getTools = async <T extends Prisma.ToolDefaultArgs | undefined>(
  payload?: T,
): Promise<T extends undefined ? Tool : Prisma.ToolGetPayload<T>> => {
  const tools = await prisma.tool.findMany(payload);

  return tools as T extends undefined ? Tool : Prisma.ToolGetPayload<T>;
};
