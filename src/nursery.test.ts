import {expect,it} from 'vitest';
import {nurseryStage,waterNursery} from './nursery';
import {createWorld,restore,serialize} from './simulation';

it('persists watering, grows overnight and reaches bloom after three waterings',()=>{
  const world=createWorld();
  world.nursery=waterNursery(1);
  const saved=restore(serialize(world));
  expect(waterNursery(1,saved.nursery)).toBeUndefined();
  expect(nurseryStage(1,saved.nursery)).toBe(0);
  expect(nurseryStage(2,saved.nursery)).toBe(1);
  saved.nursery=waterNursery(2,saved.nursery);
  saved.nursery=waterNursery(3,saved.nursery);
  expect(nurseryStage(3,saved.nursery)).toBe(2);
  expect(nurseryStage(4,saved.nursery)).toBe(3);
  expect(waterNursery(4,saved.nursery)).toBeUndefined();
});
