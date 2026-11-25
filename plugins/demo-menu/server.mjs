import { createInterface } from 'node:readline';

const menu = [
  { name: '蜂蜜檸檬氣泡飲', category: '飲品', priceTwd: 95 },
  { name: '冰美式', category: '飲品', priceTwd: 80 },
  { name: '紅茶司康', category: '點心', priceTwd: 65 },
  { name: '檸檬磅蛋糕', category: '點心', priceTwd: 85 },
];
const tool = {
  name: 'list_demo_menu',
  description: 'Read the fictional cafe menu with item names, categories and prices in TWD.',
  inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
};

function reply(id, payload) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, ...payload }) + '\n');
}

for await (const line of createInterface({ input: process.stdin, crlfDelay: Infinity })) {
  let request;
  try {
    request = JSON.parse(line);
  } catch {
    reply(null, { error: { code: -32700, message: 'Invalid JSON' } });
    continue;
  }
  if (!request || typeof request.method !== 'string' || !Object.hasOwn(request, 'id')) {
    continue;
  }

  const { id, method, params } = request;
  switch (method) {
    case 'initialize': {
      const supported = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];
      reply(id, { result: {
        protocolVersion: supported.includes(params?.protocolVersion) ? params.protocolVersion : supported[0],
        capabilities: { tools: {} },
        serverInfo: { name: 'demo-menu', version: '1.0.0' },
      } });
      break;
    }
    case 'ping':
      reply(id, { result: {} });
      break;
    case 'tools/list':
      reply(id, { result: { tools: [tool] } });
      break;
    case 'tools/call':
      if (params?.name === tool.name && Object.keys(params.arguments ?? {}).length === 0) {
        reply(id, { result: { content: [{ type: 'text', text: JSON.stringify(menu) }] } });
      } else {
        reply(id, { error: { code: -32602, message: 'Unknown tool or unexpected arguments' } });
      }
      break;
    default:
      reply(id, { error: { code: -32601, message: 'Method not found' } });
  }
}
