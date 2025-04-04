import type { AddTaskArgs, Task, GetTasksArgs } from '@doist/todoist-api-typescript';

import { todoist } from '@/clients/todoist';

export const getTasks = async (args?: GetTasksArgs): Promise<Task[]> => {
  const response = await todoist.getTasks(args);
  return response.results;
};

export const createTask = async (args: AddTaskArgs): Promise<Task> => {
  const task = await todoist.addTask(args);
  return task;
};
