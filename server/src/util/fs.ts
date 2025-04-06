import { access } from 'fs/promises';

export const accessible = async (path: string): Promise<boolean> => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};
