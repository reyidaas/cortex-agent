import type { customsearch_v1 } from 'googleapis';

import { serp } from '@/clients/serp';

interface GetSerpResultsOptions {
  num?: number;
}

type SerpResult = Pick<customsearch_v1.Schema$Result, 'title' | 'link' | 'snippet'>;

export const getSerpResults = async (
  query: string,
  { num = 5 }: GetSerpResultsOptions = {},
): Promise<SerpResult[]> => {
  const serpResult = await serp.cse.list({
    auth: process.env.GOOGLE_API_KEY,
    cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
    q: query,
    num,
    siteSearch: 'youtube.com',
    siteSearchFilter: 'e',
  });

  return (
    serpResult.data.items
      ?.filter((result): result is customsearch_v1.Schema$Result & { link: string } => !!result.link)
      .map(({ title, link, snippet }) => ({ title, link, snippet })) ?? []
  );
};
