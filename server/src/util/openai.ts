import type { ZodSchema, infer as ZodInfer } from 'zod';
import type { OpenAI } from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';

import { openai } from '@/clients/openai';

interface GetStructuredCompletionArgs<T extends ZodSchema> {
  schema: T;
  name: string;
  message?: string;
  model?: OpenAI.ChatModel;
  system?: string;
}

export const getStructuredCompletion = async <T extends ZodSchema>({
  schema,
  name,
  system,
  message,
  model = 'gpt-4o-mini',
}: GetStructuredCompletionArgs<T>): Promise<ZodInfer<T> | null> => {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

  if (system) {
    messages.push({ role: 'system', content: system });
  }

  if (message) {
    messages.push({ role: 'user', content: message });
  }

  const response = await openai.beta.chat.completions.parse({
    model,
    messages: [],
    response_format: zodResponseFormat(schema, name),
  });

  return response.choices[0]?.message.parsed ?? null;
};
