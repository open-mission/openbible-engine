# Integrações

<!-- specsfy:documentator:start -->
## Configuração

Valores de ambiente e integrações são documentados apenas pelos nomes declarados localmente, sem segredos.
<!-- specsfy:documentator:end -->

## Native SDK

The integration is local-first: Native markup sends named `Cmd`/`Msg` operations
to a `child` service, which supplies filesystem access to
`@openbible/adapter-sqlite-native`. Explicit installation maps `ara` and `nvi`
to the public R2 files and uses bounded `Range` requests; reading, searching
and removing installed versions remain local. The pinned CLI is Native SDK
`0.10.1` at revision `064ca9890cc0cf8adc198215bd0ddaeb586c220a`.

The network permission is used only by the explicit installation path. The
Native consumer proof and all local operations do not require a remote database.
Linux execution uses the software GPU path. macOS and Windows are not verified,
and `native doctor --strict` reports missing WebKitGTK 6.0 on Linux.
