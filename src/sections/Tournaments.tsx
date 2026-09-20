import { type FormEvent, useState } from "react";
import { SectionHeading } from "../components/SectionHeading";
import { CalendarIcon, CrownIcon, TrophyIcon, UsersIcon } from "../components/icons";
import { useInView } from "../hooks/useInView";
import { TournamentPoster } from "./TournamentPoster";
import { TournamentRules, type Rule } from "./TournamentRules";
import "./Tournaments.css";

// Direct PayPal.me payment link — the simple option: no order verification,
// no backend, just a redirect to a real payment page. Trade-off accepted
// on purpose (no automatic proof-of-payment link back to a registration).
const PAYPAL_ME_USERNAME = "islemHamri";
function paypalMeLink(amountEuros: number): string {
  return `https://paypal.me/${PAYPAL_ME_USERNAME}/${amountEuros}EUR`;
}

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

export interface TournamentsProps {
  next?: NextTournament;
  /** No fabricated results — real events only, sourced from the streamer's own tournament flyers. */
  history?: PastTournament[];
  rules?: Rule[];
  discordInviteUrl?: string;
}

const DEFAULT_NEXT: NextTournament = {
  id: "cashprize-2-2026-09-26",
  game: "Call of Duty Warzone — Cashprize 2 — Rebirth Island",
  date: "Samedi 26 septembre 2026",
  time: "21H00",
  format: "Classé — Team de 3",
  capacity: "Team de 3",
  prize: "180€ / 120€ / 60€",
  registrationOpen: true,
  entryFeeCents: 1000,
  currency: "EUR",
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

// Sourced word-for-word from the official rules poster — do not summarize
// away specifics (the exact score threshold, the "no public/cross-team
// voice" clause, the screenshot requirement) that a paraphrase would drop.
const DEFAULT_RULES: Rule[] = [
  {
    number: 1,
    title: "Pour la victoire",
    description: "Match point en 50 points + Top 1 — gagnez en équipe !",
  },
  {
    number: 2,
    title: "Équipe de 3 obligatoire",
    description: "Le tournoi se joue uniquement par équipe de 3 joueurs. Aucune autre configuration ne sera acceptée.",
  },
  {
    number: 3,
    title: "Discord et vocaux obligatoires",
    description:
      "Il est obligatoire de rejoindre le serveur Discord du tournoi. Les vocaux sont réservés à chaque team (pas de vocaux publics ou hors team).",
  },
  {
    number: 4,
    title: "Pompe enflammée interdite",
    description: "L'utilisation du pompe enflammée est strictement interdite sous peine de disqualification.",
    restricted: true,
  },
  {
    number: 5,
    title: "Lance-roquettes interdit",
    description: "L'utilisation de tout type de lance-roquettes est strictement interdite sous peine de disqualification.",
    restricted: true,
  },
  {
    number: 6,
    title: "Avantages interdits",
    description: "Aucun accessoire, objet ou glitch donnant un avantage en jeu n'est autorisé (gilet, masque, stim, etc.).",
    restricted: true,
  },
  {
    number: 7,
    title: "Interdiction de quitter",
    description: "Il est strictement interdit de quitter le tournoi tant qu'il n'a pas fini. Toute équipe qui abandonne sera disqualifiée.",
    restricted: true,
  },
  {
    number: 8,
    title: "Screen obligatoire",
    description:
      "À chaque fin de game, vous devez envoyer un screen du tableau de score pour que la partie soit validée. Pas de screen = game non validée.",
  },
];

const PLACE_LABEL: Record<1 | 2 | 3, string> = { 1: "1ère place", 2: "2ème place", 3: "3ème place" };

type SubmitState = "idle" | "sent";

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

/**
 * Registration UI — no database is connected yet and, by explicit choice,
 * submitting does not trigger anything email-related (an earlier version
 * did; that surprised players by popping open a mail client on top of
 * PayPal). Paid entries now just open the direct PayPal.me payment link —
 * the payment note the player writes there is the registration record.
 * Questions go through the dedicated Contact section instead, never an
 * automatic action tied to this button.
 */
export function Tournaments({
  next = DEFAULT_NEXT,
  history = DEFAULT_HISTORY,
  rules = DEFAULT_RULES,
  discordInviteUrl,
}: TournamentsProps) {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [isCaptain, setIsCaptain] = useState(false);

  const hasEntryFee = Boolean(next.entryFeeCents && next.entryFeeCents > 0);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (hasEntryFee) {
      window.open(paypalMeLink(next.entryFeeCents! / 100), "_blank", "noopener,noreferrer");
    }
    setSubmitState("sent");
  }

  const { ref: nextRef, visible: nextVisible } = useInView<HTMLDivElement>();
  const { ref: formRef, visible: formVisible } = useInView<HTMLFormElement>();
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

            {hasEntryFee && (
              <p className="registration__payment-hint">
                Un onglet PayPal va s'ouvrir pour régler les {(next.entryFeeCents! / 100).toFixed(0)}€ — indique
                bien ton pseudo dans le message du paiement, c'est ce qui confirme ton inscription.
              </p>
            )}

            <button type="submit" className="registration__submit cta-pulse">
              {hasEntryFee ? `S'inscrire — ${(next.entryFeeCents! / 100).toFixed(0)}€` : "S'inscrire"}
              <span className="cta-shine" aria-hidden="true" />
            </button>

            <p className="registration__status" role="status" aria-live="polite">
              {submitState === "sent" &&
                (hasEntryFee
                  ? "Un onglet PayPal vient de s'ouvrir — n'oublie pas d'indiquer ton pseudo dans le paiement !"
                  : `Merci ! Rejoins le Discord (#3 des règles) pour la suite.`)}
            </p>
          </form>
        </div>

        <TournamentRules rules={rules} discordInviteUrl={discordInviteUrl} />

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
