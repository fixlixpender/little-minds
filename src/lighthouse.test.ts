import {expect,it} from 'vitest';
import {chooseReply,eventText} from './conversations';
import {discoverLighthouseClue} from './lighthouse';
import {createWorld,places,restore,serialize} from './simulation';

it('requires proximity, records the inscription once and unlocks Luma’s response after reload', () => {
  const world = createWorld();
  expect(discoverLighthouseClue(world)).toBe(false);
  expect(chooseReply(world,'luma','island')).toBe('luma.island');
  world.player = {...places.farol};
  expect(discoverLighthouseClue(world)).toBe(true);
  const restored = restore(serialize(world));
  expect(discoverLighthouseClue(restored)).toBe(false);
  expect(eventText(restored.events[0],'en')).toContain('follow the stars');
  expect(chooseReply(restored,'luma','island')).toBe('luma.inscription');
  expect(chooseReply(restored,'mira','island')).toBe('mira.island');
});
