import type { customsearch_v1 } from 'googleapis';

import { serp } from '@/clients/serp';

interface GetSerpResultsOptions {
  num?: number;
}

type SerpResult = Pick<customsearch_v1.Schema$Result, 'title' | 'snippet'> & { link: string };

const EXCLUDED_DOMAINS = ['youtube.com', 'reddit.com'] as const;

export const getSerpResults = async (
  query: string,
  { num = 3 }: GetSerpResultsOptions = {},
): Promise<SerpResult[]> => {
  const enhancedQuery = `${query} ${EXCLUDED_DOMAINS.map((domain) => `-site:${domain}`).join(' ')}`;

  const serpResult = await serp.cse.list({
    auth: process.env.GOOGLE_API_KEY,
    cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
    q: enhancedQuery,
    num,
  });

  return (
    serpResult.data.items
      ?.filter((result): result is SerpResult => !!result.link)
      .map(({ title, link, snippet }) => ({ title, link, snippet })) ?? []
  );
};
