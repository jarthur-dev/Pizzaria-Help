# 🍕 Pizzaria Help

Página de pedidos para uma pizzaria, intuitiva, responsiva e profissional, feita com **React + TypeScript**.
O grande diferencial é o **chatbot de atendimento**: o cliente monta o pedido conversando e, no final, o WhatsApp da pizzaria abre com tudo pronto para enviar.

> Projeto em desenvolvimento. Por enquanto é só o **front-end**; o banco de dados do sistema será a próxima etapa.

## Funcionalidades

- **Chatbot "Help"** que guia o pedido do começo ao fim: itens, tamanho, quantidade, entrega ou retirada, endereço, pagamento (Pix, cartão ou dinheiro, com troco) e observações. Ao final mostra um resumo com o total e abre o WhatsApp com a mensagem do pedido já escrita.
- **Destaques da semana e do mês** em carrossel, com setas, indicadores, rolagem automática e arrastar com o mouse.
- **Cardápio com filtros**: categorias (pizzas salgadas, doces, bebidas e combos), busca por nome, filtros de vegetariana, picante e mais pedida, e ordenação por preço ou nome.
- **Carrinho lateral** que guarda o pedido no aparelho do cliente.
- **Indicador "Aberto/Fechado agora"** calculado pelo horário de funcionamento.
- **Frete grátis** a partir de um valor configurável.
- Seções "Como pedir", perguntas frequentes e rodapé com contato.
- **Movimento suave em toda a página**: carrossel deslizando, entrada dos blocos ao rolar, cardápio que se reorganiza ao filtrar, perguntas que abrem animadas e rolagem suave entre seções. Respeita a opção "reduzir movimento" do sistema.
- **Responsivo**: layout pensado para celular e computador.

## Tecnologias

- [React 18](https://react.dev/) e [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- CSS puro (sem biblioteca de estilos)

## Como rodar

Requisitos: [Node.js](https://nodejs.org/) 18 ou superior.

```bash
npm install
npm run dev
```

Depois abra o endereço que aparecer no terminal (normalmente `http://localhost:5173`).

Outros comandos:

| Comando             | O que faz                                      |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento                    |
| `npm run typecheck` | Verifica os tipos do TypeScript                |
| `npm run build`     | Verifica os tipos e gera a versão de produção  |
| `npm run preview`   | Abre a versão de produção gerada pelo `build`  |

## Configuração

Antes de publicar, troque os dados de exemplo em **`src/config.ts`**:

- `whatsapp`: número que recebe os pedidos, só dígitos, com `55` + DDD (hoje é um número de exemplo)
- `phoneDisplay`, `address` e `instagram`: contato exibido no site
- `deliveryFee`, `freeDeliveryAbove`, `deliveryEta` e `pickupEta`: taxa, frete grátis e prazos
- `HOURS` e `hoursSummary`: horário de funcionamento por dia da semana

Os produtos, preços, tamanhos e destaques ficam em **`src/data/products.ts`**.

## Estrutura

```
src/
├── components/      Seções da página (Hero, Catálogo, Carrossel, Chat, Carrinho, FAQ...)
├── chat/            Lógica do chatbot (fluxo de conversa e tipos)
├── context/         Estado global do carrinho e da interface
├── data/            Lista de produtos
├── hooks/           Hooks de movimento (entrada ao rolar, rolagem suave, reorganização do cardápio)
├── utils/           Formatação de preço, mensagem do WhatsApp, horários e animações
├── config.ts        Dados do negócio
├── styles.css       Estilos e paleta de cores
└── main.tsx         Ponto de entrada
```

## Paleta de cores

Vermelho tomate, amarelo mostarda, laranja e branco, definidos como variáveis no início de `src/styles.css`.

## Próximos passos

- Banco de dados e sistema da pizzaria (produtos, pedidos e clientes)
- Conectar o cardápio e o fechamento do pedido ao banco, no lugar da lista fixa e do envio só pelo WhatsApp
- Fotos reais dos produtos

## Autor

Desenvolvido por **jarthur-dev**.
