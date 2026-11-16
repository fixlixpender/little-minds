# Little Minds — Ilha Aurora

Primeira versão funcional independente. React 19 + TypeScript + Phaser 3 + Vite.

## Idiomas

O jogo começa em inglês. O seletor no cabeçalho permite mudar para português de Portugal; a escolha fica guardada neste navegador. Interface, nomes no mapa, perfis, atividades, conversas locais e acontecimentos conhecidos são traduzidos sem reiniciar o mundo, incluindo gravações da alpha anterior. Os nomes Mira, Theo e Luma mantêm-se.

`src/i18n.ts` centraliza o texto de apresentação e mantém a compatibilidade com memórias existentes. Respostas futuras de IA devem ser geradas no idioma escolhido; texto desconhecido é preservado.

## Experimentar

Requer Node.js 20.19+ ou 22.12+.

```sh
npm ci
npm run dev
```

Abrir o endereço mostrado pelo Vite (normalmente http://localhost:5173).

- **Observador:** selecionar habitantes no mapa ou nos cartões; acompanhar rotinas e diário.
- **Personagem:** no cabeçalho, abrir Your character / A tua personagem para escolher nome, tom de pele, penteado e cores. Há pré-visualização; Guardar e explorar aplica as escolhas no mapa e grava-as imediatamente no navegador. Cancelar descarta alterações. O editor também abre na primeira entrada no modo Habitante.
- **Habitante:** WASD/setas, botões direcionais ou tocar/clicar no terreno. E ou Conversar perto de um habitante.
- **Conversas:** aproximar-se de um habitante e usar E / Conversar para abrir três temas. A resposta sobre o dia varia com a rotina; cada habitante tem um laço próprio com o jogador e recorda os últimos seis temas/encontros. O laço cresce até três pontos a cada duas horas do jogo; repetir o mesmo tema em menos de 30 minutos do jogo não duplica o registo. A ilha fica suspensa durante o diálogo.
- **Atividades partilhadas:** numa conversa, combinar uma atividade e usar Go to the meeting place / Ir para o local. O habitante caminha para o encontro. O progresso avança quando ambos estão perto do destino; afastar-se interrompe o progresso sem o apagar. A tarefa dura dez minutos do jogo (cerca de cinco segundos a 1× depois de ambos chegarem).
- Mira cuida da horta entre 06:00 e 19:00; Theo testa o barco entre 06:00 e 20:00; Luma observa o céu entre 19:00 e 05:00. Uma conclusão por atividade e por dia, quatro pontos de laço, e mudanças persistentes no mapa. Pode existir apenas um plano ativo; expira após três horas do jogo e pode ser cancelado sem penalização.
- A secção The island we’re growing / A ilha que construímos acompanha flores na horta, testes do barco e mapas do céu. O mundo não avança quando fechado.
- Pausar e alternar velocidades 1×, 3×, 10×. Um dia completo dura 12 minutos a 1×.
- Clicar no terreno traça um percurso seguro em redor das casas e do lago, com linha e marcador de destino. WASD/setas ou controlos táteis assumem o movimento manual e cancelam esse percurso.
- O cais pode ser percorrido até à ponta. Clicar na água ou num edifício cancela o destino. Árvores e mobiliário continuam decorativos nesta alpha.
- O botão de som ativa ambiente marítimo sintetizado localmente.
- O progresso é guardado automaticamente a cada 3 segundos no navegador, com a chave `little-minds:aurora:v1`.
- O tempo fica suspenso quando a aplicação está fechada. Não há processos em segundo plano.

## Verificação

```sh
npm test
npm run build
```

## Arquitetura

- `src/simulation.ts`: estado versionado, relógio, decisões locais, rotinas individuais, energia, relações, diário e serialização.
- `src/Island.ts`: cena Phaser, mapa pixel art determinístico desenhado por código, sprites animados, navegação em grelha, colisões, ondas, pirilampos e iluminação noturna.
- `src/navigation.ts`: terreno transitável, colisões, recuperação de posições antigas e percursos partilhados pelo jogador e habitantes.
- `src/main.tsx`: interface React, modos, controlos móveis, conversas locais e ciclo de gravação.
- `src/avatar.ts` e `src/CharacterEditor.tsx`: identidade validada, escolhas de aparência e editor com pré-visualização. Gravações antigas recebem um perfil padrão sem reiniciar o mundo.
- `src/conversations.ts`, `src/socialState.ts` e `src/Conversation.tsx`: diálogos locais EN/PT, temas, memórias recentes, laços com o jogador e registos de diário traduzíveis.
- `src/activityState.ts`, `src/activities.ts` e `src/SharedActivities.tsx`: planos, horários, progresso por presença, resultados comunitários, cancelamento e persistência.
- `src/style.css`: interface responsiva.

`DecisionProvider` separa decisões do motor. Um futuro adaptador OpenRouter deverá correr num servidor, com chaves fora do cliente, orçamento e limites explícitos, validação de decisões e fallback local. Este protótipo não contém integração ativa, chaves nem chamadas a modelos. Google Fonts é opcional; existem fontes de sistema de reserva.

## Limites desta alpha

Mapa exterior fixo e visto por inteiro; sem interiores, inventário ou missões. A aparência do jogador pode ser personalizada com três penteados e paletas de pele, cabelo e roupa; acessórios e orientação dos sprites ainda não estão disponíveis. As conversas usam respostas locais por tema e rotina. As relações entre habitantes evoluem por proximidade; os laços com o jogador evoluem em conversas com limites de frequência. Ainda não existe memória narrativa livre. Rotinas usam destinos e percursos em grelha; não existe planeamento por LLM. A arte é procedural e original, sem recursos externos de jogos. O pacote Phaser é grande e o Vite emite um aviso de tamanho, sem impedir a compilação.

## API e segredos

O repositório é público. Nunca colocar chaves no código, em ficheiros versionados ou em variáveis `VITE_*`: essas variáveis são incorporadas no JavaScript público.

A futura chave `OPENROUTER_API_KEY` deve existir apenas no ambiente do servidor. O cliente chamará um endpoint próprio, com autenticação, limites de pedidos e orçamento. `.env` e variantes estão excluídos pelo `.gitignore`; este projeto ainda não faz chamadas a APIs pagas.

### Character stories
Each shared activity now follows a three-meeting local story: Mira’s unknown seed, Theo’s little boat and Luma’s lighthouse markings. Complete an activity on three different island days to finish its story; prior activity counts carry forward. Invitations, greetings and journal outcomes reflect progress in EN/PT-PT. Completed journal entries retain their original chapter even as the story advances. Activities remain repeatable after the ending with the existing daily limit and bond reward. Stories are authored locally in `src/stories.ts`; no API calls.

### Expressive islanders
Map characters now face four directions as they walk, with distinct outfits and role details for Mira, Theo and Luma. Small pixel bubbles show rest, gardening, inventing, stargazing and shared company; the selected islander has a ground ring. The player keeps the saved appearance, including the crest hairstyle. Character motion and cue bobbing stop while the world is paused. Visual state is derived locally and does not change saves or decisions.
