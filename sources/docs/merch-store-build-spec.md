# Merch Store — Build Spec

A sequential implementation guide for adding a print-on-demand merch store to the existing Next.js site. Written to be handed to Claude Code phase by phase.

**Architecture:** Next.js App Router → Stripe Checkout (hosted) → webhook → POD provider order API.

**Key principle:** the browser never sets prices, and the browser never sees a secret key. Everything money-related is decided server-side.

---

## Phase 0 — Decisions and accounts (no code)

Do these before writing anything. Each one changes the code that follows.

1. **POD provider.** Printful and Printify are the main options; compare on Australian shipping cost and lead time specifically, since that's what kills conversion for AU customers. Also check whether they have AU or NZ fulfilment centres — international shipping on a $8 sticker is a dealbreaker.
2. **Create the POD account**, upload one design, create one product, and **order a sample for yourself**. Do not sell a product you have not physically held. Print quality and colour shift are real.
3. **Stripe account** in test mode. You'll need an ABN and bank details before you can activate live payments, so start that process early — verification isn't instant.
4. **Decide the launch lineup.** Recommend: 1 sticker design + 1 tee. Resist more. Every extra product multiplies photography, copy, variant handling, and support surface.
5. **Write down your prices** including shipping. Work out: POD base cost + shipping + Stripe fee (~1.75% + $0.30 for domestic AU cards, verify current rates) = your cost. Set retail above that with actual margin.

**Deliverable from Phase 0:** a list of products with real POD variant IDs, real base costs, and your chosen retail prices. Phase 1 can't start without this.

---

## Phase 1 — Static storefront (no payments)

Goal: browsable shop that looks finished, with a disabled buy button. Ship this before touching money.

### 1.1 Product catalogue as code

Create `lib/products.ts` as the **single server-side source of truth**. Not a database — a typed constant. You have two products, a DB is overkill and adds an attack surface.

```ts
export type Variant = {
  id: string;              // your internal id, e.g. "tee-navy-l"
  label: string;           // "Navy / L"
  priceAud: number;        // in CENTS. 3500 = $35.00
  podVariantId: string;    // provider's variant id, from Phase 0
  inStock: boolean;
};

export type Product = {
  slug: string;
  name: string;
  description: string;
  images: string[];
  variants: Variant[];
};

export const PRODUCTS: Product[] = [ /* ... */ ];

export function getProduct(slug: string): Product | undefined { ... }
export function getVariant(variantId: string): { product: Product; variant: Variant } | undefined { ... }
```

**Prices in cents, as integers.** Never floats for money — `0.1 + 0.2 !== 0.3` and you will eventually charge someone the wrong amount.

### 1.2 Pages

- `/shop` — grid of products
- `/shop/[slug]` — product detail: image gallery, description, variant selector (size/colour), price, quantity, buy button (disabled for now)

Both as **server components** reading from `lib/products.ts` directly. No API call needed to render a static catalogue.

### 1.3 Nav and consistency

Add "Shop" to the existing site nav. Match the current visual language — this should read as part of the same site, not a bolted-on store.

### 1.4 Images

Use `next/image` with explicit width/height to avoid layout shift. Optimise the source files before upload; POD mockup renders come out huge.

**Acceptance:** you can browse to a product, select a variant, see the correct price update, and the buy button is visibly disabled. Looks good on mobile.

---

## Phase 2 — Stripe Checkout (test mode)

### 2.1 Environment variables

In `.env.local` and Vercel project settings:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
POD_API_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Critical:** only `NEXT_PUBLIC_SITE_URL` gets the `NEXT_PUBLIC_` prefix. Anything with that prefix is compiled into the JavaScript bundle and readable by anyone. A `NEXT_PUBLIC_STRIPE_SECRET_KEY` would let a stranger issue refunds from your account.

Confirm `.env.local` is in `.gitignore` before the first commit.

### 2.2 Checkout session route

`app/api/checkout/route.ts`:

```ts
// Client POSTs: { items: [{ variantId: string, quantity: number }] }
// Client does NOT send prices. Ever.

export async function POST(req: Request) {
  const { items } = await req.json();

  // Validate shape, cap quantity (e.g. 1-10) to stop absurd orders
  // For each item: look up variant from PRODUCTS by id
  // If any variant id is unknown or out of stock -> 400
  // Build line_items using the SERVER-SIDE price

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [...],
    currency: 'aud',
    shipping_address_collection: { allowed_countries: ['AU', 'NZ'] },
    shipping_options: [...],           // flat rate is fine to start
    success_url: `${SITE_URL}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/shop`,
    metadata: {
      // compact record of what was ordered, for the webhook to read
      order: JSON.stringify(items),
    },
  });

  return Response.json({ url: session.url });
}
```

**The one non-negotiable rule of e-commerce:** the client sends *what* they want, never *what it costs*. If your route accepts a price from the request body, someone will buy a hoodie for one cent. Look the price up server-side from `PRODUCTS`, always.

Metadata has a 500-character limit per value — if the order JSON might exceed that, store the order in a DB/KV and put only the reference id in metadata.

### 2.3 Buy button

Client component: POSTs to `/api/checkout`, receives `{ url }`, does `window.location.href = url`. Disable the button while the request is in flight so double-clicks don't create two sessions.

### 2.4 Success page

`/shop/success` — reads `session_id` from the query string, retrieves the session **server-side**, confirms `payment_status === 'paid'`, and shows a confirmation with the order details.

Do **not** treat reaching this page as proof of payment for any purpose other than displaying a message. Anyone can navigate to `/shop/success` directly. Fulfilment is triggered by the webhook, not by the user landing here.

**Acceptance:** test card `4242 4242 4242 4242` completes a purchase, you land on the success page, and the payment appears in the Stripe test dashboard with the correct amount.

---

## Phase 3 — Webhook and fulfilment

This is where an order actually becomes a real printed thing.

### 3.1 Webhook route

`app/api/webhooks/stripe/route.ts`:

```ts
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const rawBody = await req.text();   // RAW text, not req.json()

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  // ... handle event
  return new Response(null, { status: 200 });
}
```

Two things people get wrong here:

- **You must use the raw request body.** Parsing to JSON first and re-stringifying changes the bytes and signature verification fails.
- **Signature verification is not optional.** Without it, your webhook URL is a public endpoint where anyone can POST a fake "payment succeeded" event and get free merch shipped to them.

### 3.2 Idempotency

Stripe retries webhooks on failure or timeout. Without protection, a retry places a second order and you ship two hoodies for one payment.

Store processed `event.id` values (Vercel KV, Upstash Redis, or a small DB table) and return 200 immediately if you've already seen one. Check before doing any work.

### 3.3 Placing the POD order

On `checkout.session.completed`:

1. Retrieve the session with line items expanded
2. Confirm `payment_status === 'paid'`
3. Parse the order from `session.metadata`
4. Map your internal variant ids → POD variant ids via `PRODUCTS`
5. Pull the shipping address from `session.customer_details` / `shipping_details`
6. POST to the POD provider's order API
7. Record the order (Stripe session id, POD order id, status)

### 3.4 Handle the failure case properly

**If the POD order fails after payment succeeded, you have taken someone's money and shipped nothing.** This is the worst failure mode in the whole system and it will eventually happen — API outage, bad address, discontinued variant.

Minimum viable handling:
- Log the failure somewhere you will actually see it (email yourself, or a Slack/Discord webhook — not just `console.error` in Vercel logs you never open)
- Store the order with `status: 'fulfilment_failed'` and enough detail to place it manually
- Do **not** return a non-200 to Stripe just to force retries if the failure isn't transient — you'll get retry storms

Manually placing the odd failed order is completely fine at your volume. Silently losing one is not.

### 3.5 Local testing

Use the Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`. It gives you a local `whsec_` secret. `stripe trigger checkout.session.completed` fires test events without going through checkout each time.

**Acceptance:** a test-mode purchase results in a real order appearing in your POD provider's dashboard (most have a draft/sample mode so it isn't actually printed).

---

## Phase 4 — Legal and policy pages

Not optional, and Stripe may ask for these during account activation.

- **Shipping policy** — dispatch time, delivery estimate, which countries, cost
- **Returns and refunds** — POD is made-to-order so you generally can't accept change-of-mind returns, and you can say so, but under **Australian Consumer Law you cannot disclaim consumer guarantees**. Faulty, misprinted, or not-as-described items must be remedied regardless of what your policy says. Write a policy that covers change-of-mind separately from faults.
- **Terms of sale**
- **Privacy policy** — update the existing one to cover order data and the fact that Stripe and your POD provider process customer information
- **Contact method** that works and that you check

Add these to the footer.

---

## Phase 5 — Go live

In order:

1. Complete Stripe account activation (ABN, bank details, identity)
2. Swap test keys for live keys in Vercel env vars — **production environment only**, keep test keys on preview/dev
3. Register the **production** webhook endpoint in the Stripe dashboard, get the live `whsec_`, add it
4. Set `NEXT_PUBLIC_SITE_URL` to the real domain
5. Take the POD provider out of any sample/draft mode
6. **Place one real order with your own card and your own money.** End to end. Let it actually print and ship to you. This is the only test that counts.
7. Then announce it

---

## Security checklist

Run through before going live:

- [ ] No secret key, POD API key, or webhook secret behind a `NEXT_PUBLIC_` prefix
- [ ] `.env.local` gitignored; no keys anywhere in git history (rotate anything ever committed, even in a deleted commit)
- [ ] Checkout route derives every price from `lib/products.ts`, never from the request body
- [ ] Quantity is validated and capped
- [ ] Unknown or out-of-stock variant ids are rejected with a 400
- [ ] Webhook verifies the Stripe signature using the raw body
- [ ] Webhook is idempotent on `event.id`
- [ ] Success page does not grant or confirm anything based on the URL alone
- [ ] Fulfilment failures alert you somewhere you'll see them
- [ ] Rate limiting on `/api/checkout` (someone hammering it creates junk sessions and noise)
- [ ] Next.js and dependencies on current patched versions

---

## Notes for handing this to Claude Code

- Feed it **one phase at a time** and verify before moving on. Handing over the whole spec at once tends to produce a lot of code that's hard to check.
- Phase 1 is safe to iterate on freely. Phases 2 and 3 deserve you actually reading the generated code — especially the price lookup in the checkout route and the signature verification in the webhook. Those two are where a bug costs money rather than time.
- Ask it to check current Stripe SDK syntax rather than relying on training data — the API version and helper names shift.
- Keep the POD provider integration in one module (`lib/pod.ts`) so swapping providers later touches one file.
