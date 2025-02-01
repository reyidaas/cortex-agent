import type { Environment, Personality } from '@prisma/client';

import { getUserOrThrow } from '@/services/user';
import { getTools } from '@/services/tools';
import { getMemoryCategories } from '@/services/memories';
import { GetterSetter } from '@/models/GetterSetter';
import type { Tool } from '@/prompts/tools';
import type { MemoryCategory } from '@/prompts/memories';

interface ConfigState {
  environment: Environment | null;
  personality: Personality | null;
  tools: Tool[];
  memoryCategories: MemoryCategory[];
}

export class Config extends GetterSetter<ConfigState> {
  private constructor(
    environment: Environment | null,
    personality: Personality | null,
    tools: Tool[],
    memoryCategories: MemoryCategory[],
  ) {
    super({ environment, personality, tools, memoryCategories });
  }

  static async new(userId: string): Promise<Config> {
    const [{ environment, personality }, tools, memoryCategories] = await Promise.all([
      getUserOrThrow(userId, {
        include: { environment: true, personality: true },
      }),
      getTools({ select: { name: true, description: true } }),
      getMemoryCategories({
        select: { name: true, description: true },
      }),
    ]);

    return new Config(environment, personality, tools, memoryCategories);
  }
}
