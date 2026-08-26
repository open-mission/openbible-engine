# ADR 006 — ARA embarcada pelo consumidor

Data: 2026-08-26
Status: Aceita

## Decisão

A versão ARA será embarcada pelos aplicativos consumidores via empacotamento, não distribuída como conteúdo nos pacotes npm do engine. O `installVersion` recebe `Uint8Array` locais ou remotos; o bootstrap do consumidor mantém ao menos uma versão utilizável.

