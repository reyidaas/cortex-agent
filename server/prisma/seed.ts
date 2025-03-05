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
    actions: {
      create: [
        {
          name: 'text',
          description:
            'Use this action to send a final text response to the user after finalising all other actions, or there are no additional actions needed.',
          instruction:
            '{"answer": "Text, that will be the final answer to the user message. It might be simple answer, if there were no more actions taken, otherwise it should summarize taken actions recalled memories (if any), inform about results, etc. It is the direct answer to user\'s message."}',
        },
      ],
    },
  },
  {
    name: 'calendar',
    description: 'Use this tool to get events from calendar or create them.',
    actions: {
      create: [
        {
          name: 'search',
          description: 'Use this action to search for events / appointments in calendar.',
          instruction: '',
        },
        {
          name: 'create',
          description: 'Use this action to create an event in calendar.',
          instruction: '',
        },
      ],
    },
  },
  {
    name: 'todo',
    description: 'Use this tool to get tasks from todo list app or create them.',
    actions: {
      create: [
        {
          name: 'search',
          description: 'Use this action to search for tasks on todo list.',
          instruction: '',
        },
        {
          name: 'create',
          description: 'Use this action to create task on todo list.',
          instruction: '',
        },
      ],
    },
  },
  {
    name: 'web',
    description: 'Use this tool to access web.',
    actions: {
      create: [
        {
          name: 'search',
          description:
            'Use this action to search information in web and generate summary on your findings.',
          instruction:
            '{"queries": ["array of 3-5 query strings to perform on search engine in order to retrieve requested information. Make sure to use keywords helping in finding contentful pages (article, blog, news, documantation, etc.). Choose them relative to the context of user request."]}',
        },
      ],
    },
  },
  {
    name: 'mail',
    description: 'Use this tool integrate with mails.',
    actions: {
      create: [
        {
          name: 'search',
          description: 'Use this action to search emails.',
          instruction: '',
        },
        {
          name: 'send',
          description: 'Use this action to send an email.',
          instruction: '',
        },
      ],
    },
  },
  //  {
  //    name: 'ai-model',
  //    description: 'Use this tool generate content with usage of base AI model knowledge.',
  //    actions: {
  //      create: [
  //        {
  //          name: 'summarize',
  //          description: 'Use this action to create summaries.',
  //          instruction: '{"text": "the text to be summarized"}',
  //        },
  //      ],
  //    },
  //  },
] as const satisfies Prisma.ToolCreateInput[];
const MEMORY_CATEGORIES = [
  {
    name: 'events',
    description: "This category includes memories about user's events.",
  },
  {
    name: 'meetings',
    description: "This category includes memories about user's meetings.",
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
              "The user's name is Michal. The user is a software engineer, specialising in fullstack web development. He likes italian food.",
          },
        },
      },
    });

    await Promise.all(TOOLS.map((data) => prisma.tool.create({ data })));
    await prisma.memoryCategory.createMany({ data: MEMORY_CATEGORIES });

    console.log('SEED COMPLETE');
  } catch (error) {
    console.log(error);
  }
})();
