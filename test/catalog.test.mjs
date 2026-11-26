import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const source = new URL('../library/skills/choose-demo-combo/SKILL.md', import.meta.url);
const server = fileURLToPath(new URL('../plugins/demo-menu/server.mjs', import.meta.url));
const requests = [
  { method: 'initialize', params: { protocolVersion: '2025-11-25' } },
  { method: 'tools/list' },
  { method: 'tools/call', params: { name: 'list_demo_skills' } },
  { method: 'tools/call', params: { name: 'get_demo_skill', arguments: { skillId: 'choose-demo-combo' } } },
  { method: 'tools/call', params: { name: 'list_demo_menu', arguments: {} } },
  { method: 'tools/call', params: { name: 'get_demo_skill', arguments: { skillId: 'missing' } } },
];

test('the installed MCP can list and read Skills, then still read the menu', () => {
  const input = requests.map((request, id) =>
    JSON.stringify({ jsonrpc: '2.0', id, ...request })).join('\n') + '\n';
  const run = spawnSync(process.execPath, [server], { input, encoding: 'utf8', timeout: 5000 });
  assert.equal(run.status, 0, run.stderr || run.error?.message);
  const responses = run.stdout.trim().split('\n').map(JSON.parse);
  assert.equal(responses.length, requests.length);
  const [init, listed, summaries, selected, menu, unknown] = responses.map(({ result }) => result);
  assert.match(init.instructions, /list_demo_skills.*get_demo_skill/);
  assert.deepEqual(listed.tools.map(({ name }) => name), [
    'list_demo_menu', 'list_demo_skills', 'get_demo_skill',
  ]);
  const decode = (result) => JSON.parse(result.content[0].text);
  assert.deepEqual(decode(summaries).map(({ id, title }) => [id, title]), [['choose-demo-combo', '預算配餐']]);
  assert.equal(Object.hasOwn(decode(summaries)[0], 'instructions'), false);
  assert.equal(decode(selected).instructions, readFileSync(source, 'utf8').replaceAll('\r\n', '\n'));
  const prices = Object.fromEntries(decode(menu).map(({ name, priceTwd }) => [name, priceTwd]));
  assert.equal(Object.keys(prices).length, 4);
  assert.equal(prices['冰美式'] + prices['紅茶司康'], 145);
  assert.equal(unknown.isError, true);
  assert.match(unknown.content[0].text, /Unknown Skill ID/);
});
