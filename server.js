require("dotenv").config();
const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");
const rateLimit = require("express-rate-limit");

const app = express();
const client = new Anthropic();

app.use(express.json());
app.use(express.static("public"));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many requests. Try again in a minute." },
});

app.use("/api/", limiter);

const SYSTEM_PROMPT = `You are a creative home chef. The user will give you a list of ingredients they have on hand. Generate a recipe using those ingredients.

Rules:
- Work primarily with what's provided. You may suggest 1-3 common pantry staples (salt, pepper, oil, butter, garlic) if needed.
- Be practical and approachable — home cooking, not restaurant plating.

Output format (use markdown):
# [Recipe Name]

**Prep time:** X min | **Cook time:** X min | **Serves:** X

## Ingredients
- List each ingredient with quantity

## Steps
1. Numbered steps, clear and concise

## Tips
- 1-2 helpful tips

## Ingredients to Buy
If the cook needs to stock up, here are handy links:
- [Ingredient Name](https://www.amazon.com/s?k=ingredient+name&tag=nomthis-20)
(Include 3-5 key ingredients from the recipe)

## Recommended Gear
- [Tool Name](https://www.amazon.com/s?k=tool+name&tag=nomthis-20) — one-line reason
(Include 1-2 tools relevant to this recipe, e.g. a good skillet, instant-read thermometer, etc.)`;

app.post("/api/recipe", async (req, res) => {
  const { ingredients } = req.body;

  if (!ingredients || typeof ingredients !== "string" || !ingredients.trim()) {
    return res.status(400).json({ error: "Please enter some ingredients." });
  }

  if (ingredients.length > 500) {
    return res
      .status(400)
      .json({ error: "Input too long. Keep it under 500 characters." });
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: ingredients.trim() }],
    });

    const recipe = message.content[0].text;
    res.json({ recipe });
  } catch (err) {
    console.error("Claude API error:", err.message);
    res.status(500).json({ error: "Failed to generate recipe. Try again." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`nomthis running on :${PORT}`));
