import type { ResultRequestHandler } from '@/types/common';

export const chatController: ResultRequestHandler<string> = (_, res) => {
  res.json({ data: 'hi', result: 'success' });
};
