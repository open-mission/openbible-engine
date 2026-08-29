# Decisões técnicas

<!-- specsfy:documentator:start -->
## Política

Decisões explícitas em `PROJECT.md` e `.specsfy/` prevalecem sobre inferências deste documento.
<!-- specsfy:documentator:end -->

## SPEC-0005

- Native SDK is a replaceable consumer, not a dependency of the engine core.
- The selected seam is synchronous logical filesystem plus a pure TypeScript
  reader for the constrained legacy SQLite schema; public async ports remain
  adapted at the `Cmd`/`Msg` boundary.
- A single Native markup window is sufficient for the minimum human journey;
  host support is limited to the claims recorded in the SDK matrix.
- R2 acquisition belongs to the Native adapter/service seam rather than the
  engine core or markup: the core only emits bounded range effects, while the
  adapter owns sequential staging and delegates the final validation/commit
  semantics without retaining the complete package in `Model`.
