import type { AddTaskArgs, Task } from '@doist/todoist-api-typescript';

import { todoist } from '@/clients/todoist';

export const getTasks = async (): Promise<Task[]> => {
  const response = await todoist.getTasks();
  return response.results;
};

export const createTask = async (args: AddTaskArgs): Promise<Task> => {
  const task = await todoist.addTask(args);
  return task;
};
