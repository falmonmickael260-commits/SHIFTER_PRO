// POST { orderId }
// Called from the browser right after the buyer approves the PayPal
// payment (onApprove). Captures the funds server-side and only then marks
// the registration 'paid' — this is what actually confirms the money
// moved; the paypal-webhook function is the safety net for cases where
// this call never happens (tab closed, network drop mid-flow).
import { createClient } from "jsr:@supabase/supabase-js@2";
import { capturePayPalOrder } from "../_shared/paypal.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return new Response(JSON.stringify({ error: "Missing orderId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const capture = await capturePayPalOrder(orderId);
    const paid = capture.status === "COMPLETED";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error } = await supabase
      .from("tournament_registrations")
      .update({ payment_status: paid ? "paid" : "failed" })
      .eq("paypal_order_id", orderId);

    if (error) throw error;

    return new Response(JSON.stringify({ status: capture.status, paid }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Could not capture order" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
