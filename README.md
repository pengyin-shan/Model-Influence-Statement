# Model Influence Statement

A self-hostable web application for collecting machine-learning model disclosures, capturing signatures and structured responses, and exporting a finalized model influence statement as a `.docx` file.

Live app: https://model-influence-statement-generator.netlify.app/

## What It Includes

- A React + MUI web form for authors to disclose whether they used no model, one model, or multiple models
- Structured fields for model metadata, training-data disclosure, roles, ethical considerations, and optional critical prompt disclosure
- Browser-side `.docx` export for the final statement
- A reusable markdown template in `statement-template.md`
- An example disclosure in `example-influence-statement.md`
- Citation metadata in `citation.cff`

## Local Development

This project uses Node `20.19.0`.

```bash
nvm use
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Netlify

If this repository is deployed directly:

- Base directory: leave blank
- Build command: `npm run build`
- Publish directory: `dist`

If this project is deployed as a subdirectory inside a larger repository:

- Base directory: `Model-Influence-Statement`
- Build command: `npm run build`
- Publish directory: `dist`
