# 🚀 Guia Completo — Quiz ARclad
## Da instalação ao ar em 30 minutos, sem programar

---

## O que você vai criar

Um sistema web profissional com:
- Quiz com IA em PT, ES e EN
- Seletor de país e feira antes de começar
- Banco de dados centralizado (todos os leads de todas as feiras)
- Painel admin com relatório e exportação CSV
- URL própria (ex: quiz-arclad.vercel.app)
- Funciona em qualquer celular, tablet ou computador

---

## ETAPA 1 — Criar conta no GitHub (5 min)

1. Acesse **github.com**
2. Clique em **Sign up**
3. Use seu e-mail corporativo
4. Confirme o e-mail

> GitHub é onde o código fica guardado. É gratuito.

---

## ETAPA 2 — Criar conta no Vercel (3 min)

1. Acesse **vercel.com**
2. Clique em **Sign Up**
3. Escolha **Continue with GitHub**
4. Autorize a conexão

> Vercel hospeda o site gratuitamente. Ele se conecta ao GitHub automaticamente.

---

## ETAPA 3 — Criar conta no Supabase (5 min)

1. Acesse **supabase.com**
2. Clique em **Start your project**
3. Faça login com GitHub
4. Clique em **New project**
5. Preencha:
   - **Name:** arclad-quiz
   - **Database Password:** crie uma senha forte e GUARDE em local seguro
   - **Region:** South America (São Paulo)
6. Aguarde ~2 minutos até criar

---

## ETAPA 4 — Criar o banco de dados (3 min)

1. No painel do Supabase, clique em **SQL Editor** (menu lateral)
2. Clique em **New query**
3. Abra o arquivo `supabase-schema.sql` deste pacote
4. Copie TODO o conteúdo e cole no editor
5. Clique em **Run** (botão verde)
6. Você verá: *"Success. No rows returned"* — está correto!

---

## ETAPA 5 — Pegar as chaves do Supabase (2 min)

1. No Supabase, vá em **Settings > API** (menu lateral)
2. Você precisará de 3 informações:

```
Project URL:       https://xxxxxxxxxxxxxxxx.supabase.co
anon public key:   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key:  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. **Guarde essas 3 informações** — você vai precisar delas na Etapa 8

---

## ETAPA 6 — Pegar a chave da Anthropic (3 min)

1. Acesse **console.anthropic.com**
2. Faça login (ou crie uma conta)
3. Vá em **API Keys**
4. Clique em **Create Key**
5. Nome: "ARclad Quiz"
6. Copie a chave: `sk-ant-api03-...`

> Os R$5 de crédito gratuito dão para centenas de rodadas de quiz.

---

## ETAPA 7 — Subir o código no GitHub (5 min)

### Opção A — Arrastar e soltar (mais fácil)

1. Vá em **github.com/new** para criar um repositório
2. Nome: `arclad-quiz`
3. Deixe **Private** marcado
4. Clique em **Create repository**
5. Na página que abrir, clique em **uploading an existing file**
6. Arraste a pasta `arclad-quiz` inteira para a área indicada
7. Clique em **Commit changes**

### Opção B — GitHub Desktop (se preferir)

1. Baixe **GitHub Desktop** em desktop.github.com
2. Faça login com sua conta GitHub
3. Clique em **Add > Create New Repository**
4. Arraste os arquivos da pasta `arclad-quiz` para lá
5. Clique em **Publish repository**

---

## ETAPA 8 — Fazer o deploy no Vercel (5 min)

1. Acesse **vercel.com** e faça login
2. Clique em **Add New > Project**
3. Selecione o repositório `arclad-quiz`
4. Clique em **Import**
5. Antes de fazer o deploy, clique em **Environment Variables** e adicione UMA POR VEZ:

| Nome da variável | Valor |
|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` (sua chave) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (service_role key) |

6. Após adicionar todas, clique em **Deploy**
7. Aguarde ~2 minutos
8. Você receberá uma URL: `https://arclad-quiz-xxxxx.vercel.app`

---

## ETAPA 9 — Testar (2 min)

1. Abra a URL no celular e no computador
2. Selecione **Brasil 🇧🇷** e o nome de uma feira de teste
3. Clique em Começar
4. Responda algumas perguntas
5. No final, preencha nome/empresa/WhatsApp fictícios
6. Verifique se o lead apareceu no Supabase:
   - Vá em **Table Editor > leads** no Supabase
   - O registro deve aparecer com todos os dados

---

## ETAPA 10 — URL personalizada (opcional, 5 min)

Para ter uma URL como `quiz.arclad.com.br`:

1. No Vercel, vá em **Settings > Domains**
2. Adicione o domínio desejado
3. Siga as instruções para configurar o DNS no provedor do seu domínio

---

## Painel Administrativo

Para acessar o painel de leads durante a feira:

1. Abra o quiz no celular/tablet
2. Toque **5 vezes seguidas** no logo ARclad
3. Digite o PIN: **1234**
4. Você verá todos os leads, filtros por temperatura e relatório

> Para mudar o PIN: abra o arquivo `pages/index.js` e altere `'1234'` para o PIN desejado.

---

## Adicionar um novo país/subsidiária

Para adicionar, por exemplo, o Peru:

1. Abra `pages/index.js`
2. Encontre o array `COUNTRIES`
3. Está lá: `{ code: 'PE', label: 'Perú 🇵🇪', ... }`
4. Atualize o `consultant` e `email` com o nome do consultor local
5. Faça commit no GitHub — o Vercel atualiza automaticamente em ~1 minuto

---

## Adicionar consultor por país

No array `COUNTRIES` em `pages/index.js`:

```javascript
{ code: 'CO', label: 'Colombia 🇨🇴', locale: 'es',
  consultant: 'Juan García',        // nome do consultor colombiano
  email: 'juan.garcia@arclad.com'   // email dele
},
```

---

## Suporte

Qualquer dúvida durante a instalação, entre em contato:
**felipe.cenciani@arclad.com**

---

## Resumo dos arquivos entregues

```
arclad-quiz/
├── pages/
│   ├── index.js          ← o quiz completo (PT + ES + EN)
│   ├── _app.js           ← configuração do Next.js
│   └── api/
│       ├── chat.js       ← backend da IA (API key segura no servidor)
│       └── leads.js      ← salva/lê leads no banco de dados
├── locales/
│   ├── pt/common.json    ← textos em português
│   ├── es/common.json    ← textos em espanhol
│   └── en/common.json    ← textos em inglês
├── styles/
│   ├── globals.css       ← estilos globais
│   └── Quiz.module.css   ← estilos do quiz (cores ARclad)
├── lib/
│   └── supabase.js       ← cliente do banco de dados
├── supabase-schema.sql   ← estrutura do banco (cole no Supabase)
├── vercel.json           ← configuração do deploy
├── next.config.js        ← configuração multi-idioma
├── package.json          ← dependências
└── .env.local            ← TEMPLATE das variáveis (não commitar!)
```

---

*Sistema desenvolvido para ARclad do Brasil — uso interno*
*Quiz interativo com IA para qualificação de leads em feiras*
