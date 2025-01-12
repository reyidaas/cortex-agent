import express from 'express';
import { config } from 'dotenv';

import { chatRouter } from '@/routes';
import { errorRequestHandler } from '@/util/error';

config();

const HOST = process.env.HOST ?? 'localhost';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(chatRouter);
app.use(errorRequestHandler);

app.listen(PORT, HOST, () => console.log(`Listening on http://${HOST}:${PORT}`));
