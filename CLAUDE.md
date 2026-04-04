# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

nomthis is an AI-powered recipe generator. Users type ingredients they have on hand, and the app returns a recipe via the Claude API. Live at nomthis.com.

## Architecture

Single-file Express server (`server.js`) serving a single-page frontend (`public/index.html`). No build step, no framework, no bundler.

- **Backend**: Express + `@anthropic-ai/sdk`. One POST endpoint (`/api/recipe`) that sends ingredients to Claude and returns a markdown recipe. Rate-limited to 10 req/min per IP.
- **Frontend**: Vanilla HTML/CSS/JS. Uses `marked` (CDN) to render markdown responses. Affiliate links (Amazon tag `nomthis-20`) are styled into cards client-side by wrapping "buy"/"gear" `<h2>` sections.
- **Analytics**: Plausible (self-hosted script).

## Commands

```bash
npm start          # Start the server (node server.js)
```

No test suite, no linter, no build step.

## Environment

Requires `ANTHROPIC_API_KEY` in `.env` (see `.env.example`). Server defaults to port 3000.

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
