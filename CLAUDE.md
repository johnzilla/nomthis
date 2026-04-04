# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

nomthis is an AI-powered recipe generator with selectable celebrity chef personalities. Users type ingredients or snap a photo of their fridge, pick a personality, and get a streaming recipe. Live at nomthis.com.

## Architecture

Single-file Express server (`server.js`) serving a single-page frontend (`public/index.html`). No build step, no framework, no bundler.

- **Backend**: Express + `openai` SDK (GPT-4o-mini for both text and vision). Three endpoints:
  - `POST /api/recipe` — streams a recipe via SSE with selectable personality
  - `POST /api/identify` — accepts image upload (multer), identifies ingredients via vision API
  - `GET /api/personalities` — returns personality roster (without system prompts)
- **Personalities**: Defined in `personalities.json`. Each has an id, name, tagline, and systemPrompt. A shared `BASE_FORMAT` constant in server.js defines the recipe output format.
- **Frontend**: Vanilla HTML/CSS/JS. Uses `marked` (CDN) to render streaming markdown. Camera mode with client-side canvas resize to JPEG 1024px. Personality selector with localStorage persistence. Affiliate links (Amazon tag `nomthis-20`) wrapped after stream completes.
- **Analytics**: Plausible (self-hosted script).
- **Rate limiting**: 10 req/min for text, 5 req/min for vision.

## Commands

```bash
npm start          # Start the server (node server.js)
npm test           # Run API tests (node:test)
```

## Environment

Requires `OPENAI_API_KEY` in `.env` (see `.env.example`). Server defaults to port 3000.

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

## Deployment

DigitalOcean App Platform (`.do/app.yaml`). Deploys on push to `main`.

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
