import { readFileSync, writeFileSync } from 'node:fs';

const id = 'choose-demo-combo';
const source = new URL(`../library/skills/${id}/SKILL.md`, import.meta.url);
const instructions = readFileSync(source, 'utf8').replaceAll('\r\n', '\n');
const catalog = [{
  id,
  title: '預算配餐',
  description: '依新台幣預算選一杯飲品和一份點心。',
  instructions,
}];

writeFileSync(
  new URL('../plugins/demo-menu/skill-catalog.json', import.meta.url),
  JSON.stringify(catalog, null, 2) + '\n',
);
