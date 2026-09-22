# Nomenclatura e estrutura de pasta

## Componente: arquivo solto vs pasta própria

**Arquivo solto** (`ComponentName.tsx` direto dentro de `components/`):
componente presentacional simples, sem controller próprio, sem sub-arquivo
nenhum. Exemplos já existentes: `ConfirmDialog.tsx`, `Logo.tsx`,
`MatchDateBlock.tsx`, `MonthSelector.tsx`, `PageWrapper.tsx`.

Essa mesma decisão vale dentro de `view/pages/<Nome>/components/` — um
componente só daquela página que tenha controller próprio também vira
pasta (`components/ComponentName/index.tsx` + `useComponentNameController.ts`),
nunca fica solto com o controller como arquivo irmão. Um Modal/Dialog
segue a mesma regra: é só um componente de página com mais de um arquivo,
então vira `components/NomeDoModal/index.tsx` — não tem tratamento
especial. Ver `architecture.md` para a regra completa da pasta `components/`.

**Pasta própria** (`ComponentName/index.tsx` + o que mais precisar):
componente que tem qualquer um destes:
- Controller próprio (`useComponentNameController.ts` ou `useComponentName.ts`
  pra componente menor que não justifica o sufixo "Controller")
- Mais de um arquivo de tipo (`ComponentName.types.ts`)
- Subcomponentes que só fazem sentido dentro dele (não reutilizáveis em
  nenhum outro lugar)

Exemplo já existente: `UpcomingMatchCard/`.

Regra de decisão rápida: se ao criar o componente você só teria **um**
arquivo `.tsx` e nada mais, ele é solto. No momento em que precisar de um
segundo arquivo (controller, tipo, subcomponente), ele vira pasta — nesse
caso mova o arquivo solto pra dentro da nova pasta como `index.tsx`.

## Sufixo de controller

- `use<Nome>Controller.ts` — quando o componente/página tem responsabilidade
  grande o suficiente pra merecer o nome completo (páginas, modais/dialogs
  complexos, layouts)
- `use<Nome>.ts` — hook de propósito mais específico e menor, sem estado
  amplo de "controlar a tela inteira" (ex: `useDebounce.ts` genérico ficaria
  em `app/hooks/`, não é controller de nada)

Não mistura os dois estilos pro mesmo tipo de arquivo dentro do mesmo nível
de pasta — se a página usa `Controller`, os componentes dela com lógica
própria também usam `Controller`.

## Onde cada tipo de arquivo mora

| Tipo | Local |
|---|---|
| Página | `view/pages/<Nome>/index.tsx` |
| Controller de página | `view/pages/<Nome>/use<Nome>Controller.ts` |
| Qualquer componente só daquela página (com ou sem controller, inclui Modal/Dialog) | `view/pages/<Nome>/components/<Componente>.tsx` ou `components/<Componente>/` |
| Componente compartilhado entre páginas | `view/components/<Componente>.tsx` ou `view/components/<Componente>/` |
| Componente de UI genérico (shadcn/Base UI wrapper) | `view/components/ui/` |
| Ícone/SVG customizado | `view/components/svg/` |
| Layout de rota | `view/layouts/` |
| Hook reutilizável entre páginas/features diferentes | `app/hooks/` |
| Contexto de aplicação | `app/contexts/` |
| Chamada de API (axios) | `app/services/` |
| Constante de aplicação | `app/constants/` |
| Utilitário puro sem estado/side effect | `app/utils/` |
| Config de biblioteca/singleton | `app/lib/` |
| Configuração de rota | `app/router/` |

## Nomenclatura de arquivo

- Componente React: `PascalCase.tsx`
- Hook: `camelCase.ts` começando com `use`
- Tipo/schema Zod: `<Nome>.schema.ts` (export do schema Zod) e o tipo
  inferido exportado do mesmo arquivo ou de `<Nome>.types.ts` quando o tipo
  não vem de um schema Zod
- Service de API: pasta `<recurso>Service/` com um arquivo por função
  (ex: `groupsService/findOne.ts`), re-exportado em `index.ts` — ver
  `forms-and-data.md`
- Constante: `<DOMINIO>_CONSTANTS.ts` ou `<dominio>.constants.ts` — escolhe
  um padrão e mantém consistente no projeto (confirmar qual já está em uso
  em `app/constants/` antes de criar um novo arquivo)

## Import

O projeto usa alias `@/` apontando para `./src`. Sempre usa `@/` em vez de
caminho relativo longo (`../../../`) para importar algo fora do diretório
atual — caminho relativo só entre arquivos do mesmo diretório ou um nível
acima. Exemplo: de dentro de `view/pages/GroupDetail/`, um service fica
`import { findOne } from "@/app/services/groupsService"`, não
`import { findOne } from "../../../app/services/groupsService"`.
