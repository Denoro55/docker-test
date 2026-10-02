import { once } from 'node:events';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { hostname } from 'node:os';
import { createApp } from '../src/app';

describe('HTTP service', () => {
  let server: Server;
  let baseUrl: string;

  async function start(message?: string): Promise<void> {
    server = message === undefined ? createApp() : createApp({ message });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  }

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it('returns the greeting, version and hostname', async () => {
    await start();
    const response = await fetch(baseUrl);

    expect(response.status).toBe(200);

    expect(response.headers.get('content-type')).toContain('application/json');
    expect(await response.json()).toEqual({
      message: 'Hello from my-project',
      version: '1.0.0',
      hostname: hostname(),
    });
  });

  it('returns a custom greeting', async () => {
    await start('Hello from tests');
    const response = await fetch(baseUrl);

    expect(await response.json()).toMatchObject({ message: 'Hello from tests' });
  });

  it('answers health requests, including a query string', async () => {
    await start();
    const response = await fetch(`${baseUrl}/health?check=1`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
  });

  it.each([
    ['/missing', 'GET'],
    ['/', 'POST'],
    ['/health', 'POST'],
  ])('returns 404 for %s with %s', async (path, method) => {
    await start();
    const response = await fetch(`${baseUrl}${path}`, { method });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'Not found' });
  });
});
