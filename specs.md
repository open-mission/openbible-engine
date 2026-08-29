# Índice de specs

<!-- specsfy:specs-index:start -->
## Sequência e estado

| Ordem | Spec | Estado | Milestones |
| --- | --- | --- | --- |
| 01 | 0001-openbible-engine-scripture-library | Complete | M01 |
| 02 | 0002-adapter-web-sqlite-offline-com-opfs | Complete | M01 |
| 03 | 0003-distribuicao-versionada-e-estabilidade-da-api-publica | Complete | — |
| 04 | 0005-adapter-native-sdk-e-consumer-desktop-minimo | Complete | — |
| 05 | 0006-migracao-da-tui-para-consumir-openbible-engine | Complete | — |
| 06 | 0004-consumer-web-pwa-de-referencia-em-next-js | Implementing | — |

## Marcos

- M01: 2/2 specs concluídas (100%).
<!-- specsfy:specs-index:end -->

## Próximas specs candidatas

Esta sequência é um roadmap de descoberta, não uma autorização de implementação.
Cada item permanece na Inbox até passar por `$specsfy-02-backlog` e
`$specsfy-03-specify`.

| Ordem sugerida | Capacidade candidata | Dependência principal | Fonte |
| --- | --- | --- | --- |
| 03 | Distribuição versionada e estabilidade da API pública | M01 concluído tecnicamente | `specs/inbox/2026-08-26-193947-distribuicao-versionada-e-estabilidade-da-api-publica.md` |
| 04 | Consumer Web/PWA de referência em Astro ou Next.js | 03; escolha do framework | `specs/inbox/2026-08-26-193948-consumer-web-pwa-de-referencia-em-astro-ou-next-js.md` |
| 05 | Adapter Native SDK e consumer desktop mínimo | 03; pesquisa do runtime/driver | `specs/inbox/2026-08-26-193948-adapter-native-sdk-e-consumer-desktop-minimo.md` |
| 06 | Migração da TUI para consumir o engine | 03; decisão Node/Bun | `specs/inbox/2026-08-26-193948-migracao-da-tui-para-consumir-openbible-engine.md` |
| 07 | Bounded context Personal Study offline | contratos locais estabilizados | `specs/inbox/2026-08-26-193949-bounded-context-personal-study-offline.md` |
| 08 | Sync multidispositivo offline-first com Turso | 07; identidade e conflitos | `specs/inbox/2026-08-26-193950-sincronizacao-multidispositivo-offline-first-com-turso.md` |
| 09 | API pública versionada de dados bíblicos | licenciamento e contrato remoto | `specs/inbox/2026-08-26-193950-api-publica-versionada-de-dados-biblicos.md` |
| 10 | Adapter e consumer React Native offline | 03; aprendizado Web/Native; decisão mobile | `specs/inbox/2026-08-26-193950-adapter-e-consumer-react-native-offline.md` |
| 11 | Journal durável para crash-safety completa | evidência de necessidade ou preparação para 1.0 | `specs/inbox/2026-08-26-193950-journal-duravel-para-crash-safety-completa.md` |

### Agrupamento candidato de milestones

- **M02 — Engine consumível**: 03, 04, 05 e 06; prova packages e consumidores reais antes de estabilizar 1.0.
- **M03 — Estudo pessoal local**: 07; adiciona o bounded context sem rede obrigatória.
- **M04 — Serviços conectados opcionais**: 08 e 09; separa sync privado de API bíblica pública.
- **M05 — Mobile nativo**: 10; entra depois do aprendizado da PWA e do Native SDK.
- **Hardening transversal**: 11; pode entrar antes do 1.0 se os requisitos de durabilidade justificarem.

Os IDs M02–M05 são propostas. Só devem virar arquivos em `specs/milestones/`
depois que objetivo, condição de saída e ordem forem confirmados durante o
refinamento do roadmap.
