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
  - `useMyKey` (optional, "true") — when set, the user's stored BYOK key is
    decrypted and used instead of the server-wide `VISION_API_KEY`. Users with a
    BYOK key bypass the daily/monthly quota.
- Size limit: ~10 MB (configure via `VISION_API_MAX_BYTES`, default 10_485_760)
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`. Anything else
  returns 415.
- Response body from the vision gateway is capped at 64 KB. Larger outputs
  return 500.

## Error codes

| Status | When                                                                 |
| ------ | -------------------------------------------------------------------- |
| 400    | Missing `image` field                                               |
| 401/403 | Auth failure (existing JWT middleware)                              |
| 404    | User not found                                                      |
| 413    | Upload exceeds `VISION_API_MAX_BYTES` (or multer's 10 MB cap)        |
| 415    | MIME type not in the allowed set                                     |
| 429    | Daily (`SCAN_DAILY_LIMIT`, default 10) or monthly                   |
|        | (`SCAN_MONTHLY_LIMIT`, default 100) quota exhausted. Body includes   |
|        | a `quota` object with `usedDay`, `limitDay`, `usedMonth`,            |
|        | `limitMonth`, `resetsAt` (UTC ISO), and `reason: "daily" | "monthly"`.|
| 500    | Vision provider error, malformed model output, or server failure    |
| 503    | No vision provider configured (no `VISION_API_KEY` and no BYOK key) |

## Quota

Each user has a `scanUsage` document:

```
{
  day: "YYYY-MM-DD",
  dayCount: number,
  month: "YYYY-MM",
  monthCount: number,
  lastScanAt: Date
}
```

Counters roll over automatically when the day/month (UTC) changes. Successful
scans `$inc` the counters; failed scans do not. Configure limits via env:

```
SCAN_DAILY_LIMIT=10
SCAN_MONTHLY_LIMIT=100
```

### `GET /users/:userId/scan-quota`

Returns the current quota snapshot without performing a scan. Used by the
frontend quota bar.

```jsonc
{
  "success": true,
  "quota": {
    "usedDay": 3,
    "limitDay": 10,
    "usedMonth": 12,
    "limitMonth": 100,
    "resetsAt": "2026-07-02T00:00:00.000Z"
  },
  "byok": false
}
```

## BYOK (Bring Your Own Key)

Users can store their own vision API key, encrypted at rest with AES-256-GCM
using a server-side `BYOK_ENCRYPTION_KEY` (32 bytes, hex). Plaintext is never
logged or returned by the API.

### `GET /users/:userId/vision-key`

Returns `{ success: true, status: { hasKey: boolean } }`.

### `PUT /users/:userId/vision-key`

Body: `{ "key": "<plaintext api key>" }`. The server validates the key by
calling `${VISION_API_BASE}/models` with it before saving. Returns
`{ success: true, status: { hasKey: true, lastFour: "••••abcd" } }`.

### `DELETE /users/:userId/vision-key`

Clears the stored key.

### Required env

```
BYOK_ENCRYPTION_KEY=<32-byte random hex>
```

## Env (provider-agnostic, OpenAI-compatible)

The controller POSTs to `${VISION_API_BASE}/chat/completions` with an OpenAI-style
payload (`response_format: json_object` + `image_url` content part).

### OpenCode Go subscription (recommended default)

```
VISION_API_BASE=https://opencode.ai/zen/go/v1
VISION_API_KEY=<your OpenCode Go key>
VISION_MODEL=kimi-k2.6
VISION_API_MAX_BYTES=10485760   # optional
```

`kimi-k2.6` is confirmed working end-to-end against a real receipt image (4 line
items + receipt-level date extracted). Pricing $0.95/$4.00 per 1M tokens.

Go models verified to accept image input on `/chat/completions` (in order of
extraction quality on a sample receipt):
1. `kimi-k2.6` — recommended, 4/4 lines extracted
2. `kimi-k2.7-code` — 4/4 lines, same price
3. `mimo-v2.5` — 3/4 lines, cheapest ($0.14/$0.28)

Go models known to **reject** image input on `/chat/completions`:
- `glm-5.2`, `deepseek-v4-pro`, `deepseek-v4-flash`, `mimo-v2.5-pro` — `image_url` not supported
- `glm-5.1` — accepts images but extracts nothing useful

**Important:** Go's gateway returns 400/500 if you send `response_format: json_object`
together with an image input. The controller intentionally omits `response_format`
and parses the JSON out of the model's text content (with a regex fallback).

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
If the gateway supports `response_format: json_object` with vision input you may
re-add it to the controller for stricter output; the OpenCode Go gateway does
not, which is why it is omitted upstream.

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
  ],
  "quota": {
    "usedDay": 4,
    "limitDay": 10,
    "usedMonth": 13,
    "limitMonth": 100,
    "resetsAt": "2026-07-02T00:00:00.000Z"
  },
  "byok": false                     // true if the user's BYOK key was used
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

1. Add multer (memory storage) for the `image` field, with a 10 MB limit and a
   `fileFilter` that only accepts the allowed MIME types.
2. Express route `POST /transactions/scan/:userId`, behind existing auth middleware.
3. Read image → base64 data URL → POST to vision gateway → parse `response_format`
   JSON → reshape to the contract above.
4. Inject the user's existing category names (from DB) into the prompt — the
   frontend also sends `existingCategories`, but the backend can enrich it with
   the source of truth.
5. Quota: load user's `scanUsage`, reset stale counters, reject with 429 if
   exceeded. Increment on success.
6. BYOK: if `useMyKey` is set and the user has a stored encrypted key, decrypt
   and use it; otherwise fall back to `VISION_API_KEY`. Reject with 503 if
   neither is available.
7. Cap the vision response stream at 64 KB before parsing.
8. No DB writes in this endpoint other than `scanUsage` and `visionApiKeyEnc`
   updates (those are owned by separate endpoints).
9. Add the `VISION_*`, `SCAN_*`, and `BYOK_ENCRYPTION_KEY` env vars to the
   backend's config + README.