# Arquitetura — padrão Controller

## Princípio central

Nenhum `.tsx` de página ou componente com estado/lógica não-trivial contém
essa lógica diretamente. Ela mora num hook `use<Nome>Controller.ts`
co-localizado no mesmo diretório. O `.tsx` importa o controller, recebe o
que precisa (estado, handlers, dados derivados) e só renderiza.

Isso já é o padrão usado em `view/pages/GroupDetail`:

```
GroupDetail/
  components/
    GroupActionsMenu/
      index.tsx
      useGroupActionsController.ts
    GroupLayout/
      index.tsx
      useGroupLayoutController.ts
    CreateMatchModal/
    InviteLinkModal/
    TransferOwnershipDialog/
  index.tsx
  useGroupDetailController.ts
```

Cada peça de UI com responsabilidade própria (menu de ações, layout, a
página em si) tem seu controller irmão. `index.tsx` é sempre o ponto de
entrada da página.

## O que vai no controller

- Chamadas de API (via TanStack Query) e tratamento de erro/loading
- Estado local (`useState`, `useReducer`) e derivações desse estado
- Handlers de evento com alguma lógica (validação, decisão condicional,
  transformação de dado antes de enviar)
- Navegação condicional (`useNavigate` com lógica de quando navegar)

## O que fica no `.tsx`

- JSX puro
- Desestruturação do retorno do controller
- Repasse de props para componentes filhos
- Nenhuma chamada de API, nenhum `useState` de dado de negócio, nenhuma
  regra condicional de negócio direto no corpo do componente

Um `useState` de UI pura (aberto/fechado de um dropdown puramente visual,
sem nenhuma regra de negócio atrelada) pode ficar no `.tsx` se for
genuinamente trivial e não tiver nenhuma lógica além de alternar um boolean.
Na dúvida, extrai pro controller mesmo assim — errar pro lado de extrair é
mais seguro que deixar lógica se acumular no componente aos poucos.

## Regra: pasta `components/` dentro de cada página

Toda página em `view/pages/<NomeDaPagina>/` que tiver componente usado
**só dentro daquela página** vai para `view/pages/<NomeDaPagina>/components/`
— nunca solto ao lado do `index.tsx`. Isso vale pra qualquer componente de
página, sem exceção: presentacional simples, componente com controller
próprio, e também Modal/Dialog (`CreateMatchModal/`,
`TransferOwnershipDialog/`) — um Modal/Dialog é só mais um componente da
página, não ganha tratamento especial nem sobe pro nível de `index.tsx`.

```
GroupDetail/
  components/
    GroupActionsMenu/
      index.tsx
      useGroupActionsController.ts
    CreateMatchModal/
    GroupStatsBadge.tsx
  index.tsx
```

Dentro de `components/`, a decisão de arquivo solto (`GroupStatsBadge.tsx`)
vs pasta própria (`GroupActionsMenu/index.tsx` + controller,
`CreateMatchModal/index.tsx` + o que mais precisar) segue exatamente a
regra de `naming-conventions.md`: sem controller e um arquivo só → solto;
com controller (ou mais de um arquivo, como um Modal geralmente tem) →
pasta própria dentro de `components/`.

## Componentes compartilhados (`view/components/`)

Mesma lógica dos componentes de página, só que reutilizados entre páginas
diferentes. Ver `naming-conventions.md` para quando vira arquivo solto ou
pasta própria.
