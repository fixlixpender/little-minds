import type Phaser from 'phaser';
import {isLand} from './navigation';

const width = 960;
const height = 600;

function openSea(x: number, y: number) {
  return !isLand(x, y) && !(x >= 484 && x <= 553 && y >= 480 && y <= 577);
}

const shore: {x: number; y: number}[] = [];
for (let y = 8; y < height; y += 8) {
  for (let x = 8; x < width; x += 8) {
    if (openSea(x, y) && [isLand(x - 5, y), isLand(x + 5, y), isLand(x, y - 5), isLand(x, y + 5)].some(Boolean)) {
      shore.push({x, y});
    }
  }
}

export function drawSea(graphics: Phaser.GameObjects.Graphics, time: number, minute: number) {
  graphics.clear();
  const dusk = Math.max(0, 1 - Math.abs(minute - 1140) / 150);
  const moon = Math.max(0, Math.min(1, (minute - 1230) / 90, (1740 - minute) / 90),
    Math.min(1, (300 - minute) / 90));
  for (const {x, y} of shore) {
    const crest = (1 + Math.sin(time / 620 - x / 23 - y / 16)) / 2;
    if (crest < .55 || !openSea(x + 4, y)) continue;
    graphics.fillStyle(0xb8d5c3, .15 + crest * .3).fillRect(x, y, 4, 1);
  }
  for (let i = 0; i < 105; i++) {
    const y = (i * 67) % height;
    const x = Math.floor((i * 137 + time * .008) % width);
    const length = 5 + Math.round(4 * (1 + Math.sin(i + time / 900)));
    if (!openSea(x, y) || !openSea(x + length, y)) continue;
    const warm = dusk * Math.max(0, 1 - Math.abs(x - 110) / 100);
    const cool = moon * Math.max(0, 1 - Math.abs(x - 855) / 105);
    graphics.fillStyle(warm > cool ? 0xffce91 : cool > 0 ? 0xbcd9f3 : 0x8cb1b3,
      .18 + .59 * Math.max(warm, cool)).fillRect(x, y, length, warm > .4 ? 2 : 1);
  }
}
