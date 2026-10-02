import assert from 'node:assert/strict';

async function main(): Promise<void> {
  const baseUrl = process.argv[2] ?? 'http://127.0.0.1:3000';
  const deadline = Date.now() + 30_000;
  let ready = false;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/health`, {
        signal: AbortSignal.timeout(Math.min(1000, Math.max(1, deadline - Date.now()))),
      });

      assert.equal(response.status, 200);

      assert.deepEqual(await response.json(), { status: 'ok' });
      ready = true;
      break;
    } catch (_err) {
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(250, Math.max(0, deadline - Date.now())))
      );
    }
  }

  assert.ok(ready, 'Service did not become ready within 30 seconds');
  const response = await fetch(baseUrl, { signal: AbortSignal.timeout(3000) });

  assert.equal(response.status, 200);
  const body = (await response.json()) as Record<string, unknown>;

  assert.equal(body.message, process.env.APP_MESSAGE ?? 'Hello from my-project');
  assert.equal(body.version, '1.0.0');
  assert.equal(typeof body.hostname, 'string');
  assert.ok(body.hostname);
  process.stdout.write(`HTTP checks passed: ${JSON.stringify(body)}\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(`${String(error)}\n`);
  process.exitCode = 1;
});
