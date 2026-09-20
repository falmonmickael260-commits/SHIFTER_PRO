// POST { tournamentId, pseudo, activisionId, discord, team?, isCaptain,
//        entryFeeCents, currency }
// Creates the registration row (payment_status: 'pending') and the matching
// PayPal order, and returns { orderId, registrationId } to the browser.
// The browser never decides the amount — entryFeeCents is only ever an
// input here for convenience; if this ever needs to be authoritative
// against a real price list, look it up from `tournamentId` server-side
// instead of trusting the client value.
import { createClient } from "jsr:@supabase/supabase-js@2";
import { createPayPalOrder } from "../_shared/paypal.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    const { tournamentId, pseudo, activisionId, discord, team, isCaptain, entryFeeCents, currency } = body;

    if (!tournamentId || !pseudo || !activisionId || !discord || !entryFeeCents) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const order = await createPayPalOrder({
      amountCents: entryFeeCents,
      currency: currency ?? "EUR",
      reference: `${tournamentId}-${Date.now()}`,
      description: `Inscription tournoi ${tournamentId} — ${pseudo}`,
    });

    const { data, error } = await supabase
      .from("tournament_registrations")
      .insert({
        tournament_id: tournamentId,
        pseudo,
        activision_id: activisionId,
        discord,
        team: team ?? null,
        is_captain: Boolean(isCaptain),
        entry_fee_cents: entryFeeCents,
        currency: currency ?? "EUR",
        payment_status: "pending",
        paypal_order_id: order.id,
      })
      .select("id")
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ orderId: order.id, registrationId: data.id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Could not create order" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
