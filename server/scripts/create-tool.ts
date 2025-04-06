import path from 'path';
import { mkdir, writeFile, readFile } from 'fs/promises';

const EXPORT_TOOLS_TEXT = 'export const tools = {' as const;
const EXPORT_ACTIONS_TEXT = 'export const actions = {};' as const;

(async () => {
  const [, , toolName, refName] = process.argv;
  if (!toolName || !refName) throw new Error('Insufficient arguments');

  const toolsPath = path.join(
    __dirname,
    '..',
    'src',
    'tools',
  );
  const toolPath = path.join(toolsPath, toolName);
  await mkdir(toolPath, { recursive: true });

  const actionsPath = path.join(toolPath, 'actions');
  await mkdir(actionsPath);
  await writeFile(path.join(actionsPath, 'index.ts'), EXPORT_ACTIONS_TEXT);

  await writeFile(path.join(toolPath, 'index.ts'), getToolIndexContent(toolName, refName));

  const toolsIndexPath = path.join(toolsPath, 'index.ts');
  const toolsIndexContent = await readFile(toolsIndexPath, 'utf-8');

  const toolsStartIndex = toolsIndexContent.indexOf(EXPORT_TOOLS_TEXT) + EXPORT_TOOLS_TEXT.length;
  if (toolsStartIndex - EXPORT_TOOLS_TEXT.length === -1)
    throw new Error('Tools start index could not be found');
  const toolsEndIndex = toolsIndexContent.slice(toolsStartIndex).indexOf('}') + toolsStartIndex + 1;
  if (toolsEndIndex - toolsStartIndex === 0) throw new Error('Tools end index could not be found');

  let tools = toolsIndexContent.slice(toolsStartIndex, toolsEndIndex);
  tools = `${tools.slice(0, tools.length - 1)}  '${refName}': ${toolName},\n}`;

  const splitToolsIndexContent = toolsIndexContent.split('');
  splitToolsIndexContent.splice(toolsStartIndex, toolsEndIndex - toolsStartIndex, tools);

  const lines = splitToolsIndexContent.join('').split(/\r?\n/);
  const importLineIndex = lines.findIndex((line) => !line.startsWith('import'));
  lines.splice(importLineIndex, 0, `import { ${toolName} } from './${toolName}'`);

  await writeFile(toolsIndexPath, lines.join('\n'));
})().catch((err) => console.log(err));

function getToolIndexContent(toolName: string, refName: string): string {
  return `\
import { Tool } from '@/models/Tool';
import { actions } from './actions';

export class ${toolName} extends Tool<typeof actions> {
  constructor() {
    super({
      name: '${refName}',
      actions,
    });
  }
}`;
}
