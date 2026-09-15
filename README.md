# Landing Page — 80 Atividades de Alfabetização

Landing page estática, responsiva e mobile-first em HTML, CSS e JavaScript puro.

## Estrutura

```text
alfabetizacao-silabas/
├── .openai/
│   └── hosting.json
├── dist/
│   ├── assets/
│   │   └── images/
│   │       ├── product-main-v2.webp
│   │       ├── benefits-use.webp
│   │       ├── premium-bundle.webp
│   │       ├── digital-delivery.webp
│   │       └── sample-01.webp ... sample-06.webp
│   ├── index.html
│   ├── styles.css
│   └── script.js
└── README.md
```

Os arquivos de imagem listados são opcionais durante o desenvolvimento: a página mostra placeholders próprios quando eles ainda não existem.

## Ajustes rápidos

- Checkouts: altere `CHECKOUT_LINKS` no início de `dist/script.js`.
- Imagens: coloque os arquivos WebP em `dist/assets/images/` usando exatamente os nomes da estrutura acima.
- Rodapé: substitua os `href="#"` dos links de contato, privacidade e termos em `dist/index.html`.
- Políticas comerciais: procure por `ATUALIZAR INFORMAÇÃO COM POLÍTICA REAL` em `dist/index.html`.

## Publicação na Vercel

O arquivo `vercel.json` configura `dist` como diretório público. Ao importar este
repositório, mantenha o diretório raiz do projeto na Vercel como `./`.
