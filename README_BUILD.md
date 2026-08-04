# ☁️ Deploy do Backend - Cloudflare Workers

Este guia explica como subir a API Serverless (Backend) do sistema OS Click Laser utilizando o **Cloudflare Workers** e configurar o armazenamento no **Cloudflare R2**.

## 🛠️ Pré-requisitos

1. Conta ativa no [Cloudflare](https://dash.cloudflare.com/).
2. [Node.js](https://nodejs.org/) instalado no seu computador.
3. Ter o Wrangler CLI instalado globalmente:
   ```bash
   npm install -g wrangler
   ```

## 📦 1. Autenticação

No seu terminal, faça o login na sua conta do Cloudflare:
```bash
wrangler login
```
*Uma janela do navegador será aberta para você autorizar o acesso.*

## 🪣 2. Configurando o Cloudflare R2 (Storage)

O sistema utiliza o R2 para salvar os PDFs gerados. Precisamos criar o bucket antes de fazer o deploy.

1. Crie o bucket com o nome especificado no projeto:
   ```bash
   wrangler r2 bucket create os-click-laser
   ```
2. O arquivo `wrangler.toml` já está configurado corretamente com o binding `R2_OS` apontando para este bucket.

## 🔐 3. Variáveis de Ambiente (Supabase)

O worker se comunica com um banco de dados **Supabase** para salvar o histórico de serviços. Você precisa configurar as variáveis de ambiente sensíveis no Cloudflare.

Execute os comandos abaixo e cole as respectivas chaves quando solicitado:

```bash
# Adicionar a URL do seu projeto Supabase (ex: https://xyz.supabase.co)
wrangler secret put SUPABASE_URL

# Adicionar a Service Key / API Key com permissão de escrita
wrangler secret put SUPABASE_SERVICE_KEY
```

## 🚀 4. Publicando o Worker

Com o bucket criado e os segredos configurados, faça o deploy do código:

```bash
wrangler deploy
```

O terminal retornará uma URL semelhante a:
`https://os-click-laser.<seu-subdominio>.workers.dev`

## ⚙️ 5. Atualizando o Frontend

Caso a URL do Worker mude, não se esqueça de atualizar a constante `URL_BASE` no arquivo frontend localizado em `scripts/main.js`:

```javascript
const URL_BASE = "https://os-click-laser.<seu-subdominio>.workers.dev";
```
