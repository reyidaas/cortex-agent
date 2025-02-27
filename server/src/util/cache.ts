import path from 'path';
import { existsSync } from 'fs';
import { mkdir, writeFile, readFile } from 'fs/promises';

import {
  getResourceExtension,
  serializeResourceValue,
  deserializeResourceValue,
} from '@/util/resources';
import type { ResourceType } from '@/types/common';

interface CacheOptions<T extends ResourceType, U> {
  name: string;
  type: T;
  value: U;
}

type GetFromCacheOptions<T extends ResourceType, U> = Pick<CacheOptions<T, U>, 'name' | 'type'>;

const saveCache = async <T extends ResourceType, U>({ name, type, value }: CacheOptions<T, U>) => {
  const cacheDir = path.join(process.cwd(), 'cache');
  if (!existsSync(cacheDir)) {
    await mkdir(cacheDir);
  }

  const resourceCacheDir = path.join(cacheDir, type);
  if (!existsSync(resourceCacheDir)) {
    await mkdir(resourceCacheDir);
  }

  const extension = getResourceExtension(type);

  const cacheFilePath = path.join(resourceCacheDir, `${name}${extension}`);
  await writeFile(cacheFilePath, serializeResourceValue(type, value));
  console.log('Cache saved: ', cacheFilePath);
};

const getFromCache = async <T extends ResourceType, U>({
  name,
  type,
}: GetFromCacheOptions<T, U>): Promise<U | null> => {
  const extension = getResourceExtension(type);
  const cacheFilePath = path.join(process.cwd(), 'cache', type, `${name}${extension}`);
  if (existsSync(cacheFilePath)) {
    console.log('Rading from cache: ', cacheFilePath);
    const cacheValue = await readFile(cacheFilePath);
    return deserializeResourceValue(type, cacheValue);
  }

  return null;
};

export const cache = async <T extends ResourceType, U>(
  cb: () => Promise<U>,
  options: GetFromCacheOptions<T, U>,
): Promise<U> => {
  if (process.env.NODE_ENV === 'development') {
    const cachedValue = await getFromCache(options);
    if (cachedValue) return cachedValue;

    const value = await cb();
    await saveCache({ ...options, value });

    return value;
  }

  return cb();
};
