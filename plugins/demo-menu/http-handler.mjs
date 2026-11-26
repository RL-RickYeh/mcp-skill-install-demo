import { dispatch, rpcError, supportedVersions } from './demo-mcp.mjs';

const maxBodyBytes = 32 * 1024;
const allowedOrigins = new Set(['https://chatgpt.com', 'https://chat.openai.com', 'https://platform.openai.com']);

function error(status, code, message) {
  return Response.json(rpcError(null, code, message), { status });
}

export async function handleHttp(request) {
  const { pathname } = new URL(request.url);
  if (pathname === '/health' && request.method === 'GET') return Response.json({ ok: true });
  if (pathname !== '/mcp') return new Response(null, { status: 404 });
  const origin = request.headers.get('origin');
  if (origin !== null && !allowedOrigins.has(origin)) return error(403, -32000, 'Origin not allowed');
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  }
  const version = request.headers.get('mcp-protocol-version');
  if (version && !supportedVersions.includes(version)) return error(400, -32600, 'Unsupported MCP protocol version');
  const contentType = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/json') return error(415, -32600, 'Content-Type must be application/json');
  const accept = request.headers.get('accept')?.toLowerCase();
  if (accept && !accept.includes('application/json') && !accept.includes('*/*')) {
    return error(406, -32600, 'This demo returns application/json');
  }
  if (!request.body) return error(400, -32700, 'Invalid JSON');
  if (Number(request.headers.get('content-length')) > maxBodyBytes) return error(413, -32600, 'Request too large');
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let length = 0;
  let raw = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > maxBodyBytes) {
      void reader.cancel().catch(() => {});
      return error(413, -32600, 'Request too large');
    }
    raw += decoder.decode(value, { stream: true });
  }
  let message;
  try {
    message = JSON.parse(raw + decoder.decode());
  } catch {
    return error(400, -32700, 'Invalid JSON');
  }
  if (!message || message.jsonrpc !== '2.0') return error(400, -32600, 'Expected one JSON-RPC 2.0 message');
  const hasId = Object.hasOwn(message, 'id');
  const isMethod = typeof message.method === 'string';
  if ((isMethod && !hasId) || (!isMethod && hasId && ('result' in message || 'error' in message))) {
    return new Response(null, { status: 202 });
  }
  if (!isMethod || !['string', 'number'].includes(typeof message.id)) {
    return error(400, -32600, 'Invalid JSON-RPC request');
  }
  return Response.json(dispatch(message, { includePrompts: true }), { headers: { 'Cache-Control': 'no-store' } });
}
