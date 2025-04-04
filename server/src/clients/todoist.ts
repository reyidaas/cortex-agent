import { TodoistApi } from '@doist/todoist-api-typescript';
import { config } from 'dotenv';

config();

export const todoist = global.todoist ?? new TodoistApi(process.env.TODOIST_API);

if (process.env.NODE_ENV === 'development') {
  global.todoist = todoist;
}
