// Sends a tournament registration to the streamer's own inbox — no
// database yet, so this is the real interim path rather than a fake
// "saved" state. Two ways it can actually reach the inbox:
//
// 1. Automatic (VITE_WEB3FORMS_ACCESS_KEY set): POSTs to Web3Forms
//    (api.web3forms.com/submit — docs.web3forms.com), a free static-site
//    form-to-email service. The player does nothing further.
// 2. Fallback (no key configured yet): opens a pre-filled mailto: draft —
//    the player has to hit send themselves, but it still works with zero
//    setup.

export interface RegistrationFields {
  pseudo: string;
  activisionId: string;
  discord: string;
  team: string;
  isCaptain: boolean;
}

const REGISTRATION_EMAIL = "Vantm26100@hotmail.com";

function buildRegistrationMailto(fields: RegistrationFields): string {
  const subject = `Inscription tournoi — ${fields.pseudo}`;
  const body = [
    `Pseudo : ${fields.pseudo}`,
    `Activision ID : ${fields.activisionId}`,
    `Discord : ${fields.discord}`,
    `Équipe : ${fields.team || "—"}`,
    `Capitaine : ${fields.isCaptain ? "Oui" : "Non"}`,
  ].join("\n");
  return `mailto:${REGISTRATION_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export type SendRegistrationResult = "sent-automatically" | "opened-email-draft";

export async function sendRegistration(fields: RegistrationFields): Promise<SendRegistrationResult> {
  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

  if (accessKey) {
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `Inscription tournoi — ${fields.pseudo}`,
          Pseudo: fields.pseudo,
          "Activision ID": fields.activisionId,
          Discord: fields.discord,
          Équipe: fields.team || "—",
          Capitaine: fields.isCaptain ? "Oui" : "Non",
        }),
      });
      if (res.ok) return "sent-automatically";
    } catch {
      // fall through to the mailto: fallback below
    }
  }

  window.location.href = buildRegistrationMailto(fields);
  return "opened-email-draft";
}
