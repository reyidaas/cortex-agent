import { google } from 'googleapis';
import { config } from 'dotenv';

config();

export const serp = global.serp ?? google.customsearch('v1');

if (process.env.NODE_ENV !== 'production') global.serp = serp;
