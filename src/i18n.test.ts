import {describe,it,expect} from 'vitest';
import {t,readLanguage} from './i18n';
import {createWorld,advance,serialize,restore,profiles} from './simulation';
describe('language selection and existing saves',()=>{
 it('starts in English and respects the saved PT preference',()=>{
  expect(readLanguage({getItem:()=>null})).toBe('en');
  expect(readLanguage({getItem:()=> 'pt-PT'})).toBe('pt-PT');
  expect(readLanguage({getItem:()=> 'invalid'})).toBe('en');
  expect(readLanguage({getItem:()=>{throw Error('blocked')}})).toBe('en');
 });
 it('translates old diary entries without changing the save',()=>{
  const world=createWorld();advance(world,1);const raw=serialize(world);
  const restored=restore(raw);
  expect(restored.events.map(e=>t(e.text,'en'))).toContain('Mira: tending the garden.');
  expect(t(restored.events.at(-1)!.text,'en')).toBe('A new morning arrives on Aurora Island.');
  expect(serialize(restored)).toBe(raw);
 });
 it('translates social events and conversations including legacy dialogue',()=>{
  expect(t('Mira e Theo partilham um momento na ilha.','en')).toBe('Mira and Theo share a moment on the island.');
  expect(t('Conversaste com Theo: “O barco flutuou! Durante três segundos, mas conta.”','en')).toBe('You talked to Theo: “The boat floated! For three seconds, but it counts.”');
  expect(t('Theo: “Tenho uma ideia. Só me faltam… quase todas as peças.”','en')).toContain('I have an idea.');
 });
 it('switches profiles and map names while keeping names and unknown content intact',()=>{
  expect(t(profiles.mira.role,'en')).toBe('Botanist');
  expect(t('FAROL ABANDONADO','en')).toBe('ABANDONED LIGHTHOUSE');
  expect(t('Tu','en')).toBe('You');
  expect(t('Mira','en')).toBe('Mira');
  expect(t('An original future AI response','en')).toBe('An original future AI response');
  expect(t(profiles.mira.quote,'pt-PT')).toBe(profiles.mira.quote);
 });
});
