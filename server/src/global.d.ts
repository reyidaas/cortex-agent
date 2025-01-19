import type { PrismaClient } from '@prisma/client';
import type { OpenAI } from 'openai';

declare global {
  var prisma: PrismaClient | undefined;
  var openai: OpenAI | undefined;

  namespace NodeJS {
    interface ProcessEnv {

      NODE_ENV: 'production' | 'development';
      HOST?: string;
      PORT?: string;
    }
  }

  namespace Express {
    interface Request {
      userId: string;
    }
  }
}
