import type { ZodSchema, infer as ZodInfer } from 'zod';
import type { OpenAI } from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';

import { openai } from '@/clients/openai';
import { log } from '@/util/resources';
import type { State } from '@/models/State';

interface GetCompletionArgs {
  message?: string;
  model?: OpenAI.ChatModel;
  system?: string;
  log?: { state: State } | { requestId: number };
}

interface GetStructuredCompletionArgs<T extends ZodSchema> extends GetCompletionArgs {
  schema: T;
  name: string;
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
    await log({ value: system, path: 'prompts', fileName: `${name}.txt`, ...logArg });
  }

  const response = await openai.beta.chat.completions.parse({
    model,
    messages: getMessages({ message, system }),
    response_format: zodResponseFormat(schema, name),
  });

  return response.choices[0]?.message.parsed ?? null;
};

export const getJsonCompletion = async ({
  system,
  message,
  model = 'gpt-4o-mini',
  log: logArg,
}: GetCompletionArgs): Promise<unknown> => {
  if (logArg) {
    await log({ value: system, path: 'prompts', fileName: `${name}.txt`, ...logArg });
  }

  const response = await openai.chat.completions.create({
    model,
    messages: getMessages({ message, system }),
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response?.choices[0]?.message.content ?? 'null');
};
