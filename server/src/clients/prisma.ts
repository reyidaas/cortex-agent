import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config();

export const prisma = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
