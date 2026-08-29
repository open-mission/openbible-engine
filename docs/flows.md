# Fluxos

<!-- specsfy:documentator:start -->
## Fluxo principal

```mermaid
flowchart LR
  Entrada --> Aplicação --> Saída
```

```mermaid
sequenceDiagram
  participant Cliente
  participant Aplicação
  Cliente->>Aplicação: requisição
```
<!-- specsfy:documentator:end -->

## Native Scripture journey

```mermaid
flowchart LR
  Start[Open app] --> Library[Biblioteca]
  Library -->|Install| Fetch[GET R2 ranges]
  Fetch --> Stage[Stage sequential part]
  Stage --> Install[Validate and promote package]
  Install --> Library
  Library --> Reader[Leitor]
  Library --> Search[Busca]
  Reader -->|Next / previous| Reader
  Search -->|Open result| Reader
  Library -->|Remove| Remove[Trash, registry update, cleanup]
```

```mermaid
sequenceDiagram
  participant View as Native markup
  participant Core as Model/update
  participant Cmd as Cmd/Msg client
  participant Service as Native child service
  participant Adapter as Native adapter
  participant Store as NativeStorage
  View->>Core: press tab or action
  Core->>Cmd: emit command
  Cmd->>Service: named operation
  Service->>Adapter: fetch chunk staging or local operation
  Adapter->>Store: append logical package part
  Adapter->>Adapter: validate and commit only after final chunk
  Adapter->>Store: logical file operations
  Store-->>Adapter: bytes or mutation result
  Adapter-->>Service: serializable result
  Service-->>Core: Msg
  Core-->>View: updated Model
```

The automated proof covers installation, removal, reopen, chapter navigation,
keyboard search, empty query and zero results. It was run at `1080x720` and the
minimum `720x520` window size.
