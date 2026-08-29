# Backlog: Adapter Native SDK e consumer desktop mínimo

| Metainformação | Valor |
| --- | --- |
| ID | BACKLOG-0005 |
| Status | Promoted |
| Produto | openbible-engine |
| Épico | Engine consumível (M02 proposto) |
| Funcionalidade | Consumer desktop Native SDK |
| Tipo | Feature técnica |
| Prioridade | Não priorizado |
| Milestones | M02 (proposto) |
| Criado em | 2026-08-28 |
| Spec promovida | `specs/draft/0005-adapter-native-sdk-e-consumer-desktop-minimo/spec.md` |
| Interface para pessoas | Sim — UI desktop mínima |

## Ideia original

Transformar a compatibilidade com Vercel Native SDK de hipótese em prova compilável e executável, com um adapter nativo atrás das ports existentes e um consumer desktop mínimo.

## Problema percebido

A compatibilidade do engine com o Native SDK ainda é uma hipótese; o subset TypeScript, o acesso a SQLite/filesystem e o lifecycle do runtime nativo não foram comprovados.

## Pessoa afetada ou beneficiada

Equipe do aplicativo desktop nativo e usuários desktop que precisam ler e buscar Bíblias offline.

## Resultado ou valor esperado

Permitir que um app desktop separado consuma o mesmo domínio Scripture Library, com adapter nativo atrás das ports existentes e prova compilável e executável.

## Contexto

Fatia posterior à distribuição e ao consumer Web/PWA: deve validar primeiro o runtime e o consumer mínimo, preferir TypeScript aceito pelo Native SDK e usar bridge Zig/C fina somente se o driver SQLite TypeScript não for aceito; não altera o projeto legado.

## Referências relacionadas

- Inbox: `specs/inbox/2026-08-26-193948-adapter-native-sdk-e-consumer-desktop-minimo.md` (origem; captura integral preservada).
- Spec relacionada: `specs/completed/0001-openbible-engine-scripture-library/spec.md` (ports, contratos portáveis, core conservador e Native SDK como hipótese).
- Spec relacionada: `specs/completed/0002-adapter-web-sqlite-offline-com-opfs/spec.md` (semântica do adapter SQLite e garantia de operação offline; Native SDK fora do escopo).
- Dependência: `specs/completed/0003-distribuicao-versionada-e-estabilidade-da-api-publica/spec.md` (exports, tarballs e compatibilidade dos packages).
- Documentação relacionada: `docs/adr/001-typescript-portatil-em-vez-de-rust.md` (subset TypeScript e fallback Zig/C).
- Documentação relacionada: `docs/adr/007-native-sdk-consumidor-substituivel.md` (consumer Native SDK atrás de effects/services).
- Documentação relacionada: `docs/adr/009-migracao-strangler-futura.md` (consumidores reais antes de 1.0).
- Contexto técnico: `.specsfy/STACK.md` e `.specsfy/RULES.md` (Node 22, TypeScript strict, ports e adapter Native SDK reservado).

## Comportamento esperado

- A spike identifica a versão/API oficial do Native SDK e as plataformas suportadas antes de fixar o alvo do consumer.
- O consumer mínimo deve compilar e executar no runtime escolhido, instalar uma fixture SQLite sintética, listar livros, ler um capítulo, buscar versículos offline e remover a versão pelos exports públicos.
- A jornada deve exercitar o adapter Native SDK atrás das ports existentes, sem mover regras de domínio para o consumer.
- A primeira prova também terá uma UI desktop mínima para acionar e observar essa jornada; não é uma aplicação desktop completa.
- A UI deve preservar as três capacidades já provadas no consumer Web — Biblioteca, Leitor e Busca — adaptadas ao runtime nativo, sem copiar a lógica da engine.
- A composição será uma janela única com navegação direta entre as áreas Biblioteca, Leitor e Busca.
- A UI exibirá os estados disponível, instalada, instalando, removendo, carregando, vazio, erro com retry e offline; ações ficarão desabilitadas durante operações.
- Os bancos SQLite e o registry da prova viverão em namespace nativo isolado, usando fixture sintética e sem migrar, copiar ou alterar dados do legado.
- O consumer desktop será um app privado em `apps/consumer-native` dentro deste monorepo.
- O baseline de acessibilidade será: ações por teclado, foco visível, nomes/labels claros, estados de erro e operação anunciados e ordem de foco previsível.

## Regras de negócio

- O consumer usa somente os exports públicos de `@openbible/engine` e do adapter Native SDK; não importa `src/` interno.
- `engine-core` e `engine` permanecem portáveis e sem dependências de plataforma; filesystem, SQLite e detalhes do Native SDK ficam no adapter/consumer.
- A UI não implementa parser, ordenação, leitura, busca ou instalação; delega essas regras às ports e à engine.
- Operações locais não dependem de rede; indisponibilidade de capacidade retorna erro tipado sem fallback de persistência em memória.
- A prova não altera, copia nem lê diretamente o projeto legado e não usa banco bíblico real.
- Se o driver SQLite TypeScript não for aceito pelo Native SDK, a alternativa é uma bridge Zig/C fina atrás das mesmas ports, sem expandir o core.
- A UI bloqueia ações incompatíveis durante instalação/remoção e oferece retry para falhas recuperáveis.

## Critérios de aceitação

- AC-01 — A matriz da spike registra a versão/API consultada do Native SDK, plataformas avaliadas e capacidades confirmadas antes da escolha do alvo.
- AC-02 — Um consumer mínimo compila e executa no alvo escolhido importando somente os exports públicos da engine e do adapter.
- AC-03 — A fixture SQLite sintética pode ser instalada, consultada, buscada e removida offline, sem acesso de rede implícito.
- AC-04 — A leitura e a busca retornam a mesma semântica dos contratos existentes, incluindo ordenação, limites e erros tipados.
- AC-05 — O teste de falha de instalação não deixa versão parcial e preserva uma versão anterior utilizável.
- AC-06 — A UI desktop mínima permite iniciar instalação/remoção, abrir a leitura e executar busca nas três áreas da janela, exibindo os estados operacionais definidos sem duplicar regras da engine.
- AC-07 — A UI não oferece ações concorrentes incompatíveis durante instalação/remoção e mantém retry explícito quando o adapter retornar erro tipado.
- AC-08 — A prova não altera o projeto legado nem depende de bancos bíblicos reais; o armazenamento isolado e a fixture sintética são suficientes para a jornada.
- AC-09 — O app em `apps/consumer-native` valida a integração no monorepo sem publicar pacotes ou depender de um repositório remoto.
- AC-10 — A UI permite operar por teclado, mantém foco visível e previsível e comunica estados de operação e erro com nomes claros.

## Qualidades e operação

- Segurança: sem credenciais ou `.env`; namespace derivado de identificadores validados; erros não expõem paths físicos, SQL ou stack; projeto legado permanece intocado.
- Privacidade: bancos e registry ficam no armazenamento local isolado do consumer; não há sincronização, conta ou envio de dados nesta fatia.
- Desempenho e volume: a UI não copia o banco inteiro; leitura e busca usam os limites e a ordenação dos contratos existentes; nenhum alvo numérico é definido antes da spike.
- Auditoria e observabilidade: a matriz de capacidades, comandos, resultados da conformance, versão do SDK e decisão do driver ficam registrados na spec e na documentação técnica.
- Operação: build, typecheck, lint, testes do consumer, testes do adapter e conformance do runtime escolhido devem ser reproduzíveis no monorepo; plataformas não executáveis serão identificadas como não suportadas, não mascaradas.

## Dependências

- SPEC-0001: ports, contratos serializáveis, engine-core e façade `createBibleEngine`.
- SPEC-0002: semântica do adapter SQLite, fixture legada sintética e garantias de instalação/offline a preservar.
- SPEC-0003: exports, tarballs e política de compatibilidade dos packages.
- Documentação e toolchain oficiais do Native SDK, incluindo versão, plataformas e capacidades do runtime.
- Um driver SQLite e uma estratégia de filesystem aceitos pelo alvo Native SDK, definidos pela spike.

## Situações de erro

- Native SDK, compilador ou plataforma não suportados → registrar a capacidade ausente e não declarar compatibilidade.
- Driver SQLite TypeScript rejeitado → avaliar bridge Zig/C fina atrás das ports; não introduzir driver no core.
- Filesystem ou SQLite indisponível → erro tipado de storage, sem simular persistência em memória.
- Pacote inválido, falha ou cancelamento na instalação → sem registro parcial e com versão anterior preservada.
- Falha de leitura/busca ou versão não instalada → código de erro estável traduzido pela UI, com retry quando aplicável.
- Ação concorrente durante instalação/remoção → bloquear a ação incompatível e manter o estado visível.

## Escopo

- Dentro: spike da versão/API e matriz Native SDK; adapter SQLite Native atrás das ports; consumer privado em `apps/consumer-native`; UI desktop mínima em janela única com Biblioteca, Leitor e Busca; fixture sintética; namespace local isolado; instalação, listagem, leitura, busca e remoção offline; estados essenciais, acessibilidade básica, testes, conformance e documentação.
- Fora: aplicação desktop completa; migração ou leitura direta do legado; banco bíblico real; Personal Study; Sync/Turso; API pública; React Native; TUI; publicação npm; repositório remoto; suporte a plataformas não comprovadas pela spike.

## Dúvidas, decisões e riscos

- Decisão confirmada: iniciar com uma spike baseada na versão e API oficiais do Native SDK, validando a matriz de plataformas antes de fixar o consumer desktop.
- Efeito: a spike deve separar capacidades confirmadas de hipóteses e orientar a escolha de runtime, filesystem e driver SQLite.
- Decisão confirmada: a primeira prova será uma fatia vertical completa, incluindo instalação, listagem, leitura, busca e remoção offline.
- Decisão confirmada: a primeira prova terá uma UI desktop mínima, além da execução técnica do fluxo.
- Decisão confirmada: a UI será uma janela única com navegação entre Biblioteca, Leitor e Busca.
- Decisão confirmada: a UI exibirá os estados essenciais de disponibilidade, operação, vazio, erro com retry e offline, bloqueando ações incompatíveis durante operações.
- Decisão confirmada: a prova usará namespace nativo isolado, fixture SQLite sintética e não tocará no armazenamento legado.
- Decisão confirmada: o consumer será privado em `apps/consumer-native` no monorepo.
- Decisão confirmada: a UI exige teclado, foco visível e previsível, labels claros e comunicação de estados/erros.
- Aberto: versão/API exata, plataformas, driver SQLite, filesystem e tecnologia de UI compatível com o Native SDK; a spike deve produzir evidência para essas escolhas.

### Respostas confirmadas no refinamento

- Pergunta 1: spike oficial da versão/API e matriz de plataformas antes de fixar o alvo.
- Pergunta 2: vertical completa com compilar, executar, instalar, listar, ler, buscar e remover offline.
- Pergunta 3: UI desktop mínima, além da prova técnica.
- Pergunta 4: janela única com navegação entre Biblioteca, Leitor e Busca.
- Pergunta 5: estados essenciais completos, incluindo disponibilidade, operação, carregamento, vazio, erro com retry e offline.
- Pergunta 6: namespace nativo isolado com fixture sintética, sem tocar no legado.
- Pergunta 7: consumer privado em `apps/consumer-native` no monorepo.
- Pergunta 8: baseline de teclado, foco visível, semântica básica, labels claros e estados anunciados.

## Pronto para desenvolvimento

 - [x] O problema e a pessoa beneficiada estão claros.
 - [x] O evento inicial e o resultado esperado estão claros.
 - [x] Permissões, regras e exceções relevantes estão claras.
 - [x] O resultado pode ser verificado objetivamente.
 - [x] Segurança, privacidade e desempenho foram avaliados conforme o risco.
 - [x] Fora de escopo, dependências e decisões pendentes estão registrados.

## Próximo passo

Pronto para especificação com `$specsfy-03-specify`; manter a spike como primeira tarefa da definição e o `Definition Gate` pendente até a evidência do Native SDK ser consolidada.
