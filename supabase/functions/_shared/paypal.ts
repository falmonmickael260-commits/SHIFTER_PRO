// Server-side PayPal Orders v2 helpers (Deno / Supabase Edge Functions).
// Never import this from the frontend — it needs PAYPAL_CLIENT_SECRET,
// which must only ever live as a Supabase Edge Function secret
// (`supabase secrets set PAYPAL_CLIENT_SECRET=...`), never in the
// repo's own .env or any VITE_-prefixed variable.
//
// Docs verified before writing this:
// https://developer.paypal.com/docs/checkout/standard/integrate/ (Orders v2,
// server-side create + capture) and https://developer.paypal.com/v5-v6
// (current JS SDK — the client side of this lives in src/lib/paypal.ts).

const PAYPAL_ENV = Deno.env.get("PAYPAL_ENV") === "live" ? "live" : "sandbox";

const PAYPAL_API_BASE =
  PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

async function getAccessToken(): Promise<string> {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    throw new Error("PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET are not configured");
  }

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    throw new Error(`PayPal OAuth failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.access_token as string;
}

export interface CreateOrderInput {
  amountCents: number;
  currency: string;
  reference: string;
  description: string;
}

export async function createPayPalOrder(input: CreateOrderInput) {
  const accessToken = await getAccessToken();
  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: input.reference,
          description: input.description,
          amount: {
            currency_code: input.currency,
            value: (input.amountCents / 100).toFixed(2),
          },
        },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`PayPal create order failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getAccessToken();
  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`PayPal capture failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}
