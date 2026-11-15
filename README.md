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
- **Habitante:** WASD/setas, botões direcionais ou tocar/clicar no terreno. E ou Conversar perto de um habitante.
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
- `src/style.css`: interface responsiva.

`DecisionProvider` separa decisões do motor. Um futuro adaptador OpenRouter deverá correr num servidor, com chaves fora do cliente, orçamento e limites explícitos, validação de decisões e fallback local. Este protótipo não contém integração ativa, chaves nem chamadas a modelos. Google Fonts é opcional; existem fontes de sistema de reserva.

## Limites desta alpha

Mapa exterior fixo e visto por inteiro; sem interiores, inventário ou missões. A personagem do jogador é um visitante fixo, ainda sem editor de aparência. As conversas são frases locais, e as relações evoluem por proximidade. Rotinas usam destinos e percursos em grelha; não existe planeamento por LLM. A arte é procedural e original, sem recursos externos de jogos. O pacote Phaser é grande e o Vite emite um aviso de tamanho, sem impedir a compilação.

## API e segredos

O repositório é público. Nunca colocar chaves no código, em ficheiros versionados ou em variáveis `VITE_*`: essas variáveis são incorporadas no JavaScript público.

A futura chave `OPENROUTER_API_KEY` deve existir apenas no ambiente do servidor. O cliente chamará um endpoint próprio, com autenticação, limites de pedidos e orçamento. `.env` e variantes estão excluídos pelo `.gitignore`; este projeto ainda não faz chamadas a APIs pagas.
