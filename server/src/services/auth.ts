import { randomUUID } from 'crypto';

import { hash } from '@/util/crypto';
import { createPublicApiKey } from '@/util/auth';
import { createUser } from '@/services/user';

export const register = async (name: string): Promise<string> => {
  const apiKey = randomUUID();
  const hashedApiKey = await hash(apiKey);
  const user = await createUser(name, hashedApiKey);

  return createPublicApiKey(apiKey, user.id);
};
