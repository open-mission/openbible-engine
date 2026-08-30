# Evidência Better Auth

Data de acesso: 2026-08-29
Versão consultada: Better Auth 1.7.2, conforme `npm view better-auth version`.
Licença/conteúdo: somente metadados e síntese própria; nenhum trecho extenso da
documentação foi copiado.

## Next.js integration

Fonte: https://better-auth.com/docs/integrations/next

A documentação descreve a montagem do handler Better Auth em uma rota
`/api/auth/[...all]` do App Router por meio de `toNextJsHandler(auth)`. Também
descreve `createAuthClient` e a consulta server-side de sessão.

Impacto: o consumer web atual usa Next.js 15 App Router, portanto pode hospedar
a borda de autenticação sem importar Better Auth para os packages portáveis do
bounded context Sync. A rota protegida deve validar a sessão no servidor.

## Device authorization

Fonte: https://better-auth.com/docs/plugins/device-authorization

O plugin implementa o fluxo OAuth 2.0 Device Authorization com código de usuário,
URL de verificação, aprovação explícita e polling. O fluxo pode devolver uma
sessão Better Auth para um dispositivo first-party. A documentação exige HTTPS,
aprovação explícita e exibição do que está sendo autorizado.

Impacto: o plugin pode reduzir o trabalho do ingresso por código ou QR na conta,
mas não fornece o registro de dispositivos confiáveis nem a transferência e a
rotação das chaves privadas das notas.

## Session and bearer tokens

Fontes:

- https://better-auth.com/docs/concepts/session-management
- https://better-auth.com/docs/plugins/multi-session
- https://better-auth.com/docs/plugins/bearer

Better Auth mantém sessões server-side, permite listar e revogar sessões de
dispositivos e oferece autenticação Bearer para APIs que não usam cookies. A
revogação de sessão não apaga automaticamente cópias locais nem equivale à
revogação criptográfica de um dispositivo do Sync.

Impacto: o consumer/API pode fornecer uma credencial válida ao Sync e obter o
`accountId` da sessão server-side, sem expor tipos do SDK de autenticação no
contrato portátil.

## Expo

Fonte: https://better-auth.com/docs/integrations/expo

A integração Expo usa `@better-auth/expo` e armazenamento seguro para cookies e
estado de sessão em um cliente nativo.

Impacto: a escolha não bloqueia o futuro consumer mobile, mas Expo não é uma
dependência desta primeira entrega.
