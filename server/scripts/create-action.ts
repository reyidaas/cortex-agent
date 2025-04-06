import path from 'path';
import { mkdir, writeFile, readFile, access } from 'fs/promises';

const EXPORT_ACTIONS_TEXT = 'export const actions = {' as const;

(async () => {
  const [, scriptPath, toolName, actionName, refName] = process.argv;
  if (!scriptPath || !toolName || !actionName || !refName)
    throw new Error('Insufficient arguments');

  const toolPath = path.join(
    scriptPath.slice(0, scriptPath.lastIndexOf('/')),
    '..',
    'src',
    'tools',
    toolName,
  );
  await access(toolPath);

  const toolActionsPath = path.join(toolPath, 'actions');
  if (!(await accessible(toolActionsPath))) await mkdir(toolActionsPath);

  await writeFile(
    path.join(toolActionsPath, `${actionName}.ts`),
    getActionContent(toolName, actionName, refName),
  );

  const actionsIndexPath = path.join(toolActionsPath, 'index.ts');
  if (!(await accessible(actionsIndexPath))) {
    await writeFile(actionsIndexPath, getActionsIndexContent(toolName, actionName, refName));
  } else {
    const actionsIndexContent = await readFile(actionsIndexPath, 'utf-8');

    const actionsStartIndex =
      actionsIndexContent.indexOf(EXPORT_ACTIONS_TEXT) + EXPORT_ACTIONS_TEXT.length;
    if (actionsStartIndex - EXPORT_ACTIONS_TEXT.length === -1)
      throw new Error('Actions start index could not be found');

    const actionsEndIndex =
      actionsIndexContent.slice(actionsStartIndex).indexOf('}') + actionsStartIndex + 1;
    if (actionsEndIndex - actionsStartIndex === 0)
      throw new Error('Actions end index could not be found');

    const className = `${toolName}${actionName}`;

    let actions = actionsIndexContent.slice(actionsStartIndex, actionsEndIndex);
    actions = `${actions.slice(0, actions.length - 1)}  '${refName}': ${className},\n}`;

    const splitActionsIndexContent = actionsIndexContent.split('');
    splitActionsIndexContent.splice(actionsStartIndex, actionsEndIndex, actions);

    const lines = splitActionsIndexContent.join('').split(/\r?\n/);
    const importLineIndex = lines.findIndex((line) => !line.startsWith('import'));
    lines.splice(importLineIndex, 0, `import { ${className} } from './${actionName}'`);

    await writeFile(actionsIndexPath, lines.join('\n'));
  }
})().catch((err) => console.log(err));

async function accessible(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function getActionContent(toolName: string, actionName: string, refName: string): string {
  return `\
import { Action } from '@/models/Action';
import { Document } from '@/models/Document';
import type { State } from '@/models/State';

interface Payload {}

export class ${toolName}${actionName} extends Action<Payload> {
  constructor() {
    super({ name: '${refName}' });
  }

  override validatePayload(payload: unknown): payload is Payload {
    return true;
  }

  override async execute(
    payload: Payload,
    _message: string,
    _state: State,
  ): Promise<Document<'text'>> {
    return new Document('text', { text: '' });
  }
}`;
}

function getActionsIndexContent(toolName: string, actionName: string, refName: string): string {
  const className = `${toolName}${actionName}`;

  return `\
import { ${className} } from './${actionName}'

export const actions = {
  '${refName}': ${className},
};`;
}
