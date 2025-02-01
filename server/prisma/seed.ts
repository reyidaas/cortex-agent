import { PrismaClient, type Prisma } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const USER_ID = '25997ddc-19cb-4a1b-9dec-9c7af3f21345' as const;
const USER_NAME = 'Tester' as const;
const API_KEY = '1e23f206-c1e0-442f-8d24-fffe2ec1aacf' as const;
const TOOLS = [
  {
    name: 'final-answer',
    description: 'Use this tool to generate a response to the user.',
    instruction: 'Generate a JSON: { "answer": "" }',
  },
  {
    name: 'calendar',
    description: 'Use this tool to get events from calendar or create them.',
    instruction: 'Generate a JSON: { "calendar": "" }',
  },
  {
    name: 'todo',
    description: 'Use this tool to get tasks from todo list app or create them.',
    instruction: 'Generate a JSON: { "todo": "" }',
  },
  {
    name: 'web',
    description: 'Use this tool to access web.',
    instruction: 'Generate a JSON: { "query": "" }',
  },
  {
    name: 'mail',
    description: 'Use this tool integrate with mails.',
    instruction: 'Generate a JSON: { "mail": "" }',
  },
] as const satisfies Prisma.ToolCreateInput[];
const MEMORY_CATEGORIES = [
  {
    name: 'events',
    description:
      "This category includes memories about user's events.",
  },
  {
    name: 'meetings',
    description:
      "This category includes memories about user's meetings.",
  },
  {
    name: 'projects',
    description: "This category includes memories about user's projects.",
  },
  {
    name: 'todo',
    description: "This category includes memories about user's tasks.",
  },
] as const satisfies Prisma.MemoryCategoryCreateInput[];

(async () => {
  try {
    await prisma.user.deleteMany();
    await prisma.tool.deleteMany();
    await prisma.memory.deleteMany();
    await prisma.memoryCategory.deleteMany();

    const hashedApiKey = await hash(API_KEY, 10);

    await prisma.user.create({
      data: {
        name: USER_NAME,
        apiKey: hashedApiKey,
        id: USER_ID,
        environment: {
          create: { content: 'The user lives in Poland, Cracow city. He is from Poland.' },
        },
        personality: {
          create: {
            content:
              'The user is a software engineer, specialising in fullstack web development. He likes italian food.',
          },
        },
      },
    });

    await prisma.tool.createMany({ data: TOOLS });
    await prisma.memoryCategory.createMany({ data: MEMORY_CATEGORIES });

    console.log('SEED COMPLETE');
  } catch (error) {
    console.log(error);
  }
})();
