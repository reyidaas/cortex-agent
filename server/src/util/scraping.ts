import path from 'path';
import { writeFile } from 'fs/promises';
import { Cluster } from 'puppeteer-cluster';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import { Page } from 'puppeteer';

import { puppeteer } from '@/clients/puppeteer';

// const tryParseScreenshots = async (page: Page): Promise<string | null> => {
//   const screenshot = await page.screenshot({ encoding: 'base64', fullPage: true });
//   await writeFile(path.join(process.cwd(), 'puppeteer-screenshot-test.png'), Buffer.from(screenshot, 'base64'));
//
//   console.log(`Parsed with screenshots: ${await page.title()}`);
//   return ':)';
// };

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

interface GetClusteredPageContentsOptions<T extends ParseType> {
  type?: T;
}

const parsePageContentToImage = async (page: Page): Promise<string[]> => {
  const url = page.url();

  console.log(`Parsing images ${url}...`);
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

  console.log(`Parsing ${url}...`);
  const dom = new JSDOM(await page.content(), { url });

  const reader = new Readability(dom.window.document);
  const article = reader.parse();
  if (!article) return null;

  console.log(`Parsed ${article.siteName} - ${article.title}`);

  const markdown = NodeHtmlMarkdown.translate(article.content);
  return markdown;
};

export const getClusteredPageContents = async <T extends ParseType>(
  urls: string[],
  { type }: GetClusteredPageContentsOptions<T> = {},
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

    const _testFilePath = path.join(
      process.cwd(),
      type === 'text' ? 'md' : 'screenshots',
      `${(url.endsWith('/') ? url.slice(0, -1) : url).slice(url.lastIndexOf('/') + 1)}`,
    );

    switch (type) {
      case 'image':
        const base64Screenshots = await parsePageContentToImage(page);
        // TODO - delte this later
        await Promise.all(
          base64Screenshots.map(async (screenshot, index) => {
            await writeFile(`${_testFilePath}_${index}.png`, Buffer.from(screenshot, 'base64'));
          }),
        );
        //

        results.push({
          url,
          base64Screenshots,
        } as ParseResult<T>);
        break;
      case 'text':
      default: {
        const markdown = await parsePageContentToMarkdown(page);
        // TODO - delte this later
        await writeFile(`${_testFilePath}.md`, markdown ?? '');
        //

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
