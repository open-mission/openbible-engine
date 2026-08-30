# Backlog: Bounded context Personal Study offline

| Metainformação | Valor |
| --- | --- |
| ID | BACKLOG-0007 |
| Status | Promoted |
| Produto | openbible-engine |
| Épico | Bounded contexts de domínio |
| Funcionalidade | Personal Study offline |
| Tipo | Épico |
| Prioridade | Não priorizado |
| Milestones | |
| Criado em | 2026-08-29 |
| Spec promovida | `specs/completed/0007-bounded-context-personal-study-offline/spec.md` |

## Ideia original

Adicionar ao engine contratos independentes para notas, referências, destaques e categorias offline.

## Problema percebido

O engine cobre Scripture Library, mas as regras de estudo pessoal continuam no legado e acopladas ao armazenamento da aplicação.

## Pessoa afetada ou beneficiada

Usuários que criam notas e destaques e equipes Web, desktop, TUI e mobile.

## Resultado ou valor esperado

Compartilhar regras de estudo pessoal entre plataformas sem acoplar dados privados ao catálogo bíblico.

## Contexto

Bounded context separado do Scripture Library, com descoberta de domínio e dados antes de escolher adapters locais.

## Referências relacionadas

- Inbox (origem): `specs/inbox/2026-08-26-193949-bounded-context-personal-study-offline.md` — captura de origem.
- Spec relacionada (limite do Scripture Library): `specs/completed/0001-openbible-engine-scripture-library/spec.md` — Personal Study permanece separado e fora da primeira entrega.
- Spec relacionada (limite do consumer Web): `specs/completed/0004-consumer-web-pwa-de-referencia-em-next-js/spec.md` — notas e destaques estão fora do consumer atual.
- Documentação relacionada: `PROJECT.md` — Personal Study é a próxima evolução como bounded context local separado.
- Regra relacionada: `.specsfy/RULES.md` — Personal Study e Sync futuros não devem ser acoplados ao core de Scripture Library.

## Comportamento esperado

 - A primeira fatia verificável do bounded context é criar, consultar, editar e
   excluir notas vinculadas a referências de versículos.
  - Cada nota poderá apontar para um versículo individual ou para um intervalo
    contíguo de versículos.
  - O conteúdo da nota será escrito em Markdown.
  - O conteúdo Markdown deverá conter pelo menos um caractere não vazio ao criar
    ou alterar uma nota.
  - O conteúdo Markdown poderá ter no máximo 10.000 caracteres por nota.
  - O engine armazenará e devolverá o Markdown original; a renderização ficará a
    cargo de cada consumidor.
  - Os consumidores deverão renderizar somente Markdown seguro, sem HTML
    arbitrário ou scripts.
  - A exclusão de uma nota será permanente e imediata, sem recuperação local.
  - Se nenhuma Bíblia instalada conseguir resolver a referência válida, a nota
    será preservada como referência órfã e deverá sinalizar essa indisponibilidade.
  - Quando nenhuma Bíblia instalada conseguir resolver a referência, a nota
    permanecerá na lista normal com o aviso “texto bíblico indisponível”.
  - A primeira fatia não terá exportação nem importação de notas.
  - Se o armazenamento local não estiver disponível, a operação deverá informar
    erro e permitir nova tentativa, sem fallback temporário em memória.
  - Destaques e categorias ficam fora da primeira fatia, salvo decisão posterior.

## Regras de negócio

- A nota deve permanecer vinculada a uma referência de versículo individual ou
  intervalo, sem misturar seus dados ao catálogo do Scripture Library.
- O conteúdo Markdown não pode ser vazio ou composto somente por espaços.
- O conteúdo Markdown não pode ultrapassar 10.000 caracteres por nota.
- Uma referência inválida deve rejeitar a operação, sem criar ou alterar a nota.
- Uma referência válida sem Bíblia instalada que a resolva deve manter a nota
  consultável e sinalizar “texto bíblico indisponível”.
- A primeira fatia não inclui destaques nem categorias.
- Sem armazenamento local disponível, não se deve confirmar uma criação ou
  alteração como persistida nem usar memória temporária como substituto.

## Critérios de aceitação

- AC-01 — Criar e consultar nota: dado um dispositivo local e uma referência
  bíblica válida, quando a pessoa salvar uma nota com título opcional e conteúdo
  Markdown, então a nota poderá ser consultada com o mesmo conteúdo e sua
  referência.
- AC-02 — Alterar nota: dada uma nota existente, quando a pessoa alterar seu
  título ou conteúdo Markdown, então a consulta posterior exibirá a alteração e
  a data da última alteração será atualizada.
- AC-03 — Excluir nota: dada uma nota existente, quando a pessoa solicitar sua
  exclusão, então ela deixará de ser consultável permanentemente.
- AC-04 — Preservar referência órfã: dada uma nota com referência válida, quando
  nenhuma Bíblia instalada puder resolvê-la e a pessoa consultar suas notas,
  então a nota continuará na lista normal com o aviso “texto bíblico
  indisponível”.
- AC-05 — Validar conteúdo: dada uma tentativa de salvar conteúdo vazio ou com
  mais de 10.000 caracteres, quando a operação for executada, então a nota não
  será criada ou alterada.
- AC-06 — Falha de armazenamento: dado que o armazenamento local esteja
  indisponível, quando a pessoa criar ou alterar uma nota, então a operação
  informará erro e permitirá nova tentativa sem confirmar persistência em
  memória.
- AC-07 — Exibição segura: dado conteúdo Markdown com HTML arbitrário ou script,
  quando um consumidor renderizar a nota, então HTML e scripts não autorizados
  não serão executados ou exibidos como conteúdo ativo.

## Qualidades e operação

- Segurança: o engine devolve Markdown original; consumidores renderizam apenas
  Markdown seguro, sem HTML arbitrário ou scripts.
- Privacidade: ownership anônimo e local; sem conta, compartilhamento ou
  exportação na primeira fatia; exclusão permanente sob solicitação explícita.
- Desempenho e volume: cada nota tem limite de 10.000 caracteres; o volume total
  de notas ainda precisa ser definido.
- Auditoria e observabilidade: registrar datas de criação e alteração; demais
  sinais operacionais ainda precisam ser definidos.

## Dependências

- Contratos de referência do Scripture Library para livro, capítulo e
  versículo(s), sem acoplamento dos dados de estudo ao catálogo.
- Uma forma de armazenamento local offline, a definir antes da implementação.

## Situações de erro

- Referência inválida, conteúdo vazio ou acima de 10.000 caracteres devem ser
  rejeitados; armazenamento indisponível deve gerar erro recuperável sem
  fallback em memória.

## Escopo

- Dentro: notas vinculadas a referências de versículos e seus ciclos básicos de
  criação, consulta, edição e exclusão, em armazenamento local offline; título
  opcional, conteúdo Markdown, datas e referência por livro/capítulo/versículo(s)
  sem versão específica.
- Fora: destaques, categorias, sincronização multidispositivo, identidade
  remota, autenticação, exportação/importação e adapters específicos, até
  definição posterior.

## Dúvidas, decisões e riscos

- Decidido: a primeira fatia será composta por notas vinculadas a referências de
  versículos.
- Decidido: a referência aceita versículo individual ou intervalo contíguo.
- Decidido: o conteúdo da nota usará Markdown.
- Decidido: o conteúdo Markdown é obrigatório e deve conter pelo menos um
  caractere não vazio na criação e na alteração.
- Decidido: o conteúdo Markdown tem limite de 10.000 caracteres por nota.
- Decidido: consumidores renderizam somente Markdown seguro, sem HTML arbitrário
  ou scripts; o engine preserva o Markdown original.
- Decidido: referência inválida rejeita a operação, sem criar ou alterar a nota.
- Decidido: quando nenhuma Bíblia instalada resolver uma referência válida, a
  nota permanece na lista normal com o aviso “texto bíblico indisponível”.
- Decidido: armazenamento local indisponível gera erro com nova tentativa e não
  usa fallback temporário em memória.
- Decidido: o engine preserva e devolve o Markdown original, sem renderizá-lo.
- Decidido: a exclusão é permanente e imediata, sem lixeira ou recuperação.
- Decidido: notas cuja referência válida não possa ser resolvida por nenhuma
  Bíblia instalada permanecem preservadas como referências órfãs e sinalizam a
  indisponibilidade.
- Decidido: exportação e importação ficam fora da primeira fatia.
- Decidido: o ownership da primeira fatia é anônimo e local à instalação ou ao
  dispositivo, sem conta e sem autenticação remota.
- Decidido: não há identidade de usuário nesta primeira fatia; a instalação ou
  o dispositivo é o limite de ownership local.
- Aberto: volume total de notas, política operacional e formato persistente da
  nota e da referência.

## Registros da descoberta

- Pergunta 1 — Primeira fatia: notas vinculadas a referências de versículos.
- Pergunta 2 — Ownership: instalação/dispositivo local anônimo, sem conta.
- Pergunta 3 — Referência: versículo individual ou intervalo contíguo.
- Pergunta 4 — Conteúdo: Markdown.
- Pergunta 5 — Contrato Markdown: engine preserva e devolve o original; cada
  consumidor renderiza.
- Pergunta 6 — Exclusão: permanente e imediata.
- Pergunta 7 — Bíblia indisponível: preservar a nota como referência órfã e
  sinalizar a indisponibilidade.
- Pergunta 8 — Exportação: fora da primeira fatia.
- Descoberta de dados — Nota: título opcional, Markdown original, referência
  sem versão específica, datas de criação/alteração, ownership local, exclusão
  permanente e preservação como órfã; confirmado em `.specsfy/DATABASE.md`.
- Nova rodada autorizada: 3 perguntas adicionais; pergunta 1 respondida:
  conteúdo Markdown não vazio na criação e na alteração.
- Pergunta 2 da rodada adicional: limite de 10.000 caracteres por nota.
- Pergunta 3 da rodada adicional: armazenamento indisponível gera erro
  recuperável, sem fallback em memória.
- Nova rodada autorizada: 3 perguntas adicionais.
- Pergunta 1 da nova rodada: referência inválida rejeita a operação, sem criar
  ou alterar a nota.
- Pergunta 2 da nova rodada: referência válida sem Bíblia instalada que a
  resolva permanece na lista normal com aviso de texto bíblico indisponível.
- Pergunta 3 da nova rodada: consumidores renderizam apenas Markdown seguro,
  sem HTML arbitrário ou scripts.
- Spec promovida: `specs/draft/0007-bounded-context-personal-study-offline/spec.md`;
  Definition Gate permanece `Pending`.

## Pronto para desenvolvimento

- [x] O problema e a pessoa beneficiada estão claros.
- [x] O evento inicial e o resultado esperado estão claros.
- [x] Permissões, regras e exceções relevantes estão claras.
- [x] O resultado pode ser verificado objetivamente.
- [ ] Segurança, privacidade e desempenho foram avaliados conforme o risco.
- [x] Fora de escopo, dependências e decisões pendentes estão registrados.

## Próximo passo

Spec definida em `specs/defined/0007-bounded-context-personal-study-offline/spec.md`;
seguir para `$specsfy-05-tasks` para planejar a seção 14.
