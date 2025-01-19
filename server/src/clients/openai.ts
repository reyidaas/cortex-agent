import { OpenAI } from 'openai';

export const openai = global.openai ?? new OpenAI();

if (process.env.NODE_ENV !== 'production') global.openai = openai;
