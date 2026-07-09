# knowledge-base

Public knowledge base for Ludic Art Guild, published as an [Antora](https://antora.org/) site to GitHub Pages:

**https://ludicartguild.github.io/knowledge-base/**

> ⚠️ **This repo is generated.** Content under `modules/ROOT/pages/` (except
> `index.adoc`) and `modules/ROOT/nav.adoc` are written by the publish pipeline
> in the private `lessons` repository. Do not edit published content here —
> change it in `lessons` and re-run the **Publish to knowledge-base** workflow.

## Layout

```
antora.yml                 component descriptor
antora-playbook.yml        site build config
modules/ROOT/
├── nav.adoc               sidebar (regenerated on publish)
└── pages/
    ├── index.adoc         landing page (hand-maintained)
    └── <section>/…        published content (generated)
.github/workflows/pages.yml   build + deploy on push
```

## Local preview

```sh
npx --yes antora@3 antora-playbook.yml
# open build/site/index.html
```
