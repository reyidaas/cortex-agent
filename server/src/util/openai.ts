import type { ZodSchema, infer as ZodInfer } from 'zod';
import type { OpenAI } from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';

import { openai } from '@/clients/openai';
import { log } from '@/util/resources';
import type { State } from '@/models/State';

interface GetCompletionArgs {
  name: string;
  message?: string;
  model?: OpenAI.ChatModel;
  system?: string;
  log?: { state: State; name?: string };
}

interface GetStructuredCompletionArgs<T extends ZodSchema> extends GetCompletionArgs {
  schema: T;
}

const getMessages = ({
  message,
  system,
}: Pick<
  GetCompletionArgs,
  'message' | 'system'
>): OpenAI.Chat.Completions.ChatCompletionMessageParam[] => {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

  if (system) {
    messages.push({ role: 'system', content: system });
  }

  if (message) {
    messages.push({ role: 'user', content: message });
  }

  return messages;
};

export const getStructuredCompletion = async <T extends ZodSchema>({
  schema,
  name,
  system,
  message,
  model = 'gpt-4o-mini',
  log: logArg,
}: GetStructuredCompletionArgs<T>): Promise<ZodInfer<T> | null> => {
  if (logArg) {
    const { name: logName, ...rest } = logArg;
    await log({
      value: system,
      path: 'prompts',
      fileName: `prompt-${logName ?? name}.txt`,
      ...rest,
    });
  }

  const response = await openai.beta.chat.completions.parse({
    model,
    messages: getMessages({ message, system }),
    response_format: zodResponseFormat(schema, name),
  });

  const result = response.choices[0]?.message.parsed ?? null;

  if (logArg) {
    const { name: logName, ...rest } = logArg;
    await log({
      value: result,
      path: 'prompts',
      fileName: `result-${logName ?? name}.json`,
      json: true,
      ...rest,
    });
  }

  return result;
};

export const getJsonCompletion = async ({
  name,
  system,
  message,
  model = 'gpt-4o-mini',
  log: logArg,
}: GetCompletionArgs): Promise<unknown> => {
  if (logArg) {
    const { name: logName, ...rest } = logArg;
    await log({
      value: system,
      path: 'prompts',
      fileName: `prompt-${logName ?? name}.txt`,
      ...rest,
    });
  }

  const response = await openai.chat.completions.create({
    model,
    messages: getMessages({ message, system }),
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response?.choices[0]?.message.content ?? 'null');

  if (logArg) {
    const { name: logName, ...rest } = logArg;
    await log({
      value: result,
      path: 'prompts',
      fileName: `result-${logName ?? name}.json`,
      json: true,
      ...rest,
    });
  }

  return result;
};
