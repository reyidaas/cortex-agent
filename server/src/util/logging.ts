import path from 'path';
import { existsSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';
import type { State } from '@/models/State';

const logPrompt = async (requestId: number, promptName: string, prompt: string): Promise<void> => {
  const logsDir = path.join(process.cwd(), 'logs');
  if (!existsSync(logsDir)) {
    await mkdir(logsDir);
  }

  const promptsLogsDir = path.join(logsDir, 'prompts');
  if (!existsSync(promptsLogsDir)) {
    await mkdir(promptsLogsDir);
  }

  const logPath = path.join(promptsLogsDir, `${requestId}.txt`);
  let currentLog = '';

  if (existsSync(logPath)) {
    const log = await readFile(logPath);
    currentLog = log.toString();
  }

  if (currentLog) {
    currentLog += '\n\n----------\n\n';
  }

  currentLog += `${promptName}\n${prompt}`;

  await writeFile(logPath, currentLog);
};

export const withPromptLog = async (
  state: State,
  promptName: string,
  prompt: string,
): Promise<string> => {
  console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV === 'development') {
    await logPrompt(state.get('config').get('requestId'), promptName, prompt);
  }

  return prompt;
};
