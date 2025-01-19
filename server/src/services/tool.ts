import type { Prisma } from '@prisma/client';

import { prisma } from '@/clients/prisma';

const TOOL_OMIT: Prisma.ToolOmit = {
  createdAt: true,
  updatedAt: true,
} as const;

type Tool = Prisma.ToolGetPayload<{ omit: typeof TOOL_OMIT }>;

export const getTools = async (): Promise<Tool[]> => {
  const tools = await prisma.tool.findMany({ omit: TOOL_OMIT });

  return tools;
};
