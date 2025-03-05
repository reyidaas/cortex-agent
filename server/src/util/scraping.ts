import path from 'path';
import { writeFile } from 'fs/promises';
import { z } from 'zod';
import { Cluster } from 'puppeteer-cluster';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import type { Page } from 'puppeteer';

import { puppeteer } from '@/clients/puppeteer';
import { extractRelevantPageInfoPrompt } from '@/prompts/scraping';
import { getStructuredCompletion } from '@/util/openai';
import { log, cache } from '@/util/resources';
import { extractNameFromUrl } from '@/util/http';
import { generateResultWithReasoningSchema } from '@/schema/common';
import type { State } from '@/models/State';

// const tryParseScreenshots = async (page: Page): Promise<string | null> => {
//   const screenshot = await page.screenshot({ encoding: 'base64', fullPage: true });
//   await writeFile(path.join(process.cwd(), 'puppeteer-screenshot-test.png'), Buffer.from(screenshot, 'base64'));
//
//   console.log(`Parsed with screenshots: ${await page.title()}`);
//   return ':)';
// };

interface LogOptions {
  log?: { state: State };
}

interface ParseResultBase {
  url: string;
}

type ParseType = 'text' | 'image';

interface ParseResultText extends ParseResultBase {
  markdown: string | null;
}

interface ParseResultImage extends ParseResultBase {
  base64Screenshots: string[];
}

type ParseResult<T extends ParseType> = T extends 'text' ? ParseResultText : ParseResultImage;

interface GetClusteredPageContentsOptions<T extends ParseType> extends LogOptions {
  type?: T;
}

const parsePageContentToImage = async (page: Page): Promise<string[]> => {
  const url = page.url();

  console.log(`Parsing images ${url}`);
  const height = 1080;
  let currentScroll = 0;

  await page.setViewport({ width: 1920, height, deviceScaleFactor: 1 });
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);

  const base64Screenshots: string[] = [];

  do {
    base64Screenshots.push(await page.screenshot({ encoding: 'base64' }));
    console.log(`Parsed ${base64Screenshots.length}`);
    const offset = currentScroll + height - 100;

    await page.evaluate((scrollValue) => {
      window.scrollTo(0, scrollValue);
    }, offset);
    await new Promise((resolve) => setTimeout(() => resolve(undefined), 500));

    currentScroll = offset;
  } while (currentScroll < scrollHeight);

  console.log(`Parsed ${base64Screenshots.length} images ${url}`);
  return base64Screenshots;
};

const parsePageContentToMarkdown = async (page: Page): Promise<string | null> => {
  const url = page.url();

  console.log(`Parsing ${url}`);
  const dom = new JSDOM(await page.content(), { url });

  const reader = new Readability(dom.window.document);
  const article = reader.parse();
  if (!article || article.textContent.length < 200) return null;

  console.log(`Parsed ${url}`);

  const markdown = NodeHtmlMarkdown.translate(article.content);
  return markdown;
};

export const getClusteredPageContents = async <T extends ParseType>(
  urls: string[],
  { type, log: logArg }: GetClusteredPageContentsOptions<T> = {},
): Promise<ParseResult<T>[]> => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 5,
    skipDuplicateUrls: true,
    puppeteer,
  });

  const results: ParseResult<T>[] = [];

  await cluster.task(async ({ data, page }) => {
    await page.goto(data, { waitUntil: 'networkidle2' });
    const url = page.url();

    const name = extractNameFromUrl(url);

    switch (type) {
      case 'image':
        const base64Screenshots = await parsePageContentToImage(page);
        // TODO: delte this later
        const _testFilePath = path.join(
          process.cwd(),
          type === 'text' ? 'md' : 'screenshots',
          `${name}`,
        );
        await Promise.all(
          base64Screenshots.map(async (screenshot, index) => {
            await writeFile(`${_testFilePath}_${index}.png`, Buffer.from(screenshot, 'base64'));
          }),
        );
        //

        if (logArg) {
          await log({
            value: base64Screenshots,
            json: true,
            path: 'parsed-pages',
            fileName: `${name}.json`,
            ...logArg,
          });
        }

        results.push({
          url,
          base64Screenshots,
        } as ParseResult<T>);
        break;
      case 'text':
      default: {
        const markdown = await cache(() => parsePageContentToMarkdown(page), {
          fileName: `${name}.md`,
          path: 'parsed-pages-content',
        });

        if (logArg) {
          await log({
            value: markdown,
            path: 'parsed-pages',
            fileName: `${name}.json`,
            ...logArg,
          });
        }

        results.push({ url, markdown } as ParseResult<T>);
        break;
      }
    }
  });

  for (const url of urls) {
    await cluster.queue(url);
  }

  await cluster.idle();
  await cluster.close();

  return results;
};

export const extractRelevantPageInfo = async (
  content: string,
  url: string,
  message: string,
  { log: logArg }: LogOptions = {},
): Promise<string> => {
  const schema = generateResultWithReasoningSchema(z.string().or(z.null()));
  const name = extractNameFromUrl(url);

  const response = await getStructuredCompletion({
    message,
    schema,
    name: 'extract-relevant-page-info',
    system: extractRelevantPageInfoPrompt(content),
    log: logArg && { name: `extract-relevant-page-info-${name}`, ...logArg },
  });

  const summary = response?.result ?? '';

  if (logArg) {
    await log({
      value: summary,
      path: 'extracted-page-info',
      fileName: `extracted-page-info-${name}.md`,
      ...logArg,
    });
  }

  return summary;
};
