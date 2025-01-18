import type { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;

  namespace NodeJS {
    export interface ProcessEnv {

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
