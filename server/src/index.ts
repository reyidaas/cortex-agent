import express from 'express';
import { config } from 'dotenv';

config();

const HOST = process.env.HOST ?? 'localhost';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

const app = express();

app.get('/hello', (_, res) => res.json({ hi: 'hello!' }));

app.listen(PORT, HOST, () => console.log(`Listening on http://${HOST}:${PORT}`));
