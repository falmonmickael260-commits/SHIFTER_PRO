import { type FormEvent, useState } from "react";
import { SectionHeading } from "../components/SectionHeading";
import { CalendarIcon, CrownIcon, ShieldAlertIcon, TrophyIcon, UsersIcon } from "../components/icons";
import { useInView } from "../hooks/useInView";
import { PayPalButton } from "../components/PayPalButton";
import type { RegistrationPaymentInput } from "../lib/paypal";
import { TournamentPoster } from "./TournamentPoster";
import "./Tournaments.css";

export interface NextTournament {
  id: string;
  game: string;
  date?: string;
  time?: string;
  format: string;
  capacity: string;
  prize?: string;
  registrationOpen: boolean;
  /** Omit (or 0) for free entry — every tournament so far. Set this only
   * once a real paid-entry format exists; it turns on the PayPal step. */
  entryFeeCents?: number;
  currency?: string;
}

export interface PodiumEntry {
  place: 1 | 2 | 3;
  team: string;
  prize?: string;
}

export interface PastTournament {
  id: string;
  name: string;
  date: string;
  podium: PodiumEntry[];
  note?: string;
}

export interface Rule {
  text: string;
  restricted?: boolean;
}

export interface TournamentsProps {
  next?: NextTournament;
  /** No fabricated results — real events only, sourced from the streamer's own tournament flyers. */
  history?: PastTournament[];
  rules?: Rule[];
}

const DEFAULT_NEXT: NextTournament = {
  id: "next",
  game: "Call of Duty Warzone — Rebirth Island",
  date: "Environ 10 jours après le 19/09/2026 — date exacte à confirmer",
  format: "Trio — Ranked",
  capacity: "À confirmer",
  registrationOpen: false,
};

const DEFAULT_HISTORY: PastTournament[] = [
  {
    id: "warzone-2026-09-19",
    name: "Tournoi Warzone — Rebirth Island",
    date: "19 septembre 2026",
    podium: [
      { place: 1, team: "Team DINAZ", prize: "150€" },
      { place: 2, team: "Team MK's Elite", prize: "50€" },
      { place: 3, team: "Team SOFT", prize: "Cadeau" },
    ],
    note: "Un grand merci à tous ceux qui ont participé — vous avez fait de ce tournoi une vraie réussite !",
  },
];

const DEFAULT_RULES: Rule[] = [
  { text: "Mode : Trio — Ranked" },
  { text: "3 Top 1 pour gagner" },
  { text: "Pompe enflammée interdite", restricted: true },
  { text: "Lance-roquettes interdit", restricted: true },
  { text: "Glitch & triche = banni instantanément", restricted: true },
  { text: "Priorité aux équipes inscrites" },
  { text: "Serveur Discord obligatoire pour être en vocal — absence = expulsion instantanée" },
  { text: "Respect, ponctualité, bienveillance" },
  { text: "Tournoi retransmis en direct sur TikTok" },
];

const PLACE_LABEL: Record<1 | 2 | 3, string> = { 1: "1ère place", 2: "2ème place", 3: "3ème place" };

type SubmitState = "idle" | "awaiting-payment" | "paid" | "sent";

function Podium({ tournament }: { tournament: PastTournament }) {
  const ordered = [...tournament.podium].sort((a, b) => a.place - b.place);
  return (
    <div className="podium-card">
      <div className="podium-card__head">
        <span className="podium-card__name">{tournament.name}</span>
        <span className="podium-card__date">{tournament.date}</span>
      </div>
      <div className="podium-card__ranks">
        {ordered.map((entry) => (
          <div key={entry.place} className={`podium-rank podium-rank--${entry.place}`}>
            <CrownIcon className="podium-rank__crown" aria-hidden="true" />
            <span className="podium-rank__place">{PLACE_LABEL[entry.place]}</span>
            <span className="podium-rank__team">{entry.team}</span>
            {entry.prize && <span className="podium-rank__prize">{entry.prize}</span>}
          </div>
        ))}
      </div>
      {tournament.note && <p className="podium-card__note">{tournament.note}</p>}
    </div>
  );
}

const REGISTRATION_EMAIL = "Vantm26100@hotmail.com";

function buildRegistrationMailto(fields: {
  pseudo: string;
  activisionId: string;
  discord: string;
  team: string;
  isCaptain: boolean;
}) {
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

/**
 * Registration UI — no database is connected yet, so submitting opens a
 * pre-filled email to the streamer's own inbox (a real, working interim
 * path, not a fake "saved" state) instead of pretending the entry was
 * stored. The field set (pseudo / Activision ID / Discord / team /
 * captain) is exactly what a future Supabase table would need, so wiring
 * that up later is a matter of an API call here, not a redesign.
 */
export function Tournaments({ next = DEFAULT_NEXT, history = DEFAULT_HISTORY, rules = DEFAULT_RULES }: TournamentsProps) {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [isCaptain, setIsCaptain] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<RegistrationPaymentInput | null>(null);

  const hasEntryFee = Boolean(next.entryFeeCents && next.entryFeeCents > 0);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasEntryFee) {
      const form = new FormData(event.currentTarget);
      window.location.href = buildRegistrationMailto({
        pseudo: String(form.get("pseudo") ?? ""),
        activisionId: String(form.get("activisionId") ?? ""),
        discord: String(form.get("discord") ?? ""),
        team: String(form.get("team") ?? ""),
        isCaptain,
      });
      setSubmitState("sent");
      return;
    }

    const form = new FormData(event.currentTarget);
    setPendingPayment({
      tournamentId: next.id,
      pseudo: String(form.get("pseudo") ?? ""),
      activisionId: String(form.get("activisionId") ?? ""),
      discord: String(form.get("discord") ?? ""),
      team: String(form.get("team") ?? "") || undefined,
      isCaptain,
      entryFeeCents: next.entryFeeCents!,
      currency: next.currency ?? "EUR",
    });
    setSubmitState("awaiting-payment");
  }

  const { ref: nextRef, visible: nextVisible } = useInView<HTMLDivElement>();
  const { ref: formRef, visible: formVisible } = useInView<HTMLFormElement>();
  const { ref: rulesRef, visible: rulesVisible } = useInView<HTMLDivElement>();
  const { ref: historyRef, visible: historyVisible } = useInView<HTMLDivElement>();

  return (
    <section className="tournaments" id="tournaments">
      <div className="section-glow" aria-hidden="true" />
      <div className="tournaments__inner">
        <SectionHeading eyebrow="COMPETITION // SHIFTER_PRO26" title="Tournaments" />

        <div className="tournaments__layout">
          <div ref={nextRef} className={`next-tournament reveal${nextVisible ? " reveal--visible" : ""}`}>
            <div className="next-tournament__badge">
              <TrophyIcon /> Prochain tournoi
            </div>
            <h3 className="next-tournament__game">{next.game}</h3>

            <dl className="next-tournament__grid">
              <div>
                <dt><CalendarIcon /> Date</dt>
                <dd>{next.date ?? "À confirmer"}</dd>
              </div>
              <div>
                <dt><CalendarIcon /> Heure</dt>
                <dd>{next.time ?? "À confirmer"}</dd>
              </div>
              <div>
                <dt><UsersIcon /> Format</dt>
                <dd>{next.format}</dd>
              </div>
              <div>
                <dt><UsersIcon /> Places</dt>
                <dd>{next.capacity}</dd>
              </div>
              <div>
                <dt><TrophyIcon /> Récompense</dt>
                <dd>{next.prize ?? "À confirmer"}</dd>
              </div>
              <div>
                <dt>Statut</dt>
                <dd>
                  <span className="next-tournament__status" data-open={next.registrationOpen ? "true" : "false"}>
                    {next.registrationOpen ? "Inscriptions ouvertes" : "Bientôt"}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <form
            id="tournament-registration"
            ref={formRef}
            className={`registration reveal${formVisible ? " reveal--visible" : ""}`}
            onSubmit={handleSubmit}
          >
            <h3 className="registration__title">
              Inscription
              {hasEntryFee && (
                <span className="registration__fee">
                  {(next.entryFeeCents! / 100).toFixed(2)} {next.currency ?? "EUR"} / joueur
                </span>
              )}
            </h3>

            {submitState !== "awaiting-payment" && submitState !== "paid" && (
              <>
                <label className="registration__field">
                  <span>Pseudo</span>
                  <input type="text" name="pseudo" required autoComplete="nickname" />
                </label>
                <label className="registration__field">
                  <span>Activision ID</span>
                  <input type="text" name="activisionId" required placeholder="Pseudo#1234" />
                </label>
                <label className="registration__field">
                  <span>Discord</span>
                  <input type="text" name="discord" required placeholder="pseudo.discord" />
                </label>
                <label className="registration__field">
                  <span>Équipe (optionnel)</span>
                  <input type="text" name="team" />
                </label>
                <label className="registration__checkbox">
                  <input type="checkbox" checked={isCaptain} onChange={(e) => setIsCaptain(e.target.checked)} />
                  <span>Je suis capitaine de l'équipe</span>
                </label>

                <button type="submit" className="registration__submit cta-pulse">
                  {hasEntryFee ? "Continuer vers le paiement" : "S'inscrire"}
                  <span className="cta-shine" aria-hidden="true" />
                </button>
              </>
            )}

            {submitState === "awaiting-payment" && pendingPayment && (
              <div className="registration__payment">
                <p className="registration__payment-hint">
                  Paiement sécurisé par PayPal — l'inscription n'est confirmée qu'une fois le paiement validé.
                </p>
                <PayPalButton payment={pendingPayment} onPaid={() => setSubmitState("paid")} />
              </div>
            )}

            <p className="registration__status" role="status" aria-live="polite">
              {submitState === "sent" &&
                "Ton client email va s'ouvrir avec ta demande d'inscription pré-remplie — il ne reste plus qu'à l'envoyer pour la valider."}
              {submitState === "paid" && "Paiement confirmé — ton inscription est enregistrée. À bientôt en jeu !"}
            </p>
          </form>
        </div>

        <div ref={rulesRef} className={`tournament-rules reveal${rulesVisible ? " reveal--visible" : ""}`}>
          <h3 className="tournament-rules__title">Règles du tournoi</h3>
          <ul className="tournament-rules__list">
            {rules.map((rule) => (
              <li key={rule.text} className="tournament-rules__item" data-restricted={rule.restricted ? "true" : "false"}>
                <ShieldAlertIcon aria-hidden="true" />
                <span>{rule.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div ref={historyRef} className={`tournament-history reveal${historyVisible ? " reveal--visible" : ""}`}>
          <h3 className="tournament-history__title">Historique</h3>
          {history.length === 0 ? (
            <p className="tournament-history__empty">
              L'historique des tournois s'affichera ici après le premier événement.
            </p>
          ) : (
            <div className="tournament-history__list">
              {history.map((entry) => (
                <Podium key={entry.id} tournament={entry} />
              ))}
            </div>
          )}
        </div>

        <TournamentPoster />
      </div>
    </section>
  );
}
