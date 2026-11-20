import {weatherAt, weatherStrength} from './weather';

export function ambientMix(day: number, minute: number) {
  const rain = weatherAt(day, minute) === 'rain' ? weatherStrength(day, minute) : 0;
  return {sea: 1 - rain * .2, rain: rain * .22};
}

export function createAmbientAudio(context: AudioContext) {
  const master = context.createGain();
  master.connect(context.destination);

  function layer(type: BiquadFilterType, frequency: number, sample: () => number) {
    const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index++) data[index] = sample();
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    const gain = context.createGain();
    gain.gain.value = 0;
    source.connect(filter).connect(gain).connect(master);
    source.start();
    return gain.gain;
  }

  let previous = 0;
  const sea = layer('lowpass', 650, () => {
    previous = (previous + Math.random() * .04 - .02) / 1.02;
    return previous;
  });
  const rain = layer('bandpass', 1900, () => Math.random() * 2 - 1);
  return {master: master.gain, sea, rain};
}
