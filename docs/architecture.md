# Arquitetura

<!-- specsfy:documentator:start -->
## Componentes

| Tipo | Quantidade |
| --- | --- |
| Código | 336 |
| Testes | 91 |

## Diagramas

```mermaid
flowchart TD
  Application[Aplicação]
```

```mermaid
classDiagram
  class Application
```
<!-- specsfy:documentator:end -->

## Consumer Native

- `apps/consumer-native/src/core.ts` mantém `Model`, `Msg` e `update` síncronos e
  determinísticos. I/O é disparado por `Cmd`/`Msg`; o core não importa Node,
  DOM, services ou SQLite.
- `apps/consumer-native/src/app.native` compõe uma janela GPU única com as áreas
  Biblioteca, Leitor e Busca. O service `child` conecta os comandos ao adapter.
- `@openbible/adapter-sqlite-native` depende somente de exports públicos da
  engine e usa parser legado read-only sobre bytes da `NativeStorage`. A
  aquisição Native também é uma capacidade do adapter: ranges recebidos pelo
  service são staged sequencialmente antes de chamar o commit local.

```mermaid
flowchart LR
  Markup[Native markup] -->|Msg| Core[Model / Msg / update]
  Core -->|Cmd| Service[Native child service]
  Service --> Adapter[adapter-sqlite-native]
  Adapter --> Storage[NativeStorage namespace]
  Service -. Range fetch .-> R2[R2 public bucket]
```

```mermaid
classDiagram
  class Model
  class Msg
  class NativeService
  class NativeStorage
  class NativeInstaller
  Model --> Msg
  Msg --> NativeService
  NativeService --> NativeInstaller
  NativeInstaller --> NativeStorage
```

Host status is recorded in `apps/consumer-native/native-sdk-matrix.json`:
Linux passed the Native check/test/build path with GPU/software, while macOS and
Windows remain `unverified`; strict doctor is blocked by missing WebKitGTK 6.0.
