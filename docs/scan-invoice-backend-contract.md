# Scan-invoice endpoint contract

This repo (frontend) calls a new backend endpoint that must be implemented in the
sibling **calendar-money-api** repo. The endpoint proxies an invoice image to a
vision-capable AI model and returns draft transactions — it performs NO database
writes. Persistence reuses the existing `POST /transactions/bulk/:userId`
endpoint.

## Route

```
POST /transactions/scan/:userId
```

- Auth: existing JWT middleware (`Authorization: Bearer <token>`)
- Body: `multipart/form-data`
  - `image` (required, file) — the invoice photo/upload (JPEG/PNG/WebP)
  - `existingCategories` (optional, JSON string) — array of the user's current
    category names, e.g. `["Groceries","Salary","Rent"]`. Used to bias the model
    toward reusing existing categories; the frontend re-resolves names → ids
    before bulk commit.
- Size limit: ~10 MB (configure via `VISION_API_MAX_BYTES`, default 10_485_760)

## Env (provider-agnostic, OpenAI-compatible)

The controller POSTs to `${VISION_API_BASE}/chat/completions` with an OpenAI-style
payload (`response_format: json_object` + `image_url` content part).

### OpenCode Go subscription (recommended default)

```
VISION_API_BASE=https://opencode.ai/zen/go/v1
VISION_API_KEY=<your OpenCode Go key>
VISION_MODEL=glm-5.2
VISION_API_MAX_BYTES=10485760   # optional
```

Fallbacks on the **same** `/chat/completions` endpoint (swap `VISION_MODEL` only,
no code change), in order of decreasing likelihood of accepting image input:
1. `deepseek-v4-pro`
2. `kimi-k2.6`
3. `mimo-v2.5`

Go models that use the Anthropic `/messages` shape (MiniMax M3 / M2.7 / M2.5,
Qwen3.7 Max / Plus, Qwen3.6 Plus) are **not** supported by the current
implementation — extending `scan.ts` with an Anthropic-shape branch would be
required to use them.

### Any other OpenAI-compatible gateway

```
VISION_API_BASE=<base URL, no trailing slash>
VISION_API_KEY=<your key>
VISION_MODEL=<vision-capable model id>
```

## Vision request shape

```jsonc
{
  "model": "<VISION_MODEL>",
  "response_format": { "type": "json_object" },
  "messages": [
    {
      "role": "system",
      "content": "You extract transactions from invoice/receipt images. Return strict JSON: { \"date\": \"YYYY-MM-DD\" | null, \"transactions\": [ { \"date\": \"YYYY-MM-DD\"?, \"amount\": number, \"description\": string, \"categoryName\": string, \"categoryType\": \"Income\" | \"Expense\", \"color\": string } ] }. `date` is the receipt-level date if visible, else null. Line `date` only if explicitly printed on that line; otherwise omit. Infer `categoryName` per line item. Default `categoryType` to Expense for invoice line items; use Income only for refunds/payments-to-you. `amount` always positive. Prefer reusing category names from this list when a good fit exists: <existingCategories>. `color` is a hex string like #5b8cff."
    },
    {
      "role": "user",
      "content": [
        { "type": "text", "text": "Extract the transactions." },
        { "type": "image_url", "image_url": { "url": "data:image/jpeg;base64,<BASE64>" } }
      ]
    }
  ]
}
```

Headers: `Authorization: Bearer ${VISION_API_KEY}`, `Content-Type: application/json`.

## Response to the frontend (200)

```jsonc
{
  "date": "2024-05-12",            // receipt-level date or null
  "transactions": [
    {
      "date": "2024-05-12",        // optional; omit if no line-level date
      "amount": 12.50,
      "description": "Organic milk 1L",
      "categoryName": "Groceries",
      "categoryType": "Expense",
      "color": "#22c55e"
    }
  ]
}
```

- On AI failure or unparseable output, return `{ "error": "<message>" }` with an
  appropriate 4xx/5xx status.

## Persistence (already exists — no change needed)

The frontend maps draft rows to the existing bulk endpoint:

```
POST /transactions/bulk/:userId
{
  "categories": [ { "name", "type", "color" } ],   // only new categories
  "transactions": [ { "date": Date, "amount", "description", "category": <_id|name> } ]
}
```

The bulk endpoint already creates missing categories (resolving `category` by id
or name) — so AI-suggested categories that don't exist are auto-created.

## Implementation checklist (backend)

1. Add multer (memory storage) for the `image` field.
2. Express route `POST /transactions/scan/:userId`, behind existing auth middleware.
3. Read image → base64 data URL → POST to vision gateway → parse `response_format`
   JSON → reshape to the contract above.
4. Inject the user's existing category names (from DB) into the prompt — the
   frontend also sends `existingCategories`, but the backend can enrich it with
   the source of truth.
5. No DB writes in this endpoint.
6. Add the three `VISION_*` env vars to the backend's config + README.