import { Action } from '@/models/Action';
import { Document } from '@/models/Document';
import { hasPropertyOfType } from '@/util/types';
import { getSerpResults } from '@/util/serp';
import { cache } from '@/util/resources';
import { getClusteredPageContents, extractRelevantPageInfo } from '@/util/scraping';
import type { State } from '@/models/State';

interface Payload {
  queries: string[];
}

export class WebSearch extends Action<Payload> {
  constructor() {
    super({
      name: 'search',
    });
  }

  override async execute(
    payload: Payload,
    message: string,
    state: State,
  ): Promise<Document<'text'>> {
    // TODO: enable more queries
    // const query = payload.queries[0]!;

    const serpResults = (
      await Promise.all(
        payload.queries.map((query) =>
          cache(() => getSerpResults(query, { log: { state } }), {
            path: 'serp-results',
            fileName: `${query}.json`,
            json: true,
          }),
        ),
      )
    ).flatMap((results) => results);

    const parseResults = await getClusteredPageContents(
      serpResults.map(({ link }) => link),
      {
        type: 'text',
        log: { state },
        cliLogger: this.logger,
      },
    );

    const summaries = await Promise.all(
      parseResults
        .filter(({ markdown }) => markdown)
        .map(async ({ url, markdown }) => ({
          url,
          summary: await extractRelevantPageInfo(markdown!, url, message, { log: { state } }),
        })),
    );

    return new Document('text', {
      text: summaries
        .filter(({ summary }) => summary)
        .map(({ url, summary }) => `Source: ${url}\n${summary}`)
        .join('\n\n'),
    });
  }

  override validatePayload(payload: unknown): payload is Payload {
    if (!hasPropertyOfType('queries', 'object')(payload)) return false;
    if (!Array.isArray(payload.queries)) return false;
    if (!payload.queries.every((item) => typeof item === 'string')) return false;
    return true;
  }
}
