# Backlog: Migração da TUI para consumir openbible-engine

| Metainformação | Valor |
| --- | --- |
| ID | BACKLOG-0006 |
| Status | Promoted |
| Produto | openbible-engine |
| Épico | M02 — Engine consumível |
| Funcionalidade | Consumer TUI baseado no engine |
| Tipo | Técnico |
| Prioridade | Alta — próximo consumidor real do M02 |
| Milestones | M02 (proposto) |
| Criado em | 2026-08-28 |
| Spec promovida | `specs/draft/0006-migracao-da-tui-para-consumir-openbible-engine/spec.md` |

## Ideia original

Migrar a TUI legada para usar parser, ports e adapter oficial do engine pelo padrão strangler, preservando a interface e avançando uma jornada por vez.

## Problema percebido

A TUI mantém parsing e persistência próprios; o adapter Node é comprovado em Node.js, mas a compatibilidade com Bun não foi afirmada.

## Pessoa afetada ou beneficiada

Equipe da TUI OpenTUI e usuários de terminal.

## Resultado ou valor esperado

Eliminar duplicação de regras e provar um segundo consumidor real mantendo rollback incremental.

## Contexto

A migração deve começar pela decisão de runtime e driver (Node ou Bun) e por um slice de leitura e busca, sem alterar o projeto legado.

## Referências relacionadas

- Inbox de origem: `specs/inbox/2026-08-26-193948-migracao-da-tui-para-consumir-openbible-engine.md`.
- Precedente de contratos e parser: `specs/completed/0001-openbible-engine-scripture-library/spec.md`.
- Precedente de distribuição e exports: `specs/completed/0003-distribuicao-versionada-e-estabilidade-da-api-publica/spec.md`.
- Precedente de consumer Native e estados de UI: `specs/completed/0005-adapter-native-sdk-e-consumer-desktop-minimo/spec.md`.
- Contexto de produto e roadmap: `PROJECT.md`.
- Regras de fronteira e runtime do adapter: `.specsfy/RULES.md` e `.specsfy/STACK.md`.
- Implementação legada somente para leitura: `/home/claudio/Projects/open-bible/apps/tui/package.json`, `src/lib/parse-reference.ts`, `src/db/bible-manager.ts`, `src/db/installed-store.ts`, `src/db/sqlite.ts`, `src/services/bible-service.ts`, `src/services/download.ts` e `src/ui/app.tsx`.
- Decisões arquiteturais: `docs/adr/001-typescript-portatil-em-vez-de-rust.md` e `docs/adr/009-migracao-strangler-futura.md`.

## Comportamento esperado

- Um consumer TUI privado dentro do monorepo executa em Node.js 22+ e usa a engine e os adapters somente por exports públicos.
- A pessoa configura uma origem remota e escolhe uma versão disponível; o consumer usa `@openbible/adapter-http` para adquirir o pacote e `@openbible/adapter-sqlite-node` para instalar a Bíblia em namespace isolado.
- Após a instalação, a TUI lista as versões instaladas, permite selecionar livro e capítulo, abrir referências, ler versículos ordenados, buscar na versão selecionada e remover a versão.
- Depois do download e commit, listagem, leitura, parsing, busca e remoção não fazem chamadas de rede e continuam funcionando quando a rede fica indisponível.
- A interface conserva a jornada e os atalhos atuais da TUI, com simplificações visuais permitidas, sem copiar regras de domínio ou persistência do legado.
- Uma falha de aquisição, validação, instalação, cancelamento ou remoção apresenta feedback recuperável, preserva o estado anterior e não deixa artefatos parciais no namespace isolado.

## Regras de negócio

- `engine-core` e `engine` permanecem puros; parser, ordenação, leitura, busca, instalação e remoção são delegados aos contratos públicos da engine e dos adapters.
- O runtime-alvo da primeira fatia é Node.js 22+; Bun não é requisito desta entrega.
- O consumer não importa `src/` interno, não altera `/home/claudio/Projects/open-bible` e não acessa o namespace de armazenamento da TUI legada.
- A rede é permitida somente na aquisição remota; operações sobre dados já instalados são locais e offline-first.
- A versão só aparece como instalada depois de validação e commit completos; falha ou cancelamento preserva a versão anterior e remove temporários.
- IDs, caminhos lógicos, referências e limites seguem as validações e os códigos de erro estáveis do engine.
- A Bíblia real e credenciais não entram no repositório; testes usam doubles/fixtures controladas, e a origem remota é configurável.
- A UI mantém os atalhos `Tab`, setas, `Enter`, `n/p`, `d/D`, `:`, `h`, `Esc`, `b`, `?` e `q`, bloqueando ações incompatíveis durante operações.

## Critérios de aceitação

- **AC-001 — Aquisição e instalação**: Given uma origem remota configurada e uma versão disponível, When a pessoa solicita o download, Then o pacote é validado e instalado pelo engine no namespace isolado, sem registro parcial.
- **AC-002 — Falha remota**: Given uma origem indisponível ou um pacote inválido, When a pessoa tenta instalar, Then a TUI mostra erro recuperável, não promove dados parciais e preserva a versão anterior.
- **AC-003 — Biblioteca instalada**: Given uma versão instalada, When a pessoa abre a Biblioteca, Then a versão e seu estado aparecem pelo registry do engine, sem leitura direta do registry legado.
- **AC-004 — Leitura**: Given uma versão instalada, When a pessoa seleciona livro e capítulo, Then os versículos são obtidos pelos contratos públicos e aparecem em ordem canônica.
- **AC-005 — Referência**: Given uma versão instalada, When a pessoa informa uma referência válida usando os atalhos atuais, Then o parser do engine seleciona livro/capítulo/versículo; referência inválida gera erro tipado e orientação.
- **AC-006 — Busca**: Given uma versão instalada, When a pessoa informa um termo, Then a busca usa a engine, respeita o limite configurado e apresenta resultados com origem e contexto; termo vazio mostra estado orientativo.
- **AC-007 — Remoção**: Given uma versão instalada, When a pessoa solicita remoção, Then a versão deixa de aparecer como instalada e seus artefatos do namespace isolado são removidos sem afetar outras versões.
- **AC-008 — Offline após instalação**: Given uma versão instalada por download, When a rede é removida, Then Biblioteca, Leitor, referências, busca e remoção continuam funcionando sem nova chamada de rede.
- **AC-009 — Atalhos e estados**: Given a TUI aberta, When a pessoa usa os atalhos preservados, Then a navegação entre versões, livros, capítulos e versículos funciona e os estados carregando, vazio, erro, sucesso e operação bloqueada são comunicados.
- **AC-010 — Fronteira e legado**: Given o consumer executado no monorepo, When a conformance é executada, Then somente exports públicos são importados, o core não ganha dependências de plataforma e o projeto legado permanece inalterado.

## Qualidades e operação

- Segurança: IDs e nomes de versão são validados antes de formar caminhos lógicos; erros da UI não expõem paths físicos, SQL, credenciais ou stack traces; nenhum `.env` ou banco real é versionado.
- Privacidade: bancos e registry ficam no namespace local isolado do consumer; não há sincronização, conta ou envio de dados pessoais nesta fatia.
- Desempenho e volume: leitura e busca usam limites dos contratos, não copiam o banco inteiro para a UI e não fazem rede durante operações locais; a matriz quantitativa será definida na spec se a spike revelar necessidade.
- Acessibilidade: ações por teclado, foco previsível, labels claros e estados de erro/operação comunicados; a validação cobre conteúdo curto/longo e operações bloqueadas.
- Auditoria e observabilidade: comandos, versão do runtime, capacidade OpenTUI/Node, origem configurada, resultados de conformance e decisão sobre o driver ficam registrados na spec e na documentação técnica.
- Operação: build, typecheck, lint, testes Vitest, smoke do consumer e conformance do runtime passam no monorepo; plataformas não verificadas não são declaradas suportadas.

## Dependências

- `@openbible/engine` e `@openbible/engine-core` — ports, contratos, parser e casos de uso.
- `@openbible/adapter-sqlite-node` — armazenamento SQLite local e instalação exception-safe no runtime Node.js.
- `@openbible/adapter-http` — catálogo e aquisição remota configuráveis.
- `@openbible/engine-testing` — fixtures sintéticas, fakes e contract suite para testes do consumer.
- Node.js 22+, TypeScript strict ESM, pnpm/Turborepo, Vitest e toolchain OpenTUI compatível com o alvo Node.
- M02 proposto e as specs 0001, 0002, 0003 e 0005 como precedentes/contratos; a conclusão da SPEC-0004 é recomendada para completar a prova de consumidores Web antes do fechamento do marco.

## Situações de erro

- Runtime Node/OpenTUI ou driver SQLite incompatível → registrar a capacidade ausente, bloquear a declaração de suporte e avaliar alternativa atrás das mesmas ports.
- Origem remota ausente, indisponível ou com resposta inválida → `network_unavailable` ou erro tipado equivalente, sem alterar armazenamento local.
- Pacote sem header/schema/identidade válidos → `invalid_package` ou `unsupported_schema`, sem registro ou arquivo utilizável.
- Cancelamento ou falha após qualquer etapa de instalação → rollback/cleanup, preservação da versão anterior e ausência de parcial.
- Versão não instalada, referência inválida, busca vazia ou limite excedido → códigos estáveis traduzidos pela TUI e orientação contextual.
- Falha de leitura, remoção ou armazenamento indisponível → estado de erro com retry quando recuperável, sem encerrar silenciosamente a aplicação.
- Ação concorrente durante instalação/remoção → ação incompatível bloqueada até a operação terminar.

## Escopo

- Dentro: spike de compatibilidade OpenTUI/Node; novo consumer TUI privado no monorepo; integração com `@openbible/engine`, `@openbible/adapter-http` e `@openbible/adapter-sqlite-node`; origem remota configurável; namespace local isolado; instalação, listagem, leitura, referência, busca e remoção offline; atalhos atuais; estados operacionais; testes, conformance e documentação.
- Fora: alteração, migração ou leitura direta do projeto legado; reutilização do registry/bancos legados; compatibilidade Bun; banco bíblico real no repositório; Personal Study; Sync/Turso; API pública; React Native; publicação npm; suporte a plataformas não comprovadas; substituição completa da TUI legada em produção.

## Dúvidas, decisões e riscos

- **Decisão confirmada no refinamento — Pergunta 1**: Node.js 22+ é o runtime-alvo da primeira fatia. O adapter `@openbible/adapter-sqlite-node` será reutilizado; Bun permanece fora do requisito inicial.
- **Efeito**: a migração precisa preservar a UI OpenTUI, mas adaptar a execução e os acessos à persistência para os contratos públicos do engine no runtime Node.js escolhido.
- **Risco**: a UI e os testes legados usam dependências e scripts orientados a Bun; a compatibilidade efetiva do OpenTUI no alvo Node.js deve ser verificada antes da implementação.
- **Decisão confirmada no refinamento — Pergunta 2**: a primeira fatia será um fluxo ponta a ponta: instalar uma versão, listar livros, ler capítulo, buscar e remover offline.
- **Efeito**: a prova precisa cobrir a integração do consumer com os exports públicos da engine, o ciclo completo do adapter e a preservação da jornada TUI em uma fatia única.
- **Decisão confirmada no refinamento — Pergunta 3**: a primeira fatia usará um namespace de armazenamento isolado, sem ler, copiar ou alterar os dados existentes da TUI.
- **Efeito**: o consumer deverá operar com fixture sintética ou aquisição explicitamente controlada no namespace do engine; o legado permanece disponível para rollback e comparação.
- **Decisão confirmada no refinamento — Pergunta 4**: a primeira prova viverá em um novo app privado dentro deste monorepo, sem alterar `/home/claudio/Projects/open-bible`.
- **Efeito**: a integração será validada em uma fronteira substituível, com o legado preservado como referência de comportamento e rollback.
- **Decisão confirmada no refinamento — Pergunta 5**: a primeira prova manterá a jornada e os atalhos essenciais da TUI, permitindo simplificar detalhes visuais sem copiar a implementação legada.
- **Efeito**: a UI deverá cobrir Biblioteca, Leitor e Busca, incluindo feedbacks operacionais, mas a lógica continuará delegada às ports e à engine.
- **Decisão confirmada no refinamento — Pergunta 6**: a instalação usará um download remoto configurável.
- **Efeito**: a rede participa somente da aquisição; após o commit, listagem, leitura, busca e remoção devem operar localmente. Falhas de rede devem retornar erro tipado sem deixar estado parcial.
- **Risco**: a conformance de aquisição depende de ambiente ou double de transporte controlado; operações locais offline precisam ser verificadas separadamente.
- **Decisão confirmada no refinamento — Pergunta 7**: a nova TUI preservará os atalhos atuais `Tab`, setas, `Enter`, `n/p`, `d/D`, `:`, `h`, `Esc`, `b`, `?` e `q`.
- **Efeito**: o consumer deverá manter o modelo de navegação e as ações essenciais observáveis, sem reutilizar a implementação interna da UI legada.
- **Decisão confirmada no refinamento — Pergunta 8**: a origem remota será consumida pelo adapter HTTP oficial, com URLs configuráveis para catálogo e pacotes.
- **Efeito**: o consumer não implementará fetch, mapeamento de versões ou fallback próprio; a indisponibilidade remota será tratada na fronteira do adapter.
- **Risco técnico a validar na especificação**: o OpenTUI atual declara scripts para Bun e Node, mas a execução efetiva no Node.js 22+ deve ser comprovada antes da implementação.

## Pronto para desenvolvimento

- [x] O problema e a pessoa beneficiada estão claros.
- [x] O evento inicial e o resultado esperado estão claros.
- [x] Permissões, regras e exceções relevantes estão claras.
- [x] O resultado pode ser verificado objetivamente.
- [x] Segurança, privacidade e desempenho foram avaliados conforme o risco.
- [x] Fora de escopo, dependências e decisões pendentes estão registrados.

## Próximo passo

Promovido para `specs/draft/0006-migracao-da-tui-para-consumir-openbible-engine/spec.md` com `$specsfy-03-specify`. A spec inicia pela spike de compatibilidade OpenTUI/Node e mantém `Definition Gate: Pending` até a validação formal.
