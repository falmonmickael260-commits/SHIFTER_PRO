import { supabase } from "./supabase";

// Client-side half of the PayPal integration — the server half (order
// create/capture with the client secret) lives in supabase/functions.
// Docs verified before writing this: developer.paypal.com/sdk/js/reference
// (Web SDK v6 — createInstance / createPayPalOneTimePaymentSession /
// <paypal-button> + manual click -> session.start()) and
// developer.paypal.com/v5-v6 (v6 is current; v4/v5 are the ones being
// phased out).

declare global {
  interface Window {
    paypal?: {
      createInstance: (opts: {
        clientId: string;
        components: string[];
      }) => Promise<PayPalSdkInstance>;
    };
  }
}

interface PayPalSdkInstance {
  createPayPalOneTimePaymentSession: (opts: {
    onApprove: (data: { orderId: string }) => void | Promise<void>;
    onCancel?: () => void;
    onError?: (err: unknown) => void;
  }) => Promise<PayPalPaymentSession> | PayPalPaymentSession;
}

interface PayPalPaymentSession {
  start: (
    opts: { presentationMode: "auto" },
    orderPromise: Promise<{ orderId: string }>,
  ) => Promise<void>;
}

const SDK_SRC = {
  sandbox: "https://www.sandbox.paypal.com/web-sdk/v6/core",
  live: "https://www.paypal.com/web-sdk/v6/core",
} as const;

let sdkLoadPromise: Promise<void> | null = null;

function loadPayPalSdk(env: "sandbox" | "live"): Promise<void> {
  if (window.paypal) return Promise.resolve();
  if (sdkLoadPromise) return sdkLoadPromise;
  sdkLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SDK_SRC[env];
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Impossible de charger le SDK PayPal"));
    document.body.appendChild(script);
  });
  return sdkLoadPromise;
}

export interface RegistrationPaymentInput {
  tournamentId: string;
  pseudo: string;
  activisionId: string;
  discord: string;
  team?: string;
  isCaptain: boolean;
  entryFeeCents: number;
  currency: string;
}

export interface PayPalMountResult {
  /** Call on unmount to avoid leaking the button/listener. */
  cleanup: () => void;
}

/**
 * Renders a real PayPal "Pay" button into `container` and wires it to the
 * create-paypal-order / capture-paypal-order edge functions. Both
 * VITE_PAYPAL_CLIENT_ID and a configured Supabase project are required —
 * this throws a descriptive error rather than silently rendering nothing,
 * so a misconfigured deploy is obvious instead of a mysteriously missing
 * button.
 */
export async function mountPayPalButton(
  container: HTMLElement,
  input: RegistrationPaymentInput,
  callbacks: { onPaid: () => void; onError: (message: string) => void },
): Promise<PayPalMountResult> {
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined;
  const env = import.meta.env.VITE_PAYPAL_ENV === "live" ? "live" : "sandbox";

  if (!clientId) throw new Error("VITE_PAYPAL_CLIENT_ID manquant");
  if (!supabase) throw new Error("Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) non configuré");

  await loadPayPalSdk(env);
  const sdkInstance = await window.paypal!.createInstance({
    clientId,
    components: ["paypal-payments"],
  });

  const button = document.createElement("paypal-button");
  button.setAttribute("type", "pay");
  container.appendChild(button);

  const session = await sdkInstance.createPayPalOneTimePaymentSession({
    onApprove: async ({ orderId }) => {
      const { data, error } = await supabase!.functions.invoke("capture-paypal-order", {
        body: { orderId },
      });
      if (error || !data?.paid) {
        callbacks.onError("Le paiement n'a pas pu être confirmé — contacte-nous sur Discord si l'argent a été débité.");
        return;
      }
      callbacks.onPaid();
    },
    onCancel: () => {},
    onError: () => callbacks.onError("Erreur PayPal — réessaie dans un instant."),
  });

  async function handleClick() {
    await session.start(
      { presentationMode: "auto" },
      supabase!.functions.invoke("create-paypal-order", { body: input }).then(({ data, error }) => {
        if (error || !data?.orderId) throw new Error("Impossible de créer la commande PayPal");
        return { orderId: data.orderId as string };
      }),
    );
  }
  button.addEventListener("click", handleClick);

  return {
    cleanup: () => {
      button.removeEventListener("click", handleClick);
      container.removeChild(button);
    },
  };
}
