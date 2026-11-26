import catalog from './skill-catalog.json' with { type: 'json' };
import manifest from './plugin.json' with { type: 'json' };

const menu = [
  { name: '蜂蜜檸檬氣泡飲', category: '飲品', priceTwd: 95 },
  { name: '冰美式', category: '飲品', priceTwd: 80 },
  { name: '紅茶司康', category: '點心', priceTwd: 65 },
  { name: '檸檬磅蛋糕', category: '點心', priceTwd: 85 },
];
export const supportedVersions = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];
const noArguments = { type: 'object', properties: {}, additionalProperties: false };
const readOnly = { readOnlyHint: true, destructiveHint: false, openWorldHint: false };
const instructions = 'When users ask for available Demo Menu Skills, call list_demo_skills and show the choices. Wait for a selection or use a Skill they explicitly named. Call get_demo_skill for that choice and follow its instructions in chat.';
const listSkillsPrompt = { name: 'list-skills', description: 'List Demo Menu Skills and let the user choose a workflow.' };
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

export function rpcError(id, code, message) {
  return { jsonrpc: '2.0', id, error: { code, message } };
}

export function dispatch(request, { includePrompts = false } = {}) {
  const { id, method, params } = request;
  const reply = (result) => ({ jsonrpc: '2.0', id, result });
  switch (method) {
    case 'initialize':
      return reply({
        protocolVersion: supportedVersions.includes(params?.protocolVersion) ? params.protocolVersion : supportedVersions[0],
        capabilities: { tools: {}, resources: {}, ...(includePrompts && { prompts: {} }) },
        serverInfo: { name: 'demo-menu', version: manifest.version },
        instructions,
      });
    case 'ping':
      return reply({});
    case 'tools/list':
      return reply({ tools });
    case 'resources/list':
      return reply({ resources: [] });
    case 'resources/templates/list':
      return reply({ resourceTemplates: [] });
    case 'prompts/list':
      return includePrompts ? reply({ prompts: [listSkillsPrompt] }) : rpcError(id, -32601, 'Method not found');
    case 'prompts/get':
      if (!includePrompts) return rpcError(id, -32601, 'Method not found');
      if (params?.name !== listSkillsPrompt.name) return rpcError(id, -32602, 'Unknown prompt');
      return reply({
        description: listSkillsPrompt.description,
        messages: [{ role: 'user', content: { type: 'text', text: instructions } }],
      });
    case 'tools/call': {
      try {
        const result = runTool(params?.name, params?.arguments);
        return reply({ content: [{ type: 'text', text: JSON.stringify(result) }] });
      } catch (error) {
        return reply({ isError: true, content: [{ type: 'text', text: error.message }] });
      }
    }
    default:
      return rpcError(id, -32601, 'Method not found');
  }
}
