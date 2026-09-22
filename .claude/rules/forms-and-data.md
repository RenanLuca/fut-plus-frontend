# Formulário e dados

## Formulário

Todo formulário usa `react-hook-form` + `zod` via `@hookform/resolvers`.
O schema Zod é a fonte da verdade da validação e do tipo:

```ts
const createMatchSchema = z.object({
  date: z.date(),
  location: z.string().min(1, "Campo obrigatório"),
});

type CreateMatchFormValues = z.infer<typeof createMatchSchema>;

const form = useForm<CreateMatchFormValues>({
  resolver: zodResolver(createMatchSchema),
});
```

Lógica de submit (chamada de API, tratamento de sucesso/erro, toast) mora
no controller do componente/modal, nunca direto no `.tsx`.

## Chamada de API

Toda chamada HTTP passa por `app/services/`, nunca `axios` direto dentro de
um controller ou componente. Cada recurso ganha uma pasta
(`app/services/<recurso>Service/`), com **um arquivo por função**,
re-exportado no `index.ts` da pasta:

```
app/services/groupsService/
  create.ts
  findAll.ts
  findOne.ts
  remove.ts
  transferOwnership.ts
  update.ts
  index.ts
```

```ts
// app/services/groupsService/findOne.ts
export async function findOne(id: string): Promise<Group> {
  const { data } = await api.get(`/groups/${id}`);
  return data;
}
```

```ts
// app/services/groupsService/index.ts
export * from "./findAll";
export * from "./findOne";
export * from "./create";
export * from "./update";
export * from "./remove";
export * from "./transferOwnership";
```

O controller importa a função direto da pasta do recurso e consome via
TanStack Query, nunca chama `axios` diretamente:

```ts
// useGroupDetailController.ts
import { findOne } from "@/app/services/groupsService";

const { data, isLoading } = useQuery({
  queryKey: ["group", id],
  queryFn: () => findOne(id),
});
```

Não cria um `<recurso>.service.ts` de arquivo único com várias funções
exportadas — o padrão do projeto é pasta por recurso, arquivo por função,
mesmo para o primeiro endpoint desse recurso.

## Query key

Query key é um array começando pelo nome do recurso no singular, seguido
dos parâmetros que diferenciam a query: `["group", id]`,
`["group", id, "matches"]`. Mantém consistência — não mistura
`["groups"]` (plural) com `["group"]` (singular) pro mesmo recurso.

## Feedback ao usuário

Toast (`react-hot-toast`) pra feedback de ação (sucesso/erro de submit,
convite copiado, etc.), nunca `alert()`. Mensagem de erro de validação de
campo vem do schema Zod, não é escrita solta no componente.
