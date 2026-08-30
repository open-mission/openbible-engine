# Backlog: Leitor Web e download de versões R2 com a engine

| Metainformação | Valor |
| --- | --- |
| ID | BACKLOG-0009 |
| Status | Promoted |
| Produto | openbible-engine (consumer Web) |
| Épico | Migração Web strangler |
| Funcionalidade | Leitor bíblico e instalação de versões R2 |
| Tipo | Feature |
| Prioridade | Alta — primeira fatia da M02 |
| Milestones | M02 |
| Criado em | 2026-08-30 |
| Spec promovida | `specs/draft/0009-leitor-web-download-r2/spec.md` |

## Ideia original

Começar a migração de `/home/claudio/Projects/open-bible/apps/web` para o projeto `openbible-engine` pelo Leitor bíblico Web e pelo download/instalação de versões publicadas no R2, usando os contratos públicos da nossa engine e preservando o legado somente como referência.

## Problema percebido

O consumer Web atual já prova uma fatia de Biblioteca, Leitor e Busca, mas a experiência do leitor e o ciclo de download das versões R2 precisam ser alinhados à migração incremental do aplicativo legado sem reintroduzir regras ou persistência acopladas.

## Pessoa afetada ou beneficiada

Equipe Web do Open Bible e usuários que dependem da experiência completa do aplicativo Web offline-first.

## Resultado ou valor esperado

Dispor de uma primeira fatia Web em que a pessoa baixa uma versão do R2, a instala pelo adapter/engine, abre um livro e capítulo e continua lendo offline, sem dependência operacional do projeto legado.

## Contexto

A fonte `/home/claudio/Projects/open-bible/apps/web` será somente leitura. O destino será `apps/consumer-web`, preservando Next.js/React/Tailwind e os limites públicos da engine. O provider atual já usa `HttpBiblePackageSource` com catálogo/API configurável e bucket R2; o fluxo precisa ser provado contra os artefatos oficiais e o armazenamento Web persistente.

## Referências relacionadas

- `specs/milestones/M02.md` — marco e ordem de execução.
- `specs/completed/0002-adapter-web-sqlite-offline-com-opfs/spec.md` — adapter Web, Worker, OPFS e lifecycle.
- `specs/completed/0003-distribuicao-versionada-e-estabilidade-da-api-publica/spec.md` — exports e assets distribuíveis.
- `specs/completed/0004-consumer-web-pwa-de-referencia-em-next-js/spec.md` — Biblioteca, Leitor, Busca e PWA de referência.
- `apps/consumer-web/src/engine/bible-engine-provider.tsx` — composição atual da engine e URLs R2 configuráveis.
- `packages/adapter-http/src/http-source.ts` — catálogo, mapeamento de arquivos R2 e aquisição de pacotes.
- `/home/claudio/Projects/open-bible/apps/web` — comportamento legado, somente leitura.

## Comportamento esperado

- A Biblioteca lista versões disponíveis e permite iniciar o download de uma versão publicada no R2.
- A instalação passa por `HttpBiblePackageSource`, `BibleInstaller` e `createBibleEngine`; a UI não interpreta SQLite.
- Depois do commit, a pessoa abre o Leitor, escolhe livro/capítulo e vê versículos ordenados.
- A versão instalada permanece disponível após reabrir o adapter e sem rede.
- Falha, cancelamento, pacote inválido ou armazenamento indisponível exibem estado recuperável sem versão parcial.

## Regras de negócio

- O consumer usa somente exports públicos de `@openbible/engine`, `@openbible/adapter-http` e `@openbible/adapter-sqlite-web`.
- R2 é origem de aquisição; leitura, navegação e busca local não fazem rede depois da instalação.
- O legado não é alterado, importado internamente nem usado como storage.
- O parser, ordenação, validação, instalação e leitura permanecem nos packages da engine.

## Critérios de aceitação

- AC-01 — Given uma versão disponível no catálogo/R2, When a pessoa solicita instalação, Then o arquivo é baixado, validado, instalado e aparece como disponível para leitura.
- AC-02 — Given uma versão instalada, When a pessoa abre livro e capítulo, Then o Leitor obtém livros e versículos pelos exports da engine e os exibe em ordem canônica.
- AC-03 — Given uma versão instalada e o contexto reaberto sem rede, When a pessoa abre o mesmo capítulo, Then a leitura continua disponível localmente.
- AC-04 — Given download cancelado, falha de rede ou pacote inválido, When a instalação termina, Then não há registro/arquivo parcial e uma versão anterior permanece utilizável.
- AC-05 — Given o ambiente sem storage Web utilizável, When o consumer inicializa, Then apresenta erro tipado/recuperável e não simula persistência em memória.

## Qualidades e operação

- Segurança: validar header/schema/identidade antes do commit; não expor paths, SQL ou credenciais.
- Privacidade: dados bíblicos ficam no storage local da origem; nenhuma nota, conta ou dado Sync entra nesta fatia.
- Desempenho e volume: download com progresso quando disponível; Worker/OPFS não copia o banco para a thread principal.
- Auditoria e observabilidade: Playwright, Vitest, conformance e testes de fronteira registram R2, instalação, reopen e offline.

## Dependências

- M01 aceito; specs 0002, 0003 e 0004 concluídas; `apps/consumer-web` atual; adapter HTTP com bucket R2 configurável.

## Situações de erro

- R2 indisponível, resposta não-2xx, arquivo ausente, header/schema inválido, cancelamento, `storage_busy` e storage indisponível devem preservar o estado anterior e permitir retry quando aplicável.

## Escopo

- Dentro: Biblioteca de versões, download/instalação R2, persistência Web, Leitor, seleção de livro/capítulo, navegação anterior/próxima, estados loading/vazio/erro/offline, testes e documentação.
- Fora: workspace completo, notas, destaques, categorias, autenticação, Sync, API pública, Tauri, alteração do legado, cópia de `.next`/`out`, bancos reais e publicação.

## Dúvidas, decisões e riscos

- Decisão confirmada: a M02 começa pelo Leitor bíblico e pelo download das versões do R2.
- Decisão confirmada: a migração será incremental e usará `apps/consumer-web` como destino.
- Decisão confirmada: `/home/claudio/Projects/open-bible/apps/web` permanece somente leitura.
- Aberto: conjunto final de versões exibidas, mensagens de produto, formato de progresso e eventuais ajustes visuais; fechar na spec sem reabrir a fronteira da engine.

## Pronto para desenvolvimento

- [x] O problema e a pessoa beneficiada estão claros.
- [x] O evento inicial e o resultado esperado estão claros.
- [x] Permissões, regras e exceções relevantes estão claras.
- [x] O resultado pode ser verificado objetivamente.
- [x] Segurança, privacidade e desempenho foram avaliados conforme o risco.
- [x] Fora de escopo, dependências e decisões pendentes estão registrados.

## Próximo passo

Promovido para `specs/draft/0009-leitor-web-download-r2/spec.md`; a spec é a
fonte normativa da primeira fatia e deve passar Definition/Plan Gates antes da
implementação.
