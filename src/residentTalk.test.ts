import {expect, it} from 'vitest';
import {advance, createWorld, places, restore, serialize} from './simulation';
import {eventText} from './conversations';

it('records a bilingual encounter between nearby residents and retains it on reload', () => {
  const world = createWorld();
  world.minute = 19 * 60;
  Object.assign(world.residents[0], places.praca);
  Object.assign(world.residents[1], places.praca);
  advance(world, 1);
  advance(world, 1);
  const loaded = restore(serialize(world));
  const encounters = loaded.events.filter(entry => entry.residentTalk);
  expect(encounters).toHaveLength(1);
  expect(eventText(encounters[0], 'pt-PT')).toContain('Mira:');
  expect(eventText(encounters[0], 'en')).not.toBe(encounters[0].text);
  expect(loaded.relationships['mira-theo']).toBe(25);
});

it('does not add dialogue for distant or resting residents', () => {
  const world = createWorld();
  advance(world, 1);
  expect(world.events.some(entry => entry.residentTalk)).toBe(false);
  world.minute = 22 * 60;
  Object.assign(world.residents[0], places.praca);
  Object.assign(world.residents[1], places.praca);
  advance(world, 1);
  expect(world.events.some(entry => entry.residentTalk)).toBe(false);
});
