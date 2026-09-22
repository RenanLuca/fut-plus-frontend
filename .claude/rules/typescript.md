# TypeScript

## type vs interface

Usa `type` como padrão do projeto, principalmente porque a maioria dos
tipos de domínio vem de schema Zod (`z.infer<typeof schema>`), e isso só
funciona com `type`. Reserva `interface` só se precisar de declaration
merging (raro neste projeto) ou se o time decidir adotar por convenção de
componente de biblioteca externa.

## Nunca usar `any`

Se o tipo genuinamente não é conhecido, usa `unknown` e faz narrowing
explícito. `any` nunca é aceito, nem como solução temporária — se travar
tipando algo, para e pergunta em vez de usar `any` pra seguir em frente.

## Tipo de domínio nasce do Zod quando possível

Se o dado já tem (ou deveria ter) validação via Zod (formulário, resposta
de API que vale a pena validar), o tipo TypeScript é inferido do schema:

```ts
const groupSchema = z.object({
  name: z.string().min(1),
  ownerId: z.string(),
});

type Group = z.infer<typeof groupSchema>;
```

Não duplica a mesma forma como `interface`/`type` manual e como schema Zod
ao mesmo tempo — isso diverge com o tempo. Um dos dois é a fonte da verdade
(o schema, quando existir validação real) e o outro é derivado dele.

## Props de componente

Nome do tipo de props: `<NomeDoComponente>Props`, definido no mesmo arquivo
do componente (ou em `<Nome>.types.ts` se o componente tiver pasta própria
e o tipo for grande o suficiente pra valer a pena separar).

## Retorno de controller

Tipa o retorno do hook controller explicitamente quando o retorno tiver
mais de 3-4 campos, pra deixar claro no autocomplete do `.tsx` o que está
disponível, em vez de depender só de inferência.

## Enum

Prefere union de string literal (`type Status = "pending" | "confirmed" | "cancelled"`)
em vez de `enum` do TypeScript, pra manter consistência com o padrão do
Zod (`z.enum([...])` gera union literal, não enum).
