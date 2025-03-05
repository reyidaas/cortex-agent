import path from 'path';
import { mkdir, writeFile, readFile } from 'fs/promises';
import { existsSync } from 'fs';

import type { State } from '@/models/State';

interface CreateResourceBaseArgs {
  value: unknown;
  fileName: string;
  resourceBasePath?: string;
  path?: string;
  json?: boolean;
}

interface CreateResourceArgsWithState extends CreateResourceBaseArgs {
  state?: State;
}

interface CreateResourceArgsWithRequestId extends CreateResourceBaseArgs {
  requestId?: number;
}

type CreateResourceArgs = CreateResourceArgsWithRequestId | CreateResourceArgsWithState;

type GetResourceArgs = Omit<CreateResourceArgs, 'value' | 'json'>;

interface GetResourceData {
  dir: string;
  filePath: string;
}

type CacheArgs = Omit<CreateResourceArgs, 'requestId' | 'state' | 'value' | 'resourceBasePath'>;

type LogArgs =
  | Omit<CreateResourceArgsWithRequestId, 'resourceBasePath'>
  | Omit<CreateResourceArgsWithState, 'resourceBasePath'>;

const getResourcePath = ({
  path: pathArg,
  fileName,
  resourceBasePath,
  ...rest
}: GetResourceArgs): GetResourceData => {
  const pathChunks = (() => {
    if (!pathArg) return [];
    return (pathArg.startsWith('/') ? pathArg.slice(1) : pathArg).split('/');
  })();

  const requestId = (() => {
    if ('requestId' in rest && rest.requestId) return (rest.requestId as number).toString();
    if ('state' in rest && rest.state)
      return (rest.state as State).get('config').get('requestId').toString();
    return '';
  })();

  const dirPath = path.join(process.cwd(), resourceBasePath ?? '', requestId, ...pathChunks);

  return { dir: dirPath, filePath: path.join(dirPath, fileName) };
};

const createResource = async ({ value, json, ...rest }: CreateResourceArgs): Promise<void> => {
  if (!value) return;

  const { dir, filePath } = getResourcePath(rest);

  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  const content = json ? JSON.stringify(value) : value.toString();
  await writeFile(filePath, content);
};

const getResource = async (args: GetResourceArgs): Promise<string | null> => {
  const { filePath } = getResourcePath(args);
  if (!existsSync(filePath)) return null;

  const content = await readFile(filePath);
  return content.toString();
};

export const log = async ({ path: pathArg, ...rest }: LogArgs): Promise<void> => {
  console.log('Saving log to ', pathArg);
  const resource = await createResource({ path: pathArg, resourceBasePath: 'logs', ...rest });
  console.log('Log saved to ', pathArg);

  return resource;
};

export const cache = async <T>(
  cb: () => Promise<T>,
  { path: pathArg, json, fileName }: CacheArgs,
): Promise<T> => {
  console.log('Reading cache from ', pathArg);

  const cachedValue = await getResource({ path: pathArg, resourceBasePath: 'cache', fileName });
  if (cachedValue) {
    console.log('Value found in cache ', pathArg);
    return json ? JSON.parse(cachedValue) : cachedValue;
  }

  console.log('Value not found in cache ', pathArg);

  const value = await cb();

  const shouldCache = (() => {
    const trimmed = fileName.trim();
    if (!trimmed.length) return false;
    if (!trimmed.includes('.')) return true;
    if (!trimmed.slice(0, trimmed.lastIndexOf('.')).length) return false;
    return true;
  })();

  if (shouldCache) {
    await createResource({ path: pathArg, resourceBasePath: 'cache', value, fileName, json });
  }

  console.log('Value saved to cache ', pathArg);

  return value;
};
