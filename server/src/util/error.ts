import type { ErrorRequestHandler } from 'express';
import signale from 'signale';

import type { StatusError } from '@/models/StatusError';
import type { ResultResponse } from '@/types/common';
import { hasPropertyOfType } from '@/util/types';

export const errorRequestHandler: ErrorRequestHandler<
  unknown,
  ResultResponse<Pick<StatusError, 'message' | 'status'>>
> = (error: unknown, _, res, __) => {
  signale.error('ERROR: ', error);

  const message = hasPropertyOfType('message', 'string')(error)
    ? error.message
    : 'Internal server error';
  const status = hasPropertyOfType('status', 'number')(error) ? error.status : 500;

  res.status(status).json({ result: 'failure', data: { message, status } });
};
