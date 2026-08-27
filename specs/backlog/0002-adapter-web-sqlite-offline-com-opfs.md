# Backlog: Adapter Web SQLite offline com OPFS

| Metainformação | Valor |
| --- | --- |
| ID | BACKLOG-0002 |
| Status | Promoted |
| Produto | OpenBible Engine |
| Épico | Persistência offline multiplataforma |
| Funcionalidade | Adapter SQLite Web |
| Tipo | Técnico |
| Prioridade | Alta — desbloqueia o consumidor Web/PWA |
| Milestones | M01 |
| Criado em | 2026-08-26 |
| Spec promovida | `specs/completed/0002-adapter-web-sqlite-offline-com-opfs/spec.md` |

## Ideia original

Prosseguir com a próxima fatia do openbible-engine: implementar o adapter Web real para a aplicação Web/PWA funcionar 100% offline.

## Problema percebido

O pacote @openbible/adapter-sqlite-web é apenas um placeholder e ainda não permite usar a engine com SQLite persistente no navegador.

## Pessoa afetada ou beneficiada

Desenvolvedores dos consumidores Web/PWA do Open Bible e usuários que precisam consultar a Bíblia sem conexão.

## Resultado ou valor esperado

Instalar, persistir, reabrir, consultar, buscar e remover bancos bíblicos SQLite legados no navegador pelos contratos públicos da engine.

## Contexto

Nova fatia vertical posterior à spec 0001 concluída, usando Web Worker, SQLite WASM e armazenamento OPFS/SAHPool, com verificação em navegador real.

## Referências relacionadas

- `specs/inbox/2026-08-26-164211-adapter-web-sqlite-offline-com-opfs.md` — captura de origem.
- `specs/completed/0001-openbible-engine-scripture-library/spec.md` — spec precedente; definiu os contratos portáveis e deixou o adapter Web real fora da primeira entrega.
- `packages/adapter-sqlite-web/src/sqlite-web.ts` — placeholder atual que falha com `storage_unavailable`.
- `/home/claudio/Projects/open-bible/apps/web/lib/database/DatabaseManager.ts` — implementação legada relacionada; referência para Worker RPC e ciclo de conexão, não fonte normativa.
- `/home/claudio/Projects/open-bible/apps/web/lib/database/sqlite-worker.source.js` — implementação legada relacionada; referência para SQLite WASM + SAHPool, não fonte normativa.
- [SQLite WASM — Persistent Storage Options](https://www.sqlite.org/wasm/doc/trunk/persistence.md) — documentação primária sobre OPFS e SAHPool.
- [Playwright — Browsers](https://playwright.dev/docs/browsers) — documentação primária do runner de integração em navegador real.

## Comportamento esperado

- O consumidor compõe uma instância funcional da engine com library, registry e installer Web pertencentes ao mesmo adapter.
- O registry de versões é persistido em um banco SQLite de controle dentro do mesmo SAHPool e acessado exclusivamente pelo Worker.
- A instalação recebe bytes de um SQLite no schema legado aceito pela spec 0001, valida o pacote e o persiste no armazenamento privado da origem.
- Após encerrar e recriar o contexto da engine, a versão continua registrada e consultável sem rede.
- A versão instalada permite listar livros, ler capítulos, obter o nome e buscar versos com a mesma semântica pública da engine.
- A desinstalação remove tanto o banco quanto seu registro; reinstalação com falha preserva a versão anterior utilizável.
- Ao inicializar, o adapter executa reconciliação best-effort dos estados intermediários conhecidos; casos ambíguos são resolvidos por uma heurística documentada, sem promessa de crash-safety completa.
- Falta de Worker, WebAssembly ou OPFS resulta em erro tipado da engine, sem simular persistência em memória.

## Regras de negócio

- Preservar IDs canônicos e a conversão dos IDs inteiros `1..66` do schema legado definida na entrega precedente.
- A identidade da versão vem do input/manifesto da engine; `metadata.versionId` permanece opcional no banco legado.
- A engine e `engine-core` continuam puras e não importam APIs de navegador, SQLite ou OPFS.
- O adapter deve operar 100% offline depois que o pacote bíblico e os assets WASM tiverem sido disponibilizados pelo consumidor.
- O Worker é o único proprietário das conexões SQLite e do acesso síncrono ao OPFS.
- O pacote fornece Worker e assets SQLite WASM por URLs relativas ao módulo, com configuração para sobrescrever URLs ou a factory do Worker quando o bundler exigir.
- Durante a inicialização, o adapter solicita armazenamento persistente em modo best-effort e expõe se a origem obteve essa proteção; uma negativa não bloqueia a operação offline.
- O registry Web não usa IndexedDB e não é inferido somente pela lista de arquivos; ele mantém os metadados exigidos por `InstalledBibleRegistry` em SQLite.
- SAHPool é a direção inicial porque funciona em Worker sem exigir cabeçalhos COOP/COEP; sua limitação de concorrência entre contextos precisa de política explícita na spec.

## Critérios de aceitação

- Um teste em navegador real instala uma fixture SQLite legada e comprova `getBooks`, `getChapter`, `getVersionName` e `search` pelos contratos públicos.
- O teste encerra e recria o contexto do adapter e comprova persistência do registro e do banco.
- O teste desinstala a versão e comprova ausência no registry e no armazenamento.
- Testes de falha comprovam que instalação inválida ou interrompida não deixa uma nova versão parcialmente utilizável e não destrói uma instalação anterior.
- Testes de capacidade detectam ambiente sem OPFS/Worker/WASM e retornam erro público estável.
- Build, typecheck, lint, testes unitários, testes arquiteturais e conformance Web ficam verdes.

## Qualidades e operação

- Segurança: nomes de versão são normalizados antes de virar caminhos lógicos; SQL interno usa parâmetros para valores; bytes externos são validados antes do commit.
- Privacidade: bancos e registry permanecem no armazenamento privado da origem; esta fatia não sincroniza nem envia dados ao Turso.
- Durabilidade: `navigator.storage.persist()` é solicitado automaticamente em best-effort e seu resultado é observável; o adapter não promete impedir eviction quando o navegador negar.
- Desempenho e volume: consultas não devem copiar o banco inteiro para a thread principal; bytes de instalação podem ser transferidos ao Worker sem cópia quando o runtime permitir.
- Concorrência: apenas um contexto pode possuir o pool; uma segunda aba recebe `storage_busy` e pode tentar novamente quando a primeira liberar o armazenamento.
- Compatibilidade: Chromium e WebKit são gates obrigatórios em navegador real; Firefox é compatibilidade adicional e não bloqueia a primeira entrega.
- Auditoria e observabilidade: falhas do Worker e de persistência devem preservar código de erro tipado e causa técnica útil, sem `console` obrigatório na API pública.

## Dependências

- Contratos entregues por `@openbible/engine` e `@openbible/engine-core` na spec 0001.
- Distribuição oficial de SQLite WASM com suporte ao VFS `opfs-sahpool`.
- Pipeline do pacote capaz de publicar o Worker e o WASM como artefatos consumíveis por Astro, Next.js e bundlers equivalentes, sem depender de um caminho fixo em `public/`.
- Worker dedicado e APIs OPFS disponíveis no navegador.
- Runner de integração em navegador real, inicialmente avaliado com Playwright.

## Situações de erro

- Runtime não oferece Worker, WebAssembly, OPFS ou acesso síncrono requerido no Worker.
- O SAHPool está ocupado por outra aba/contexto da mesma origem; o adapter retorna `storage_busy` sem corromper nem substituir o pool.
- Bytes não representam SQLite válido ou não contêm o schema bíblico legado mínimo.
- Falha ou cancelamento durante validação, promoção do banco ou atualização do registry.
- Encerramento abrupto da aba ou do Worker entre fases da instalação; na próxima inicialização, temporários e divergências conhecidas são reconciliados em modo best-effort.
- Worker encerra com chamadas pendentes ou uma conexão permanece aberta durante reinstalação/desinstalação.
- Registry aponta para banco ausente, ou banco persistido não possui registro correspondente após uma inicialização interrompida.

## Escopo

- Dentro: adapter Web funcional; Worker RPC tipado; SQLite WASM + OPFS/SAHPool; library, registry e installer; schema legado; persistência após reabertura; instalação, reinstalação, consulta, busca, listagem e desinstalação; testes em navegador real.
- Garantia desta fatia: exception safety e reconciliação best-effort na inicialização, com estados cobertos explicitamente por testes.
- Fora: UI Astro/Next.js, service worker/PWA, download de Bíblias, Turso/sincronização, API pública remota, dados do usuário, adapter Native SDK, adapter React Native e crash-safety completa com journal durável.

## Dúvidas, decisões e riscos

- Decidido: esta é uma nova spec posterior à 0001, não uma revisão da spec concluída.
- Decidido: esta sessão termina com a spec validada e decomposta em tarefas, antes de `$specsfy-07-implement`; código, dependências e testes serão executados por outro modelo.
- Decidido: o adapter real não terá fallback em memória; ausência de capacidade é erro explícito.
- Decidido por evidência técnica: usar Worker dedicado e iniciar o desenho com `opfs-sahpool`, que não requer COOP/COEP.
- Decidido: os testes reais obrigatórios rodam em Chromium e WebKit; Firefox pode ser executado como verificação adicional sem integrar o gate inicial.
- Decidido: não haverá espera automática nem compartilhamento entre abas nesta fatia; a segunda aba falha com `storage_busy` e o consumidor decide quando tentar novamente.
- Decidido: o registry reside em um banco SQLite de controle no mesmo SAHPool, sob ownership do Worker.
- Decidido: o adapter possui URLs padrão relativas ao próprio módulo para Worker/WASM e aceita overrides; o consumidor não é obrigado a copiar assets para caminhos públicos fixos.
- Decidido: solicitar persistência do armazenamento automaticamente em best-effort, expor o resultado e não falhar quando houver negativa.
- Decidido: aplicar reconciliação best-effort equivalente em intenção à fatia Node, sem declarar journal ou recuperação determinística de todo process crash/power loss.
- Aberto: enumerar na spec os estados intermediários Web que a reconciliação consegue observar e reparar com segurança.
- Risco: `opfs-sahpool` privilegia desempenho e implantação simples, mas não oferece conexões simultâneas ao mesmo pool.

## Pronto para desenvolvimento

- [x] O problema e a pessoa beneficiada estão claros.
- [x] O evento inicial e o resultado esperado estão claros.
- [x] Permissões, regras e exceções relevantes estão claras.
- [x] O resultado pode ser verificado objetivamente.
- [x] Segurança, privacidade e desempenho foram avaliados conforme o risco.
- [x] Fora de escopo, dependências e decisões pendentes estão registrados.

## Próximo passo

Promover para uma nova spec com `$specsfy-03-specify`, mantendo a implementação reservada para outro modelo.
