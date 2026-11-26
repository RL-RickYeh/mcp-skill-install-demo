import { createInterface } from 'node:readline';
import { dispatch, rpcError } from './demo-mcp.mjs';

function send(message) {
  process.stdout.write(JSON.stringify(message) + '\n');
}

for await (const line of createInterface({ input: process.stdin, crlfDelay: Infinity })) {
  let request;
  try {
    request = JSON.parse(line);
  } catch {
    send(rpcError(null, -32700, 'Invalid JSON'));
    continue;
  }
  if (request && typeof request.method === 'string' && Object.hasOwn(request, 'id')) {
    send(dispatch(request));
  }
}
