import { OpenAI } from 'openai';
import { config } from 'dotenv';

config();

export const openai = global.openai ?? new OpenAI();

if (process.env.NODE_ENV !== 'production') global.openai = openai;
