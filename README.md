# nomthis

AI-powered recipe generator with selectable celebrity chef personalities. Type your ingredients or snap a photo of your fridge, pick a chef, and get a streaming recipe in their voice.

Live at **[nomthis.com](https://nomthis.com)**

## How it works

1. Enter ingredients (or use the camera to photograph your fridge)
2. Pick a personality — each chef has a unique voice and cooking style
3. Get a recipe streamed token-by-token in real time

## Personalities

| Chef | Style | |
|------|-------|-|
| **The Classic** | Simple, reliable home cooking | Free |
| **Gary Fiery** | Maximum hype, absurd dish names, Flavorville energy | Free |
| **Chef Gordo** | Brutally honest, roasts your pantry, makes incredible food | Free |
| **Nonna Sofia** | Warm Italian grandmother, olive oil on everything, family stories | Premium |
| **Coach Macro** | Fitness-obsessed, counts protein, every meal is fuel for gains | Premium |

## Setup

```bash
cp .env.example .env
# Add your OpenAI API key to .env

npm install
npm start
```

Server runs on `http://localhost:3000`.

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key (GPT-4o-mini) |

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/recipe` | POST | Stream a recipe via SSE with selectable personality |
| `/api/identify` | POST | Upload a fridge photo, get ingredients via vision API |
| `/api/personalities` | GET | List available personalities (without system prompts) |

Rate limits: 10 req/min for text, 5 req/min for vision.

## Stack

- **Backend**: Express, OpenAI SDK (GPT-4o-mini for text and vision)
- **Frontend**: Vanilla HTML/CSS/JS, no build step
- **Security**: Helmet headers, DOMPurify for LLM output sanitization
- **Deployment**: DigitalOcean App Platform (auto-deploys on push to `main`)

## Tests

```bash
npm test
```

## License

All rights reserved.
