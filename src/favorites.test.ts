import {expect,it} from 'vitest';
import {createWorld,log,restore,serialize,toggleFavoriteEntry} from './simulation';

it('keeps a favorite after the recent journal rolls over and the world reloads', () => {
 const world=createWorld();
 const original=world.events[0];
 toggleFavoriteEntry(world,original);
 for(let i=0;i<100;i++)log(world,'New entry');
 expect(world.events).not.toContain(original);
 const restored=restore(serialize(world));
 expect(restored.favoriteEntries).toEqual([original]);
 toggleFavoriteEntry(restored,original);
 expect(restore(serialize(restored)).favoriteEntries).toEqual([]);
});
