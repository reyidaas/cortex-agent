import { Action } from '@/models/Action';
import { Document } from '@/models/Document';
import { hasPropertyOfType } from '@/util/types';
// import { getSerpResults } from '@/util/serp';
import { log } from '@/util/log';
// import { cache } from '@/util/cache';
import { getClusteredPageContents } from '@/util/scraping';

interface Payload {
  queries: string[];
}

export class WebSearch extends Action<Payload> {
  constructor() {
    super({
      name: 'search',
    });
  }

  override async execute(payload: Payload): Promise<Document<'text'>> {
    const query = payload.queries[0]!;
    const requestId = Date.now();

    //     const result = await log(
    //       await cache(() => getSerpResults(query), { type: 'serp-results', name: query }),
    //       {
    //         type: 'serp-results',
    //         name: 'SERP RESULTS',
    //         requestId,
    //       },
    //     );

    await log(
      // await getClusteredPageContents(result.map(({ link }) => link)),
      await getClusteredPageContents(['https://www.alexcrompton.com/blog/how-to-learn-chess'], {
        type: 'text',
      }),
      { type: 'parsed-pages', name: query, requestId },
    );

    return new Document('text', { text: payload.queries.join(', ') });
  }

  override validatePayload(payload: unknown): payload is Payload {
    if (!hasPropertyOfType('queries', 'object')(payload)) return false;
    if (!Array.isArray(payload.queries)) return false;
    if (!payload.queries.every((item) => typeof item === 'string')) return false;
    return true;
  }
}
