import type { ErrorRequestHandler } from 'express';

import type { StatusError } from '@/models/StatusError';
import type { ResultResponse } from '@/types/common';
import { hasPropertyOfType } from '@/util/types';

export const errorRequestHandler: ErrorRequestHandler<
  unknown,
  ResultResponse<Pick<StatusError, 'message' | 'status'>>
> = (error: unknown, _, res, __) => {
  console.error('ERROR: ', error);

  const message = hasPropertyOfType('message', 'string')(error)
    ? error.message
    : 'Internal server error';
  const status = hasPropertyOfType('status', 'number')(error) ? error.status : 500;

  res.json({ result: 'failure', data: { message, status } });
};
