import assert from 'node:assert/strict';
import { test } from 'node:test';
import { handleHttp } from '../plugins/demo-menu/http-handler.mjs';

const url = process.env.DEMO_TEST_REMOTE || 'http://localhost/mcp';
const call = process.env.DEMO_TEST_REMOTE ? fetch : (target, init) => handleHttp(new Request(target, init));
const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json, text/event-stream',
};
const post = (message) => call(url, { method: 'POST', headers, body: JSON.stringify({ jsonrpc: '2.0', ...message }) });
async function rpc(method, params) {
  const res = await post({ id: 1, method, params });
  assert.equal(res.status, 200, await res.clone().text());
  return (await res.json()).result;
}
const runTool = async (name, args) => JSON.parse(
  (await rpc('tools/call', { name, arguments: args })).content[0].text,
);

test('remote MCP exposes a Skill picker and runs the same cafe workflow', async () => {
  const init = await rpc('initialize', { protocolVersion: '2025-11-25' });
  assert.equal(init.protocolVersion, '2025-11-25');
  assert.ok(init.capabilities.prompts);
  assert.equal((await post({ method: 'notifications/initialized' })).status, 202);
  assert.equal((await call(url)).status, 405);
  assert.equal((await rpc('prompts/list')).prompts[0].name, 'list-skills');
  assert.match((await rpc('prompts/get', { name: 'list-skills' })).messages[0].content.text, /list_demo_skills/);
  const { tools } = await rpc('tools/list');
  assert.ok(tools.every(({ annotations }) => annotations.readOnlyHint));
  const skills = await runTool('list_demo_skills');
  assert.equal(skills[0].title, '預算配餐');
  assert.equal(Object.hasOwn(skills[0], 'instructions'), false);
  const selected = await runTool('get_demo_skill', { skillId: skills[0].id });
  assert.match(selected.instructions, /list_demo_menu/);
  const menu = await runTool('list_demo_menu');
  assert.equal(menu.find((item) => item.name === '冰美式').priceTwd +
    menu.find((item) => item.name === '紅茶司康').priceTwd, 145);
});

test('remote MCP rejects an unexpected browser origin and incompatible HTTP requests', async () => {
  const invalidOrigin = await call(url, { method: 'POST', headers: { Origin: 'https://unrelated.example' } });
  assert.equal(invalidOrigin.status, 403);
  assert.equal((await call(url, { method: 'POST' })).status, 415);
  assert.equal((await post({ id: 1 })).status, 400);
});
