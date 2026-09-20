// PayPal calls this URL directly (configure it in the PayPal Developer
// Dashboard -> your app -> Webhooks) whenever an order's status changes.
// This is the authoritative confirmation — capture-paypal-order already
// marks a registration paid right after checkout, but a buyer can close
// the tab before that call finishes, or the network can drop it. The
// webhook is what PayPal itself guarantees will still arrive, so this is
// what a real reconciliation job (or an admin dashboard) should trust.
//
// Docs verified before writing this: developer.paypal.com/api/rest/webhooks
// (POST /v1/notifications/verify-webhook-signature; PayPal sends
// paypal-transmission-id / -time / -sig / -cert-url / -auth-algo headers).
import { createClient } from "jsr:@supabase/supabase-js@2";

const PAYPAL_ENV = Deno.env.get("PAYPAL_ENV") === "live" ? "live" : "sandbox";
const PAYPAL_API_BASE =
  PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

async function getAccessToken(): Promise<string> {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID")!;
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET")!;
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  return data.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const rawBody = await req.text();
  const webhookEvent = JSON.parse(rawBody);

  const webhookId = Deno.env.get("PAYPAL_WEBHOOK_ID");
  if (!webhookId) {
    console.error("PAYPAL_WEBHOOK_ID is not configured — refusing to trust unverified webhook");
    return new Response("Webhook not configured", { status: 500 });
  }

  try {
    const accessToken = await getAccessToken();
    const verifyRes = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transmission_id: req.headers.get("paypal-transmission-id"),
        transmission_time: req.headers.get("paypal-transmission-time"),
        cert_url: req.headers.get("paypal-cert-url"),
        auth_algo: req.headers.get("paypal-auth-algo"),
        transmission_sig: req.headers.get("paypal-transmission-sig"),
        webhook_id: webhookId,
        webhook_event: webhookEvent,
      }),
    });
    const verification = await verifyRes.json();
    if (verification.verification_status !== "SUCCESS") {
      console.error("PayPal webhook signature verification failed", verification);
      return new Response("Invalid signature", { status: 400 });
    }

    const eventType = webhookEvent.event_type as string;
    const orderId =
      webhookEvent.resource?.supplementary_data?.related_ids?.order_id ??
      webhookEvent.resource?.id;

    if (!orderId) {
      return new Response("OK (no order id on event)", { status: 200 });
    }

    let nextStatus: "paid" | "failed" | null = null;
    if (eventType === "PAYMENT.CAPTURE.COMPLETED" || eventType === "CHECKOUT.ORDER.APPROVED") {
      nextStatus = "paid";
    } else if (
      eventType === "PAYMENT.CAPTURE.DENIED" ||
      eventType === "CHECKOUT.ORDER.VOIDED" ||
      eventType === "PAYMENT.CAPTURE.DECLINED"
    ) {
      nextStatus = "failed";
    }

    if (nextStatus) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      const { error } = await supabase
        .from("tournament_registrations")
        .update({ payment_status: nextStatus })
        .eq("paypal_order_id", orderId);
      if (error) console.error("Failed to update registration from webhook", error);
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Webhook processing error", { status: 500 });
  }
});
