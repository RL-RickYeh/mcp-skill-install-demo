import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import { handleHttp } from './http-handler.mjs';

const host = process.env.DEMO_MCP_HOST || '127.0.0.1';
const port = Number(process.env.DEMO_MCP_PORT ?? process.env.PORT ?? 8787);
const server = createServer(async (incoming, outgoing) => {
  try {
    const init = { method: incoming.method, headers: incoming.headers };
    if (incoming.method !== 'GET' && incoming.method !== 'HEAD') {
      init.body = Readable.toWeb(incoming);
      init.duplex = 'half';
    }
    const request = new Request(new URL(incoming.url, 'http://localhost'), init);
    const response = await handleHttp(request);
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    outgoing.end(response.body ? Buffer.from(await response.arrayBuffer()) : undefined);
  } catch {
    if (!outgoing.headersSent) outgoing.writeHead(500);
    outgoing.end();
  }
});

server.listen(port, host, () => {
  console.log(`Demo Menu MCP listening on http://${host}:${server.address().port}/mcp`);
});
