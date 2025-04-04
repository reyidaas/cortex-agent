import { TodoCreateTask } from './CreateTask';
import { GetTasks } from './GetTasks';

export const actions = {
  ['create-task']: TodoCreateTask,
  ['get-tasks']: GetTasks,
};
