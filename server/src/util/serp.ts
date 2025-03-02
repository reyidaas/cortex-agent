import type { customsearch_v1 } from 'googleapis';

import { serp } from '@/clients/serp';
import { log } from '@/util/resources';
import type { State } from '@/models/State';

interface LogOptions {
  log?: { state: State };
}

interface GetSerpResultsOptions extends LogOptions {
  num?: number;
}

type SerpResult = Pick<customsearch_v1.Schema$Result, 'title' | 'snippet'> & { link: string };

const EXCLUDED_DOMAINS = ['youtube.com', 'reddit.com'] as const;

export const getSerpResults = async (
  query: string,
  { num = 3, log: logArg }: GetSerpResultsOptions = {},
): Promise<SerpResult[]> => {
  const enhancedQuery = `${query} ${EXCLUDED_DOMAINS.map((domain) => `-site:${domain}`).join(' ')}`;

  const serpResult = await serp.cse.list({
    auth: process.env.GOOGLE_API_KEY,
    cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
    q: enhancedQuery,
    num,
  });

  const results =
    serpResult.data.items
      ?.filter((result): result is SerpResult => !!result.link)
      .map(({ title, link, snippet }) => ({ title, link, snippet })) ?? [];

  if (logArg) {
    await log({
      value: results,
      path: 'serp-results',
      fileName: `${query}.json`,
      json: true,
      ...logArg,
    });
  }

  return results;
};
