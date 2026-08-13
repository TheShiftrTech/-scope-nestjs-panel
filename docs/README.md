# Docs — @scope/nestjs-panel

| Artifact | Purpose |
|----------|---------|
| [NestJS-Panel-Usage-Guide.pdf](./NestJS-Panel-Usage-Guide.pdf) | Usage handbook — linked from package README |
| [usage-guide.html](./usage-guide.html) | PDF source |
| [assets/shftr-logo.webp](./assets/shftr-logo.webp) | SHFTR logo |

## Regenerate PDF

From the package root:

```bash
python3 -m venv .venv-docs
.venv-docs/bin/pip install weasyprint
.venv-docs/bin/weasyprint docs/usage-guide.html docs/NestJS-Panel-Usage-Guide.pdf
```

Chrome headless:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=docs/NestJS-Panel-Usage-Guide.pdf \
  "file://$(pwd)/docs/usage-guide.html"
```

Commit both `usage-guide.html` and `NestJS-Panel-Usage-Guide.pdf` for GitHub PDF preview.
