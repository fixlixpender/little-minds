import {expect, it} from 'vitest';
import {ambientMix} from './ambientAudio';

it('fades rain in and out using the island clock and leaves mist quiet', () => {
  expect(ambientMix(2, 539)).toEqual({sea: 1, rain: 0});
  expect(ambientMix(2, 555)).toEqual({sea: .9, rain: .11});
  expect(ambientMix(2, 720)).toEqual({sea: .8, rain: .22});
  expect(ambientMix(2, 1005)).toEqual({sea: .9, rain: .11});
  expect(ambientMix(2, 1020)).toEqual({sea: 1, rain: 0});
  expect(ambientMix(3, 420)).toEqual({sea: 1, rain: 0});
});
