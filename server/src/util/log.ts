import path from 'path';
import { existsSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';
import type { State } from '@/models/State';
import type { ResourceType, ResourceValue } from '@/types/common';

interface LogBaseOptions<T extends ResourceType> {
  name: string;
  type: T;
  value: ResourceValue<T>;
}

type LogStateOptions<T extends ResourceType> = LogBaseOptions<T> & {
  state: State;
};

type SaveLogOptions<T extends ResourceType> = LogBaseOptions<T> & {
  requestId: number;
};

type LogOptions<T extends ResourceType> = LogStateOptions<T> | SaveLogOptions<T>;

const saveLog = async <T extends ResourceType>({
  value,
  name,
  type,
  ...rest
}: LogOptions<T>): Promise<void> => {
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

  const extension = (() => {
    switch (type) {
      case 'prompts':
        return '.txt';
      case 'serp-results':
        return '.json';
      default:
        return '';
    }
  })();

  const logPath = path.join(sessionLogsDir, `${type}${extension}`);
  let currentLog: unknown;

  if (existsSync(logPath)) {
    const log = await readFile(logPath);
    currentLog = (() => {
      switch (type) {
        case 'prompts':
          return log.toString();
        case 'serp-results':
          return JSON.parse(log.toString());
        default:
          return '';
      }
    })();
  }

  switch (type) {
    case 'serp-results':
      if (currentLog) currentLog += '\n\n----------\n\n';
      currentLog += `--- ${name} ---\n${value}`;
      break;
    case 'prompts':
      if (currentLog) (currentLog as Record<string, unknown>)[name] = value;
      else currentLog = { [name]: value };
      break;
    default:
      break;
  }

  await writeFile(
    logPath,
    typeof currentLog === 'string' ? currentLog : JSON.stringify(currentLog),
  );
  console.log('Log saved: ', logPath);
};

export const log = async <T extends ResourceType>(
  options: LogOptions<T>,
): Promise<LogOptions<T>['value']> => {
  if (process.env.NODE_ENV === 'development') {
    await saveLog(options);
  }

  return options.value;
};
