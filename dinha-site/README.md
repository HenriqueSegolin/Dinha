# Dinha – Receitas Afetivas

Site institucional e cardápio da Dinha (Osasco). React + Vite + Tailwind CSS.

## Rodar no computador

```bash
npm install
npm run dev
```

## Publicar na Vercel

**Opção 1 – pelo GitHub (recomendado)**
1. Crie um repositório no GitHub e envie esta pasta.
2. Em vercel.com, clique em *Add New → Project* e importe o repositório.
3. A Vercel detecta o Vite sozinha (build: `npm run build`, saída: `dist`). Clique em *Deploy*.
Depois disso, cada alteração enviada ao GitHub é publicada automaticamente.

**Opção 2 – pela linha de comando**
```bash
npx vercel        # faz login pelo navegador e cria o projeto
npx vercel --prod # publica em produção
```

## Pendências de conteúdo
Procure por `PENDENTE` em `src/DinhaSite.jsx`: história da Dinha, fotos reais, logotipo e ilustrações oficiais.
