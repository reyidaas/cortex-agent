import type { RequestHandler } from 'express';

export interface ResultResponse<T> {
  result: 'success' | 'failure';
  data: T;
}

export type ResultRequestHandler<T, U = never, V = never, W = never> = RequestHandler<
  V,
  ResultResponse<T>,
  U,
  W
>;

export type ResourceType = 'prompts' | 'serp-results';

export type ResourceValue<T extends ResourceType> = T extends 'prompts' ? string : unknown;
