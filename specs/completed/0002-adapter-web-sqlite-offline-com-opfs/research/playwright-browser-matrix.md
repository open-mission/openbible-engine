# Playwright — matriz de navegador real

## Fonte

- Origem: Microsoft Playwright, documentação oficial.
- URL: https://playwright.dev/docs/browsers
- Consultada em: 2026-08-26.
- Versão: documentação estável corrente; os binários exatos são fixados pela versão do package/lockfile.
- Licença: não foi copiado conteúdo da documentação; este arquivo contém somente síntese própria e metadados.

## R-PLAYWRIGHT-001 — projetos de navegador

Playwright executa projetos separados com Chromium, Firefox e WebKit e fixa binários compatíveis com a versão instalada.

Impacto: a conformance Web terá projetos obrigatórios Chromium e WebKit. Firefox poderá existir como job informativo sem bloquear a entrega inicial.

## R-PLAYWRIGHT-002 — reprodutibilidade

Os binários de browser precisam ser instalados para a versão de Playwright registrada no lockfile; atualização do package pode exigir nova instalação dos binários.

Impacto: CI deve instalar somente os browsers obrigatórios e suas dependências, reutilizar o lockfile e publicar logs/resultados de falha sem incluir bancos reais ou segredos.
