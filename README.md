# 🛠️ OS Click Laser - Manual do Usuário

Bem-vindo ao sistema de geração e gestão de Ordens de Serviço (OS) da **Click Laser**. Este sistema foi desenvolvido para otimizar o fluxo de produção de gravações a laser em itens personalizados (copos, garrafas, etc.).

## 📋 Funcionalidades Principais

- **Criação de Pedidos Únicos:** Formulário rápido para clientes que desejam personalizar uma única unidade.
- **Criação de Pacotes:** Ideal para grandes demandas. Permite cadastrar múltiplos nomes de uma vez ou gerar "gravações sem nome" em lote.
- **Visualização de Fontes:** Pré-visualização em tempo real das fontes selecionadas para garantir que o estilo agrade o cliente.
- **Impressão Térmica de OS:** Layout otimizado (80mm) para impressoras térmicas, contendo todos os detalhes técnicos e um QR Code de validação.
- **Gestão de Status:** Consulta de pedidos por data (Aceito, Em produção, Finalizado, Cancelado).

---

## 🚀 Como Usar o Sistema

### 1. Acessando a Interface
Ao abrir o sistema, você verá a tela principal de **Produção de Ordem de Serviço**. No topo, existe um seletor para alternar entre **Pedido único** e **Pacote**.

### 2. Gerando um Pedido Único
1. Selecione a aba **Pedido único**.
2. **Origem do Pedido:** Indique se veio por Anúncio, se foi Presencial, ou se já era Cliente.
3. **Item:** Descreva o produto (ex: *Copo térmico preto*).
4. **Nome para Gravação:** Digite exatamente como o cliente solicitou.
5. **Fonte e Figura:** Selecione a tipografia desejada e se há algum desenho/logo.
6. **Data de Entrega e Observações:** Preencha informações adicionais para o operador da máquina.
7. Clique em **FINALIZAR E IMPRIMIR**. O sistema criará o PDF, enviará para a nuvem e abrirá a tela de impressão automaticamente.

### 3. Gerando um Pacote de Gravações
1. Selecione a aba **Pacote**.
2. Preencha os dados base (Item, Figura, Fonte, Origem).
3. **Nomes:** Cole a lista de nomes (um por linha) no campo de texto.
4. **Sem Nomes:** Se as garrafas forem apenas com logo, marque a caixa **"Pacote sem nomes"** e digite a quantidade total.
5. Clique em **FINALIZAR E IMPRIMIR PACOTE**. Será gerada uma OS com quebra de linha para cada item, facilitando a conferência da produção.

### 4. Consultando Pedidos (Gestão)
1. No canto superior direito, clique no botão com ícone de **Lupa** (`🔍`).
2. A tela de visualização será aberta.
3. Selecione a **Dia do Pedido** e clique em buscar.
4. O sistema listará todas as Ordens de Serviço daquele dia.
5. Você pode:
   - Alterar o status de produção (ex: Mudar de "Pedido aceito" para "Finalizado").
   - Clicar no ícone do **Olho** (`👁️`) para ver os detalhes completos em uma nova aba.
   - Clicar no ícone de **PDF** para baixar a versão original da Ordem de Serviço.
