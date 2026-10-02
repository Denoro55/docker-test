import { createApp } from './app';

const port = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  process.stderr.write('PORT must be an integer between 1 and 65535\n');
  process.exit(1);
}

const server = createApp({ message: process.env.APP_MESSAGE });

server.on('error', (error) => {
  process.stderr.write(`Server error: ${error.message}\n`);
  process.exitCode = 1;
});

server.listen(port, '0.0.0.0', () => {
  process.stdout.write(`Listening on 0.0.0.0:${port}\n`);
});

let stopping = false;

function shutdown(): void {
  if (stopping) {
    return;
  }

  stopping = true;
  process.stdout.write('Stopping server\n');
  const timeout = setTimeout(() => {
    server.closeAllConnections();
  }, 5000);

  timeout.unref();
  server.close(() => clearTimeout(timeout));
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
