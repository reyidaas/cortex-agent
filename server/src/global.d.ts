import type { PrismaClient } from '@prisma/client';
import type { OpenAI } from 'openai';
import type { customsearch_v1 } from 'googleapis';
import type { TodoistApi } from '@doist/todoist-api-typescript';

declare global {
  var prisma: PrismaClient | undefined;
  var openai: OpenAI | undefined;
  var serp: customsearch_v1.Customsearch;
  var todoist: TodoistApi;

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'production' | 'development';
      HOST?: string;
      PORT?: string;
      DATABASE_URL?: string;
      OPENAI_API_KEY: string;
      OPENAI_PROJECT_ID: string;
      OPENAI_ORG_ID: string;
      GOOGLE_API_KEY: string;
      GOOGLE_SEARCH_ENGINE_ID: string;
      TODOIST_API: string;
    }
  }

  namespace Express {
    interface Request {
      userId: string;
    }
  }
}
