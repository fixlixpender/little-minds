import {log, places, type World} from './simulation';

export const lighthouseClue = 'Na base do farol, três pontos ligam-se por um risco fino. Ao lado, alguém gravou: «Quando a luz se apagar, segue as estrelas.»';

export function nearLighthouse(world: World): boolean {
  return Math.hypot(world.player.x - places.farol.x, world.player.y - places.farol.y) <= 42;
}

export function discoverLighthouseClue(world: World): boolean {
  if (world.lighthouseClueFound || !nearLighthouse(world)) return false;
  world.lighthouseClueFound = true;
  log(world, lighthouseClue, undefined, 'discovery');
  return true;
}
