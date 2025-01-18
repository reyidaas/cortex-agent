import type { Request } from 'express';

interface DestructuredApiKey {
  userId: string;
  apiKey: string;
}

export const getBearerFromAuthorization = (req: Request): string | null => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) return null;

  const chunks = authorization.split(' ');
  if (chunks.length !== 2) return null;

  return chunks[1] as string;
};

export const createPublicApiKey = (apiKey: string, userId: string): `${string}:${string}` =>
  `${userId}:${apiKey}`;

export const destructurePublicApiKey = (publicApiKey: string): DestructuredApiKey | null => {
  const idx = publicApiKey.indexOf(':');
  if (idx === -1) return null;

  const chunks = publicApiKey.split(':');
  if (chunks.length !== 2) return null;

  const [userId, apiKey] = chunks as [string, string];

  return { userId, apiKey };
};
