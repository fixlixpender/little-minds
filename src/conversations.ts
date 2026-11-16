import {activities} from './activityState';
import {activityEventText,activityMemory} from './activities';
import{log,profiles,type Entry,type PersonId,type World}from './simulation';
import{t,type Language}from './i18n';
import type{Topic}from './socialState';
type Line={en:string;'pt-PT':string};
const line=(en:string,pt:string):Line=>({en,'pt-PT':pt});
export const replies:Record<string,Line>={
 'mira.garden':line('The seedlings are finally growing. I keep checking, even though I know they need time.','As sementes estão finalmente a germinar. Estou sempre a espreitar, mesmo sabendo que precisam de tempo.'),
 'mira.forest':line('I found a seed I don’t recognise. I’ll plant just one first. Better to be careful.','Encontrei uma semente que não reconheço. Vou plantar só uma primeiro. Convém ter cuidado.'),
 'mira.lake':line('There’s a tiny plant by the lake that closes when the shade reaches it. I want to understand why.','Há uma plantinha junto ao lago que se fecha quando a sombra lhe chega. Quero perceber porquê.'),
 'mira.rest':line('I’ve put my notes away for tonight. Well… almost all of them.','Já guardei os apontamentos por hoje. Bem… quase todos.'),
 'mira.island':line('The forest is quieter near the lake. If you go slowly, you notice more than you expect.','A floresta é mais sossegada perto do lago. Se fores devagar, reparas em mais coisas do que esperas.'),
 'mira.company':line('We could sit here without talking for a while. I’d like that.','Podíamos ficar aqui um bocadinho sem falar. Eu gostava.'),
 'theo.work':line('I’ve made a little wind-powered machine. It’s excellent at scattering my notes.','Fiz uma pequena máquina movida a vento. É excelente a espalhar os meus apontamentos.'),
 'theo.pier':line('The boat floated for three whole seconds! I’m calling that progress. Next time, four.','O barco flutuou durante três segundos inteirinhos! Chamo a isso progresso. Para a próxima, quatro.'),
 'theo.square':line('I told Mira about my automatic watering machine. She asked whether it could water things gently. Fair question.','Contei à Mira a ideia da máquina de rega automática. Perguntou se conseguia regar com cuidado. Uma pergunta justa.'),
 'theo.rest':line('No more inventing tonight. Unless I get a really good idea. Or a fairly good one.','Hoje já não invento mais nada. A não ser que tenha uma ideia muito boa. Ou razoável.'),
 'theo.island':line('The pier is my favourite testing ground. The sea is a very honest critic.','O cais é o meu sítio preferido para fazer testes. O mar é um crítico muito honesto.'),
 'theo.company':line('Of course! Stay a while. You can be my witness if this invention actually works.','Claro! Fica um bocadinho. Podes ser a testemunha se esta invenção funcionar.'),
 'luma.lake':line('The sky looks different in the lake. The same stars, a different way of seeing them.','O céu parece diferente no lago. As mesmas estrelas, outra maneira de as ver.'),
 'luma.forest':line('I came here to think. The trees don’t rush me to reach a conclusion.','Vim para aqui pensar. As árvores não me apressam a chegar a uma conclusão.'),
 'luma.lighthouse':line('I’m studying the lighthouse. There’s a pattern in the old marks on its wall. It might mean nothing.','Estou a estudar o farol. Há um padrão nas marcas antigas da parede. Pode não significar nada.'),
 'luma.stars':line('Look towards the sea. There’s a clear patch of sky tonight. I could watch it for hours.','Olha na direção do mar. Há uma parte do céu muito limpa esta noite. Podia ficar horas a observá-la.'),
 'luma.rest':line('I should sleep, but I keep thinking about who last watched the sea from that lighthouse.','Devia dormir, mas continuo a pensar em quem terá olhado para o mar pela última vez naquele farol.'),
 'luma.island':line('Everyone calls the lighthouse abandoned. I’m not sure a place stops holding stories just because nobody lives there.','Toda a gente diz que o farol está abandonado. Não sei se um lugar deixa de guardar histórias só porque ninguém lá vive.'),
 'luma.company':line('You can stay. We don’t need to agree on the meaning of the universe to enjoy the view.','Podes ficar. Não precisamos de concordar sobre o sentido do universo para apreciar a vista.'),
};
export function replyText(key:string,language:Language):string{return replies[key]?.[language]??t('O mundo segue o seu ritmo',language);}
export function chooseReply(world:World,id:PersonId,topic:Topic):string{
 if(topic!=='day')return `${id}.${topic}`;
 const resident=world.residents.find(r=>r.id===id)!;
 if(resident.activity==='A descansar em casa')return `${id}.rest`;
 if(id==='mira')return resident.target==='floresta'?'mira.forest':resident.target==='lago'?'mira.lake':'mira.garden';
 if(id==='theo')return resident.target==='cais'?'theo.pier':resident.target==='praca'?'theo.square':'theo.work';
 return resident.activity==='A observar as estrelas'?'luma.stars':resident.target==='farol'?'luma.lighthouse':resident.target==='floresta'?'luma.forest':'luma.lake';
}
export function talk(world:World,id:PersonId,topic:Topic):{reply:string;gain:number;recorded:boolean}|null{
 const resident=world.residents.find(r=>r.id===id);
 if(!resident||Math.hypot(resident.x-world.player.x,resident.y-world.player.y)>70)return null;
 const bond=world.playerBonds[id],now=world.day*1440+world.minute,reply=chooseReply(world,id,topic),last=bond.memories[0];
 if(last?.topic===topic&&last.reply===reply&&bond.lastTalkAt!==null&&now-bond.lastTalkAt<30)return{reply,gain:0,recorded:false};
 const recent=bond.memories.some(m=>m.topic===topic&&m.reply===reply&&now-(m.day*1440+m.minute)<30);
 if(recent)return{reply,gain:0,recorded:false};
 const gain=bond.lastRewardAt===null||now-bond.lastRewardAt>=120?Math.min(3,100-bond.affinity):0;
 bond.affinity+=gain;if(gain>0)bond.lastRewardAt=now;bond.lastTalkAt=now;bond.talkCount++;
 bond.memories.unshift({topic,reply,day:world.day,minute:world.minute});bond.memories=bond.memories.slice(0,6);
 log(world,`Conversaste com ${profiles[id].name}: “${replyText(reply,'pt-PT')}”`,id,'discovery');
 world.events[0].conversation={topic,reply};
 return{reply,gain,recorded:true};
}
export function eventText(entry:Entry,language:Language):string{
 if(entry.shared&&Object.hasOwn(activities,entry.shared.task)&&['started','completed','cancelled','expired'].includes(entry.shared.phase))return activityEventText(entry.shared.task,entry.shared.phase,language,entry.shared.chapter);
 const record=entry.conversation;
 if(record&&entry.person&&profiles[entry.person]&&replies[record.reply])return language==='en'?`You talked to ${profiles[entry.person].name}: “${replyText(record.reply,language)}”`:`Conversaste com ${profiles[entry.person].name}: “${replyText(record.reply,language)}”`;
 return t(entry.text,language);
}
export function greeting(world:World,id:PersonId,language:Language):string{
 const memory=activityMemory(world,id,language);if(memory)return memory;
 const known=world.playerBonds[id].talkCount>0;
 const lines:Record<PersonId,[Line,Line]>={
 mira:[line('Oh… hello. It’s nice to meet you.','Oh… olá. É bom conhecer-te.'),line('It’s good to see you again. I remember our little conversation.','É bom voltar a ver-te. Lembro-me da nossa conversa.')],
 theo:[line('A new face! Welcome. Mind the spare parts.','Uma cara nova! Bem-vindo. Cuidado com as peças soltas.'),line('You’re back! Good timing. I have plenty to tell you.','Voltaste! Chegas mesmo a tempo. Tenho muito para contar.')],
 luma:[line('Hello. Have you found your own quiet corner of the island yet?','Olá. Já encontraste o teu cantinho sossegado na ilha?'),line('Hello again. Some questions are better with company.','Olá outra vez. Há perguntas que sabem melhor com companhia.')],
 };
 return lines[id][known?1:0][language];
}
export function bondLabel(affinity:number):string{return affinity>=24?'Amizade':affinity>=9?'Familiaridade':'A conhecer-te';}
