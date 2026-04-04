require("dotenv").config();
const express = require("express");
const OpenAI = require("openai");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const helmet = require("helmet");

const app = express();
const openai = new OpenAI();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://plausible.io"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "https://plausible.io"],
    },
  },
}));
app.use(express.json());
app.use(express.static("public"));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many requests. Try again in a minute." },
});

app.use("/api/", limiter);

const BASE_FORMAT = `Output format (use markdown):
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

const personalities = JSON.parse(
  fs.readFileSync(path.join(__dirname, "personalities.json"), "utf-8")
);
const personalityMap = Object.fromEntries(personalities.map((p) => [p.id, p]));
const defaultPersonality = personalityMap["classic"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed."));
  },
});

const visionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Too many image requests. Try again in a minute." },
});

app.post("/api/identify", visionLimiter, upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Please upload an image.", fallback: true });
  }

  try {
    const base64 = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: 'List the food ingredients visible in this image as a JSON array of strings. Only include food items. Example: ["chicken breast", "rice", "soy sauce"]. Return ONLY the JSON array, nothing else.',
            },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64}` },
            },
          ],
        },
      ],
    });

    const text = response.choices[0]?.message?.content?.trim() || "[]";
    let ingredients;
    try {
      ingredients = JSON.parse(text);
      if (!Array.isArray(ingredients)) throw new Error();
    } catch {
      ingredients = [];
    }

    if (ingredients.length === 0) {
      return res.json({
        ingredients: [],
        error: "Couldn't identify ingredients from that photo. Try typing them instead.",
        fallback: true,
      });
    }

    res.json({ ingredients });
  } catch (err) {
    console.error("Vision API error:", err.message);
    res.status(500).json({
      error: "Couldn't process the image. Try typing your ingredients instead.",
      fallback: true,
    });
  }
});

app.get("/api/personalities", (req, res) => {
  res.json(
    personalities.map(({ id, name, tagline, quote, avatar, premium }) => ({
      id,
      name,
      tagline,
      quote,
      avatar,
      premium,
    }))
  );
});

app.post("/api/recipe", async (req, res) => {
  const { ingredients, personalityId } = req.body;
  const personality = personalityMap[personalityId] || defaultPersonality;
  const systemPrompt = personality.systemPrompt + "\n\n" + BASE_FORMAT;

  if (!ingredients || typeof ingredients !== "string" || !ingredients.trim()) {
    return res.status(400).json({ error: "Please enter some ingredients." });
  }

  if (ingredients.length > 500) {
    return res
      .status(400)
      .json({ error: "Input too long. Keep it under 500 characters." });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1024,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: ingredients.trim() },
      ],
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) {
        res.write(`data: ${JSON.stringify({ type: "token", text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  } catch (err) {
    console.error("OpenAI API error:", err.message);
    res.write(
      `data: ${JSON.stringify({ type: "error", message: "Failed to generate recipe. Try again." })}\n\n`
    );
    res.end();
  }
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Image too large. Try a smaller photo.", fallback: true });
    }
    return res.status(400).json({ error: err.message, fallback: true });
  }
  if (err.message === "Only image files are allowed.") {
    return res.status(400).json({ error: "Please upload an image file.", fallback: true });
  }
  next(err);
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`nomthis running on :${PORT}`));
}

module.exports = app;
