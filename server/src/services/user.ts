import type { User, Prisma } from '@prisma/client';

import { prisma } from '@/clients/prisma';
import { StatusError } from '@/models/StatusError';

type GetUserResponse<T extends Prisma.UserDefaultArgs | undefined> = T extends undefined
  ? User
  : Prisma.UserGetPayload<T>;

export const createUser = async (name: string, hashedApiKey: string): Promise<User> =>
  prisma.user.create({ data: { name, apiKey: hashedApiKey } });

export const getUser = async <T extends Prisma.UserDefaultArgs | undefined>(
  userId: string,
  payload?: T,
): Promise<GetUserResponse<T> | null> => {
  const user = await prisma.user.findUnique({ ...payload, where: { id: userId } });

  return user as GetUserResponse<T> | null;
};

export const getUserOrThrow = async <T extends Prisma.UserDefaultArgs | undefined>(
  userId: string,
  payload?: T,
): Promise<GetUserResponse<T>> => {
  const user = await prisma.user.findUnique({ ...payload, where: { id: userId } });
  if (!user) throw new StatusError('User not found', 404);

  return user as GetUserResponse<T>;
};
