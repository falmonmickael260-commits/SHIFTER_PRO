import { useEffect, useRef, useState } from "react";
import { mountPayPalButton, type RegistrationPaymentInput } from "../lib/paypal";

interface PayPalButtonProps {
  payment: RegistrationPaymentInput;
  onPaid: () => void;
}

/** Renders the real PayPal button once `payment` is available (i.e. the
 * player submitted the registration form). Surfaces setup/network errors
 * inline instead of failing silently. */
export function PayPalButton({ payment, onPaid }: PayPalButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    mountPayPalButton(container, payment, { onPaid, onError: setError })
      .then((result) => {
        if (cancelled) result.cleanup();
        else cleanup = result.cleanup;
      })
      .catch((err: Error) => setError(err.message));

    return () => {
      cancelled = true;
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payment.tournamentId, payment.entryFeeCents]);

  return (
    <div>
      <div ref={containerRef} />
      {error && <p className="paypal-button__error">{error}</p>}
    </div>
  );
}
