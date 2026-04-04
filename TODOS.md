# TODOS

## Premium Personality Paywall

**What:** Implement payment gating for premium personalities (Stripe or Lemon Squeezy).

**Why:** The personality system has a `premium` flag per personality. Free tier gives 2-3 voices, premium unlocks all. This is the natural monetization path.

**Context:** `personalities.json` already has `premium: boolean` per entry. Server needs auth + payment validation on `/api/recipe` when a premium personality is requested. Frontend needs locked/unlocked card states, checkout flow. Lemon Squeezy is simpler for a solo dev than Stripe.

**Depends on:** Personality feature must be working and fun first. Validate that people actually enjoy the personalities before gating them.

---

## Constraint Cooking Mode

**What:** Let users set cooking constraints (time, equipment, servings) alongside ingredients.

**Why:** "20 minutes, one pan, feeds 4" are real constraints home cooks deal with. No commodity recipe app optimizes for this. High perceived value, low implementation cost.

**Context:** Add time/equipment/servings dropdowns to the input area. Constraints get appended to the recipe generation prompt alongside the personality system prompt and BASE_FORMAT. May need prompt tuning to avoid conflicts between personality voice and constraint instructions.

**Depends on:** Personality + streaming should be working first.
