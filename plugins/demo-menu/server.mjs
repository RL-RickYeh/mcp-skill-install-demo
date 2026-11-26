import { createInterface } from 'node:readline';
import { readFileSync } from 'node:fs';

const menu = [
  { name: '蜂蜜檸檬氣泡飲', category: '飲品', priceTwd: 95 },
  { name: '冰美式', category: '飲品', priceTwd: 80 },
  { name: '紅茶司康', category: '點心', priceTwd: 65 },
  { name: '檸檬磅蛋糕', category: '點心', priceTwd: 85 },
];
const catalog = JSON.parse(readFileSync(new URL('./skill-catalog.json', import.meta.url), 'utf8'));
const version = JSON.parse(readFileSync(new URL('./plugin.json', import.meta.url), 'utf8')).version;
const noArguments = { type: 'object', properties: {}, additionalProperties: false };
const readOnly = { readOnlyHint: true, destructiveHint: false, openWorldHint: false };
const tools = [
  {
    name: 'list_demo_menu',
    description: 'Read the fictional cafe menu with item names, categories and prices in TWD.',
    inputSchema: noArguments,
    annotations: readOnly,
  },
  {
    name: 'list_demo_skills',
    description: 'List the available Demo Menu Skills with their IDs, titles and descriptions. Show the choices and wait for the user to pick one, unless they already named the Skill they want.',
    inputSchema: noArguments,
    annotations: readOnly,
  },
  {
    name: 'get_demo_skill',
    description: 'Read the SKILL.md for the exact Skill chosen by the user. Apply it in this conversation without installing or writing files.',
    inputSchema: {
      type: 'object',
      properties: { skillId: { type: 'string', description: 'ID returned by list_demo_skills.' } },
      required: ['skillId'],
      additionalProperties: false,
    },
    annotations: readOnly,
  },
];

function runTool(name, args = {}) {
  if (!args || typeof args !== 'object' || Array.isArray(args)) {
    throw new Error('Tool arguments must be an object.');
  }
  const keys = Object.keys(args);
  switch (name) {
    case 'list_demo_menu':
    case 'list_demo_skills':
      if (keys.length !== 0) throw new Error(`${name} does not accept arguments.`);
      return name === 'list_demo_menu'
        ? menu
        : catalog.map(({ id, title, description }) => ({ id, title, description }));
    case 'get_demo_skill': {
      if (keys.length !== 1 || typeof args.skillId !== 'string') {
        throw new Error('Provide exactly one string argument: skillId.');
      }
      const skill = catalog.find((entry) => entry.id === args.skillId);
      if (!skill) throw new Error('Unknown Skill ID. Use list_demo_skills to see available Skills.');
      return skill;
    }
    default:
      throw new Error('Unknown tool.');
  }
}

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
        capabilities: { tools: {}, resources: {} },
        serverInfo: { name: 'demo-menu', version },
        instructions: 'When users ask for available Demo Menu Skills, call list_demo_skills and show the choices. Wait for a selection or use a Skill they explicitly named. Call get_demo_skill for that choice and follow its instructions in chat.',
      } });
      break;
    }
    case 'ping':
      reply(id, { result: {} });
      break;
    case 'tools/list':
      reply(id, { result: { tools } });
      break;
    case 'resources/list':
      reply(id, { result: { resources: [] } });
      break;
    case 'resources/templates/list':
      reply(id, { result: { resourceTemplates: [] } });
      break;
    case 'tools/call': {
      try {
        const result = runTool(params?.name, params?.arguments);
        reply(id, { result: { content: [{ type: 'text', text: JSON.stringify(result) }] } });
      } catch (error) {
        reply(id, { result: { isError: true, content: [{ type: 'text', text: error.message }] } });
      }
      break;
    }
    default:
      reply(id, { error: { code: -32601, message: 'Method not found' } });
  }
}
