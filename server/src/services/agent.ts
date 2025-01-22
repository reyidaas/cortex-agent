import { z } from 'zod';

import { getUserOrThrow } from '@/services/user';
import { getTools } from '@/services/tools';
import { State, type ToolQuery } from '@/models/State';
import { extractEnvironmentPrompt } from '@/prompts/environment';
import { extractPersonalityPrompt } from '@/prompts/personality';
import { generateToolsQueriesPrompt, type Tool } from '@/prompts/tools';
import { getStructuredCompletion } from '@/util/openai';
import { generateResultWithReasoningSchema } from '@/schema/common';

const extractEnvironment = async (message: string, environment: string): Promise<string | null> => {
  const schema = generateResultWithReasoningSchema(z.string().or(z.null()));
  const response = await getStructuredCompletion({
    schema,
    name: 'extract-environment',
    system: extractEnvironmentPrompt(environment),
    message,
  });
  console.log('ENV', response);

  return response?.result ?? null;
};

const extractPersonality = async (message: string, personality: string): Promise<string | null> => {
  const schema = generateResultWithReasoningSchema(z.string().or(z.null()));
  const response = await getStructuredCompletion({
    schema,
    name: 'extract-personality',
    system: extractPersonalityPrompt(personality),
    message,
  });
  console.log('PERS', response);

  return response?.result ?? null;
};

const generateToolsQueries = async (
  message: string,
  tools: Tool[],
): Promise<ToolQuery[] | null> => {
  const schema = generateResultWithReasoningSchema(
    z
      .array(
        z.object({
          query: z.string(),
          tool: z.string(),
        }),
      )
      .or(z.null()),
  );
  const response = await getStructuredCompletion({
    schema,
    name: 'generate-tools-queries',
    system: generateToolsQueriesPrompt(tools),
    message,
  });
  console.log('TOOLS', response);

  return response?.result ?? null;
};

export const runAgent = async (userId: string, message: string): Promise<string> => {
  const user = await getUserOrThrow(userId, { include: { environment: true, personality: true } });
  // const tools = await getTools();
  const state = new State();

  state.set('environment', await extractEnvironment(message, user.environment?.content ?? ''));
  state.set('personality', await extractPersonality(message, user.personality?.content ?? ''));

  const tools = await getTools({ select: { name: true, description: true } });
  state.set(
    'tools',
    await generateToolsQueries(message, tools),
  );

  return '';
};
