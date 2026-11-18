export type Language = 'en' | 'pt-PT';
export const LANGUAGE_KEY = 'little-minds:language';
export function readLanguage(storage: Pick<Storage, 'getItem'>): Language {
  try { return storage.getItem(LANGUAGE_KEY) === 'pt-PT' ? 'pt-PT' : 'en'; } catch { return 'en'; }
}
// World saves retain their original text. Translate known local content only at
// presentation time, so language switches never reset or rewrite world memories.
const translations: Record<string, string> = {
  'Reler a inscrição':'Read the inscription again',
  'Já descobriste a inscrição. Volta ao farol para a reler.':'You found the inscription. Return to the lighthouse to read it again.',
  'Examinar as marcas':'Inspect the markings',
  'Marcas no farol':'Lighthouse markings',
  'Há marcas na pedra junto ao farol. Aproxima-te para as examinar.':'There are markings in the stone by the lighthouse. Get closer to inspect them.',
  'Descobriste uma inscrição no farol. Pergunta à Luma sobre a ilha.':'You found an inscription at the lighthouse. Ask Luma about the island.',
  'Na base do farol, três pontos ligam-se por um risco fino. Ao lado, alguém gravou: «Quando a luz se apagar, segue as estrelas.»':'At the foot of the lighthouse, a thin line connects three dots. Beside them someone carved, “When the light goes out, follow the stars.”',
 'Chuva costeira':'Coastal rain','Neblina da manhã':'Morning mist',
 'encontros':'meetings','História concluída':'Story complete','História em curso':'Story in progress','Próximo encontro':'Next meeting','Podem continuar a partilhar esta atividade.':'You can keep sharing this activity.','Cada encontro concluído num novo dia faz a história avançar.':'Each completed meeting on a new day advances the story.',
  'UM MOMENTO JUNTOS':'A MOMENT TOGETHER','Cuidar da horta':'Tend the garden','Testar o pequeno barco':'Test the little boat','Desenhar uma constelação':'Sketch a constellation',
  'Rega as sementes com a Mira. Fiquem juntos junto aos canteiros durante alguns instantes.':'Water the seedlings with Mira. Spend a few moments together beside the garden beds.',
  'Junta-te ao Theo no cais e ajuda-o a testar a sua invenção. Desta vez, talvez flutue mais tempo.':'Join Theo at the pier and help test his invention. Perhaps it will float a little longer this time.',
  'Encontra-te com a Luma junto ao farol e observa as estrelas. Há um céu inteiro para descobrir.':'Meet Luma beside the lighthouse and watch the stars. There’s a whole sky to discover.',
  'Combinar atividade':'Arrange activity','Já tens uma atividade combinada.':'You already have an activity planned.',
  'Já partilharam este momento hoje. Volta amanhã.':'You shared this moment today. Come back tomorrow.',
  'Podem observar o céu entre as 19:00 e as 05:00.':'You can watch the sky between 19:00 and 05:00.',
  'Esta atividade está disponível durante o dia.':'This activity is available during the day.',
  'Atividade em curso':'Current activity','Cancelar atividade':'Cancel activity','Progresso da atividade':'Activity progress','Ir para o local':'Go to the meeting place',
  'Vai até ao local combinado.':'Head to the meeting place.',
  'O habitante está a caminho. Espera um bocadinho.':'Your companion is on the way. Wait a little while.',
  'Estão a partilhar este momento. Fica por perto.':'You’re sharing this moment. Stay nearby.',
  'Têm três horas da ilha para se encontrarem. Podes cancelar sem perder amizade.':'You have three island hours to meet. You can cancel without losing friendship.',
  'A ilha que construímos':'The island we’re growing','Os teus pequenos gestos ficam.':'Your little gestures leave a mark.',
  'Cuidados com a horta':'Garden visits','Testes do barco':'Boat tests','Mapas do céu':'Sky charts',
  'Aproxima-te de um habitante e conversa para combinar uma atividade.':'Talk to an islander nearby to arrange an activity.',
  'A cuidar da horta contigo':'Tending the garden with you','A testar o barco contigo':'Testing the boat with you','A observar o céu contigo':'Watching the sky with you',
  'o seu dia':'their day','a ilha':'the island','companhia':'company',
  'UM ENCONTRO NA ILHA':'AN ISLAND ENCOUNTER','O que gostavas de dizer?':'What would you like to say?',
  'Como está a correr o teu dia?':'How is your day going?','Conta-me algo sobre a ilha.':'Tell me something about the island.',
  'Posso fazer-te companhia?':'May I keep you company?','Laço contigo':'Your bond','A conhecer-te':'Getting to know you',
  'Familiaridade':'Familiar faces','Amizade':'Friends','Um pequeno laço cresceu.':'A little bond has grown.',
  'A amizade cresce com tempo, não com pressa.':'Friendship grows with time, not in a hurry.',
  'Último encontro':'Last encounter','Até já':'See you soon',
  'UM LUGAR NA ILHA':'A PLACE ON THE ISLAND', 'A tua personagem':'Your character', 'Editar personagem':'Edit character',
  'Escolhe como queres chegar à Aurora. Podes mudar mais tarde.':'Choose how you arrive on Aurora. You can change this later.',
  'Nome':'Name', 'Como te chamas?':'What’s your name?', 'Até 20 caracteres. Guardado apenas neste navegador.':'Up to 20 characters. Saved only in this browser.',
  'Tom de pele':'Skin tone','Cabelo':'Hairstyle','Cor do cabelo':'Hair colour','Roupa':'Outfit',
  'Areia':'Sand','Pêssego':'Peach','Quente':'Warm','Castanho':'Brown','Escuro':'Deep',
  'Curto':'Short','Comprido':'Long','Crista':'Crest','Preto':'Black','Dourado':'Golden','Grisalho':'Silver','Ruivo':'Auburn',
  'Sálvia':'Sage','Oceano':'Ocean','Ocre':'Ochre','Lavanda':'Lavender','Rosa':'Rose',
  'Cancelar':'Cancel','Guardar e explorar':'Save and explore',
  'A tua personagem está pronta. A ilha espera por ti!':'Your character is ready. The island is waiting for you!',
  'Little Minds início':'Little Minds home',
  'PEQUENAS VIDAS. GRANDES HISTÓRIAS.':'LITTLE LIVES. BIG STORIES.',
  'Ilha Aurora':'Aurora Island', 'ILHA AURORA':'AURORA ISLAND',
  'Ligar ambiente sonoro':'Enable ambient sound', 'Desligar ambiente sonoro':'Mute ambient sound',
  'UM PEQUENO MUNDO VIVO':'A LITTLE LIVING WORLD', 'A vida acontece aqui':'Life happens here',
  'Sem pressa. Cada encontro pode ser o início de uma história.':'Take your time. Every encounter could be the start of a story.',
  'Dia':'Day','DIA':'DAY','Sob as estrelas':'Under the stars','Fim de tarde':'Late afternoon','Céu tranquilo':'Peaceful skies',
  'Observador':'Observer','Habitante':'Inhabitant','Retomar':'Resume','Pausar':'Pause','Brisa do mar':'Sea breeze',
  'Conversar':'Talk','Conversar por perto':'Talk nearby',
  'Simulação em pausa':'Simulation paused','O mundo segue o seu ritmo':'The world follows its own rhythm',
  'Seleciona um habitante para o conhecer':'Select an islander to get to know them',
  'WASD / setas · E conversar · toca para caminhar':'WASD / arrows · E to talk · tap to walk',
  'Os habitantes':'The islanders','3 vidas a cruzarem-se':'3 lives crossing paths',
  'Diário da ilha':'Island journal','Os pequenos momentos ficam.':'The little moments stay with us.',
  'A vida na ilha':'Island life','Encontros':'Encounters','Uma ligação cresce':'A bond grows',
  'As histórias nascem dos encontros.':'Stories begin with encounters.','Deixa a ilha viver um pouco.':'Let the island live a little.',
  'Escrito pela vida, em tempo real':'Written by life, as it happens','Energia':'Energy',
  'Um lugar para simplesmente existir.':'A place to simply be.',
  'Progresso guardado neste dispositivo':'Progress saved on this device',
  'Não foi possível guardar neste navegador':'Could not save in this browser',
  'Aproxima-te de um habitante para conversar.':'Move closer to an islander to talk.',
  'Botânica':'Botanist','Inventor':'Inventor','Astrónoma':'Astronomer',
  'Introvertida · curiosa · cautelosa':'Introverted · curious · cautious',
  'Criativo · impulsivo · bem-humorado':'Creative · impulsive · good-humoured',
  'Independente · filosófica · curiosa':'Independent · philosophical · curious',
  'Há coisas que só crescem quando lhes damos tempo.':'Some things only grow when we give them time.',
  'E se a solução estiver na peça que sobrou?':'What if the answer is in the spare part?',
  'Pergunto-me quem terá apagado a última luz do farol.':'I wonder who put out the last light in the lighthouse.',
  'A começar o dia':'Starting the day','A descansar em casa':'Resting at home','A observar as estrelas':'Watching the stars',
  'A conversar na praça':'Chatting in the square','A cuidar da horta':'Tending the garden','A recolher sementes':'Gathering seeds',
  'A estudar plantas do lago':'Studying lakeside plants','A inventar na oficina':'Inventing in the workshop',
  'A testar um pequeno barco':'Testing a little boat','A partilhar uma ideia':'Sharing an idea',
  'A escrever no seu caderno':'Writing in her notebook','A investigar o farol':'Investigating the lighthouse',
  'A procurar um lugar sossegado':'Looking for a quiet spot',
  'Uma nova manhã chega à Ilha Aurora.':'A new morning arrives on Aurora Island.',
  'O sol regressa. A ilha guarda as memórias de ontem.':'The sun returns. The island holds on to yesterday’s memories.',
  'Encontrei uma semente junto ao lago. Vou tentar cultivá-la.':'I found a seed by the lake. I’m going to try growing it.',
  'Gosto do silêncio da horta. Queres ficar um bocadinho?':'I like the quiet of the garden. Would you like to stay a while?',
  'O barco flutuou! Durante três segundos, mas conta.':'The boat floated! For three seconds, but it counts.',
  'Tenho uma ideia. Só me faltam… quase todas as peças.':'I have an idea. I’m only missing… almost all the parts.',
  'O farol parece abandonado. Mas ontem vi uma luz.':'The lighthouse looks abandoned. But yesterday I saw a light.',
  'Às vezes, olhar para longe ajuda-nos a estar aqui.':'Sometimes, looking into the distance helps us be here.',
  'FLORESTA':'FOREST','HORTA':'GARDEN','PRAÇA':'SQUARE','LAGO':'LAKE','CAIS':'PIER','FAROL ABANDONADO':'ABANDONED LIGHTHOUSE','Tu':'You',
  'Mover up':'Move up','Mover down':'Move down','Mover left':'Move left','Mover right':'Move right',
};
export function t(text: string, language: Language): string {
  if (language === 'pt-PT') {
    return ({'Mover up':'Mover para cima','Mover down':'Mover para baixo','Mover left':'Mover para a esquerda','Mover right':'Mover para a direita'} as Record<string,string>)[text] ?? text;
  }
  if (translations[text]) return translations[text];
  const activity = /^(Mira|Theo|Luma): (a .+)\.$/.exec(text);
  if (activity) {
    const source = 'A' + activity[2].slice(1);
    if (translations[source]) return `${activity[1]}: ${translations[source].toLowerCase()}.`;
  }
  const social = /^(Mira|Theo|Luma) e (Mira|Theo|Luma) partilham um momento na ilha\.$/.exec(text);
  if (social) return `${social[1]} and ${social[2]} share a moment on the island.`;
  const conversation = /^Conversaste com (Mira|Theo|Luma): “(.+)”$/.exec(text);
  if (conversation) return `You talked to ${conversation[1]}: “${t(conversation[2], language)}”`;
  const speech = /^(Mira|Theo|Luma): “(.+)”$/.exec(text);
  if (speech) return `${speech[1]}: “${t(speech[2], language)}”`;
  return text;
}
