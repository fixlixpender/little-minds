import type {Language} from './i18n';

const exchanges = {
  'mira-theo': [
    ['Mira: «A tua máquina consegue regar devagar?» Theo: «Ainda só tem duas velocidades: desligada e tempestade.»',
      'Mira: “Can your machine water slowly?” Theo: “It only has two speeds so far: off and thunderstorm.”'],
    ['Theo: «Trouxe-te um vaso que avisa quando tem sede.» Mira: «Posso ficar só com o vaso?»',
      'Theo: “I brought you a pot that tells you when it’s thirsty.” Mira: “Can I just keep the pot?”'],
  ],
  'luma-mira': [
    ['Luma: «Será que as plantas sentem a falta da luz à noite?» Mira: «Algumas só abrem quando escurece.»',
      'Luma: “Do plants miss the light at night?” Mira: “Some only open after dark.”'],
    ['Mira: «As folhas guardam gotas como estrelas.» Luma: «Então hoje o céu começa no chão.»',
      'Mira: “The leaves hold droplets like stars.” Luma: “Then today the sky starts at our feet.”'],
  ],
  'luma-theo': [
    ['Theo: «E se o farol tivesse uma lente nova?» Luma: «Primeiro gostava de saber quem olhava pela antiga.»',
      'Theo: “What if the lighthouse had a new lens?” Luma: “First I’d like to know who looked through the old one.”'],
    ['Luma: «Dás sempre nomes às tuas invenções?» Theo: «Só às que sobrevivem ao primeiro teste.»',
      'Luma: “Do you always name your inventions?” Theo: “Only the ones that survive the first test.”'],
  ],
} as const;

export function residentTalkText(pair: string, variant: number, language: Language): string | undefined {
  if (!Object.hasOwn(exchanges, pair)) return;
  return exchanges[pair as keyof typeof exchanges][variant]?.[language === 'en' ? 1 : 0];
}
