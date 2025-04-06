import { writeFile, lstat, mkdir } from 'fs/promises';
import path from 'path';

import { accessible } from '@/util/fs';
import { StatusError } from '@/models/StatusError';

console.log('OBSIDIAN', process.env.OBSIDIAN_VAULT_PATH);

export const createNote = async (title: string, content: string): Promise<void> => {
  if (!title) {
    throw new StatusError('Title must be specified');
  }

  if (!(await accessible(process.env.OBSIDIAN_VAULT_PATH))) {
    throw new StatusError('Obsidian vault could not be accessed');
  }

  const obsidianVaultLstat = await lstat(process.env.OBSIDIAN_VAULT_PATH);
  if (!obsidianVaultLstat.isDirectory()) {
    throw new StatusError('Obsidian vault is not a directory');
  }

  const cortexNotesPath = path.join(process.env.OBSIDIAN_VAULT_PATH, 'Cortex');
  if (await accessible(cortexNotesPath)) {
    const cortexNotesLstat = await lstat(cortexNotesPath);
    if (!cortexNotesLstat.isDirectory()) {
      throw new StatusError('Obsidian Cortex path is not a directory');
    }
  } else {
    await mkdir(cortexNotesPath);
  }

  const notePath = path.join(cortexNotesPath, `${title}.md`);
  await writeFile(notePath, content);
};
