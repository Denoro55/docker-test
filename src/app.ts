import { type Server, createServer } from 'node:http';
import { hostname } from 'node:os';

const VERSION = '1.0.0';

interface IAppOptions {
  message?: string;
}

export function createApp({ message = 'Hello from my-project' }: IAppOptions = {}): Server {
  return createServer((req, res) => {
    const path = (req.url ?? '/').split('?')[0];

    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.method === 'GET' && path === '/') {
      res.end(JSON.stringify({ message, version: VERSION, hostname: hostname() }));

      return;
    }

    if (req.method === 'GET' && path === '/health') {
      res.end(JSON.stringify({ status: 'ok' }));

      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
  });
}
