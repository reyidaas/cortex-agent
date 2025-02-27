import path from 'path';
import { existsSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';

import {
  getResourceExtension,
  serializeResourceValue,
  deserializeResourceValue,
} from '@/util/resources';
import type { State } from '@/models/State';
import type { ResourceType } from '@/types/common';

interface LogBaseOptions<T extends ResourceType> {
  name: string;
  type: T;
}

type LogStateOptions<T extends ResourceType> = LogBaseOptions<T> & {
  state: State;
};

type SaveLogOptions<T extends ResourceType> = LogBaseOptions<T> & {
  requestId: number;
};

type LogOptions<T extends ResourceType> = LogStateOptions<T> | SaveLogOptions<T>;

const saveLog = async <T extends ResourceType, U>(
  value: U,
  { name, type, ...rest }: LogOptions<T>,
): Promise<void> => {
  const logsDir = path.join(process.cwd(), 'logs');
  if (!existsSync(logsDir)) {
    await mkdir(logsDir);
  }

  const requestId =
    'requestId' in rest ? rest.requestId : rest.state.get('config').get('requestId');
  const sessionLogsDir = path.join(logsDir, requestId.toString());
  if (!existsSync(sessionLogsDir)) {
    await mkdir(sessionLogsDir);
  }

  const extension = getResourceExtension(type);

  const logPath = path.join(sessionLogsDir, `${type}${extension}`);
  let currentLog: unknown;

  if (existsSync(logPath)) {
    const log = await readFile(logPath);
    currentLog = deserializeResourceValue(type, log);
  }

  switch (type) {
    case 'prompts':
      if (currentLog) currentLog += '\n\n----------\n\n';
      currentLog += `--- ${name} ---\n${value}`;
      break;
    case 'serp-results':
    default:
      if (currentLog) (currentLog as Record<string, unknown>)[name] = value;
      else currentLog = { [name]: value };
      break;
  }

  await writeFile(logPath, serializeResourceValue(type, currentLog));
  console.log('Log saved: ', logPath);
};

export const log = async <T extends ResourceType, U>(
  value: U,
  options: LogOptions<T>,
): Promise<U> => {
  if (process.env.NODE_ENV === 'development') {
    await saveLog(value, options);
  }

  return value;
};
