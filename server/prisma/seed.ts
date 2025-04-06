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
          instruction: `{"answer": "Provide a clear, direct response to the user's message. If you performed any actions (such as retrieving information, making calculations, or recalling specific memories), summarize these actions and their results. Structure your answer as follows:
              - For simple queries: Provide a concise, straightforward answer
              - For complex queries requiring multiple steps: Briefly outline the actions taken and present the final results
              - When relevant, cite sources or explain your reasoning process
              Your response should be comprehensive yet focused on addressing the user's specific needs without unnecessary elaboration.
            "}`,
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
          name: 'get-tasks',
          description: 'Use this action to search for tasks on todo list.',
          instruction: '{}',
        },
        {
          name: 'create-task',
          description: 'Use this action to create task on todo list.',
          instruction:
            '{"content": "Title of the task generated based on user message.", "description": "Optional field. If there is no point in creating additional description for the task, skip it. It is an additional description for a task."}',
        },
      ],
    },
  },
  {
    name: 'obsidian',
    description: 'Use this tool to interact with notes in Obsidian notes app.',
    actions: {
      create: [
        {
          name: 'create-note',
          description: 'Use this action to create note in Obsidian vault.',
          instruction:
            '{"title": "Title of the note, that will be created.", "content": "Content of the note, that will be created."}',
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
          instruction: `{"queries": ["3-5 search queries optimized for retrieving high-quality, structured content about the user's request. Each query should:
                -	Include domain-specific terminology relevant to the topic
                -	Incorporate content type indicators (guide, tutorial, documentation, research paper, case study)
                -	Use search operators where appropriate (site:, filetype:, intitle:)
                -	Do not try to generate queries, that will lead to content, that is hard to parse from html to markdown (such as pages with pdfs)
                -	Focus on authoritative sources by including terms like 'official', 'expert', or specific trusted domains
                -	Be specific enough to filter out promotional content"
             ]}`,
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
