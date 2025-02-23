import path from 'path';
import { existsSync } from 'fs';
import { mkdir, writeFile, readFile } from 'fs/promises';
import type { ResourceType } from '@/types/common';

type CacheResourceType = Extract<ResourceType, 'serp-results'>;

type CacheResourceValue<T extends CacheResourceType> = T extends 'serp-results' ? unknown : never;

interface CacheOptions<T extends CacheResourceType> {
  name: string;
  type: T;
  value: CacheResourceValue<T>;
}

type GetFromCacheOptions<T extends CacheResourceType> = Pick<CacheOptions<T>, 'name' | 'type'>;

const saveCache = async <T extends CacheResourceType>({ name, type, value }: CacheOptions<T>) => {
  const cacheDir = path.join(process.cwd(), 'cache');
  if (!existsSync(cacheDir)) {
    await mkdir(cacheDir);
  }

  const resourceCacheDir = path.join(cacheDir, type);
  if (!existsSync(resourceCacheDir)) {
    await mkdir(resourceCacheDir);
  }

  const cacheFilePath = path.join(resourceCacheDir, `${name}.json`);
  await writeFile(cacheFilePath, JSON.stringify(value));
  console.log('Cache saved: ', cacheFilePath);
};

const getFromCache = async <T extends CacheResourceType>({
  name,
  type,
}: GetFromCacheOptions<T>): Promise<CacheResourceValue<T> | null> => {
  const cacheFilePath = path.join(process.cwd(), 'cache', type, `${name}.json`);
  if (existsSync(cacheFilePath)) {
    console.log('Rading from cache: ', cacheFilePath);
    const cacheValue = await readFile(cacheFilePath);
    return JSON.parse(cacheValue.toString());
  }

  return null;
};

export const cache = async <T extends CacheResourceType>(
  cb: () => Promise<CacheResourceValue<T>>,
  options: GetFromCacheOptions<T>,
): Promise<CacheResourceValue<T>> => {
  if (process.env.NODE_ENV === 'development') {
    const cachedValue = await getFromCache(options);
    if (cachedValue) return cachedValue;

    const value = await cb();
    await saveCache({ ...options, value });

    return value;
  }

  return cb();
};
