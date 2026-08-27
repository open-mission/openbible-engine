# SQLite WASM OPFS/SAHPool — notas de pesquisa

## Fonte

- Origem: SQLite Project, documentação oficial de SQLite WASM.
- URL: https://www.sqlite.org/wasm/doc/trunk/persistence.md
- Consultada em: 2026-08-26.
- Versão: documentação `trunk`; SAHPool disponível desde SQLite 3.43 e APIs de pausa citadas desde 3.50.
- Licença: não foi copiado conteúdo da documentação; este arquivo contém somente síntese própria e metadados.

## R-SQLITE-001 — disponibilidade e isolamento

O VFS `opfs-sahpool` funciona somente em Worker, não exige `SharedArrayBuffer` nem cabeçalhos COOP/COEP e usa diretório privado por origem. A documentação informa suporte às APIs necessárias nos navegadores principais lançados desde março de 2023. Caminhos lógicos precisam ser absolutos.

Impacto: o adapter deve criar um Worker dedicado, verificar capabilities durante a inicialização, usar um nome/diretório estável e manter todas as conexões dentro do Worker.

## R-SQLITE-002 — concorrência

Uma instância do SAHPool adquire antecipadamente os `SyncAccessHandle`s. Duas instâncias com o mesmo diretório não podem inicializar simultaneamente. APIs recentes de pausa permitem coordenação cooperativa, mas exigem protocolo entre contextos e fechamento prévio de handles.

Impacto: a primeira fatia não implementará coordenação entre abas; colisão de ownership será mapeada para `storage_busy`.

## R-SQLITE-003 — administração do pool

`PoolUtil` expõe `getFileNames`, `importDb`, `exportFile`, `unlink`, `addCapacity` e `reserveMinimumCapacity`. `importDb` substitui um nome lógico existente, mas seu resultado é indefinido quando o banco está aberto. Não há operação pública de rename no inventário documentado. A capacidade precisa considerar bancos, journals e arquivos intermediários.

Impacto: library, registry e installer devem fechar handles antes de importar, substituir ou remover. A instalação exception-safe deve materializar temporário e backup como bancos lógicos separados por `importDb`/`exportFile`, sem alegar rename atômico. O adapter deve reservar capacidade antes da operação e tornar o mínimo configurável.

## R-SQLITE-004 — limite da garantia

Como a promoção é uma sequência de cópia/importação, remoção e atualização do registry, uma interrupção abrupta pode deixar combinações de `final`, `backup`, `trash`, `temporary` e registro. Sem journal por operação, alguns estados são ambíguos.

Impacto: declarar apenas exception safety e reconciliação best-effort. A heurística escolhida preserva a versão anterior quando existe backup, remove primeira instalação sem registro, restaura trash quando o registro ainda existe, descarta trash quando o registro já foi removido e remove temporários abandonados.

## R-SQLITE-005 — conformance OPFS no WebKit Linux (Playwright)

O VFS `opfs-sahpool` exige as APIs OPFS síncronas (`FileSystemSyncAccessHandle` e `navigator.storage.getDirectory` em contexto de Worker). A build de WebKit distribuída pelo Playwright para **Linux** (motor WPE/MiniBrowser) não expõe essas APIs: `installOpfsSAHPoolVfs` lança `Missing required OPFS APIs` e o adapter reporta `storage_unavailable`/`capabilities.opfs=false` — comportamento correto (capability ausente), mas inviabiliza conformance real de OPFS nessa runtime. As libs de sistema (ICU/libxml2/flite/WPE) foram resolvidas via Podman com a imagem oficial do Playwright; mesmo assim a API OPFS não existe.

Impacto: a conformance WebKit do adapter OPFS/SAHPool **não pode ser executada via Playwright em Linux**; ela exigiria Safari/macOS real (onde o SAHPool é suportado). Decisão da sessão: Chromium permanece como navegador bloqueante na CI; WebKit é registrado como não executável nessa runtime de teste (ver NFR-002 e Gate do Ato III no `spec.md`).
