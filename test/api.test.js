const { describe, it, before, after } = require("node:test");
const assert = require("node:assert");
const http = require("node:http");
const path = require("node:path");

// Ensure env is loaded before requiring server
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

let server;
let baseUrl;

async function startServer() {
  return new Promise((resolve) => {
    // Require express app fresh
    delete require.cache[require.resolve("../server.js")];
    const app = require("../server.js");
    // If server.js exports the app, use it. Otherwise it auto-listens.
    if (typeof app?.listen === "function") {
      server = app.listen(0, () => {
        baseUrl = `http://localhost:${server.address().port}`;
        resolve();
      });
    }
  });
}

// Helper to make requests
async function req(path, options = {}) {
  const res = await fetch(`${baseUrl}${path}`, options);
  return res;
}

describe("API Tests", () => {
  before(async () => {
    await startServer();
  });

  after(() => {
    server?.close();
  });

  describe("POST /api/recipe", () => {
    it("rejects empty ingredients", async () => {
      const res = await req("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: "" }),
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.ok(data.error);
    });

    it("rejects ingredients over 500 characters", async () => {
      const res = await req("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: "a".repeat(501) }),
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.ok(data.error.includes("500"));
    });

    it("returns streaming response with valid ingredients", async () => {
      const res = await req("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: "eggs, cheese", personalityId: "classic" }),
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get("content-type"), "text/event-stream");

      // Read a few chunks to verify SSE format
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      const { value } = await reader.read();
      text += decoder.decode(value);
      reader.cancel();

      assert.ok(text.includes("data: "), "Response should contain SSE data lines");
    });

    it("falls back to default personality for invalid personalityId", async () => {
      const res = await req("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: "rice", personalityId: "nonexistent" }),
      });
      // Should not error — falls back to classic
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get("content-type"), "text/event-stream");
      const reader = res.body.getReader();
      reader.cancel();
    });
  });

  describe("POST /api/identify", () => {
    it("rejects request with no file", async () => {
      const res = await req("/api/identify", { method: "POST" });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.ok(data.fallback);
    });
  });

  describe("GET /api/personalities", () => {
    it("returns personality list without systemPrompt", async () => {
      const res = await req("/api/personalities");
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data));
      assert.ok(data.length >= 3);
      // Verify no systemPrompt leaked
      data.forEach((p) => {
        assert.ok(p.id);
        assert.ok(p.name);
        assert.strictEqual(p.systemPrompt, undefined, "systemPrompt should not be exposed");
      });
    });
  });
});
