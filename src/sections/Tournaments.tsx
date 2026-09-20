import { type FormEvent, useState } from "react";
import { SectionHeading } from "../components/SectionHeading";
import { CalendarIcon, TrophyIcon, UsersIcon } from "../components/icons";
import { useInView } from "../hooks/useInView";
import "./Tournaments.css";

export interface NextTournament {
  game: string;
  date?: string;
  time?: string;
  format: string;
  capacity: string;
  prize?: string;
  registrationOpen: boolean;
}

export interface PastTournament {
  id: string;
  name: string;
  date: string;
  result: string;
}

export interface TournamentsProps {
  next?: NextTournament;
  /** No fabricated results — genuinely empty until a first real event happened. */
  history?: PastTournament[];
}

const DEFAULT_NEXT: NextTournament = {
  game: "Call of Duty",
  format: "À confirmer",
  capacity: "À confirmer",
  registrationOpen: false,
};

type SubmitState = "idle" | "sent";

/**
 * Registration UI only — no backend is connected yet. Submitting shows an
 * honest status message rather than pretending the entry was saved; the
 * field set (pseudo / Activision ID / Discord / team / captain) is exactly
 * what a future Supabase table would need, so wiring it up later is a
 * matter of an API call here, not a redesign.
 */
export function Tournaments({ next = DEFAULT_NEXT, history = [] }: TournamentsProps) {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [isCaptain, setIsCaptain] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("sent");
  }

  const { ref: nextRef, visible: nextVisible } = useInView<HTMLDivElement>();
  const { ref: formRef, visible: formVisible } = useInView<HTMLFormElement>();
  const { ref: historyRef, visible: historyVisible } = useInView<HTMLDivElement>();

  return (
    <section className="tournaments" id="tournaments">
      <div className="tournaments__inner">
        <SectionHeading eyebrow="COMPETITION" title="Tournaments" />

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
            ref={formRef}
            className={`registration reveal${formVisible ? " reveal--visible" : ""}`}
            onSubmit={handleSubmit}
          >
            <h3 className="registration__title">Inscription</h3>

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

            <button type="submit" className="registration__submit">
              S'inscrire
            </button>

            <p className="registration__status" role="status" aria-live="polite">
              {submitState === "sent" &&
                "Formulaire reçu — les inscriptions ouvriront officiellement dès que la base de données sera connectée. Rejoins le Discord pour être prévenu."}
            </p>
          </form>
        </div>

        <div ref={historyRef} className={`tournament-history reveal${historyVisible ? " reveal--visible" : ""}`}>
          <h3 className="tournament-history__title">Historique</h3>
          {history.length === 0 ? (
            <p className="tournament-history__empty">
              L'historique des tournois s'affichera ici après le premier événement.
            </p>
          ) : (
            <ul className="tournament-history__list">
              {history.map((entry) => (
                <li key={entry.id} className="tournament-history__item">
                  <span className="tournament-history__name">{entry.name}</span>
                  <span className="tournament-history__date">{entry.date}</span>
                  <span className="tournament-history__result">{entry.result}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
