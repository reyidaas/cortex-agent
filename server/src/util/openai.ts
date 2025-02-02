import type { ZodSchema, infer as ZodInfer } from 'zod';
import type { OpenAI } from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';

import { openai } from '@/clients/openai';

interface GetCompletionArgs {
  message?: string;
  model?: OpenAI.ChatModel;
  system?: string;
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
}: GetStructuredCompletionArgs<T>): Promise<ZodInfer<T> | null> => {
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
}: GetCompletionArgs): Promise<unknown> => {
  const response = await openai.chat.completions.create({
    model,
    messages: getMessages({ message, system }),
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response?.choices[0]?.message.content ?? 'null');
};
