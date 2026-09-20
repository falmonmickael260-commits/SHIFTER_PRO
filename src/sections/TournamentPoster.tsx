import { useInView } from "../hooks/useInView";
import { CalendarIcon, CrownIcon, TrophyIcon, UsersIcon } from "../components/icons";
import "./TournamentPoster.css";

// Official CASHPRIZE 2 poster — served through Cloudinary's f_auto,q_auto
// (auto format/compression) and a width-matched srcset. Same artwork,
// same pixels; only file size and delivery size change, so this never
// alters the poster itself.
const POSTER_BASE =
  "https://res.cloudinary.com/dkm8cbylh/image/upload/v1789926261/ChatGPT_Image_20_sept._2026_19_44_08_pazjnq.png";

function posterUrl(width: number) {
  return POSTER_BASE.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
}

const POSTER_SRCSET = [480, 768, 1024, 1536]
  .map((w) => `${posterUrl(w)} ${w}w`)
  .join(", ");

/**
 * Standalone addition, deliberately not wired into the existing
 * next-tournament / registration / rules / history block above — this is
 * the official CASHPRIZE 2 poster plus its own info cards, in the poster's
 * own black/neon-green identity (scoped to this block only via
 * --poster-accent, the rest of the site keeps its established palette).
 */
export function TournamentPoster() {
  const { ref, visible } = useInView<HTMLDivElement>();

  return (
    <div ref={ref} className={`tournament-poster reveal${visible ? " reveal--visible" : ""}`}>
      <div className="tournament-poster__image-wrap">
        <img
          className="tournament-poster__image"
          src={posterUrl(768)}
          srcSet={POSTER_SRCSET}
          sizes="(max-width: 760px) 92vw, 420px"
          width={1024}
          height={1536}
          alt="Affiche officielle du tournoi Call of Duty Warzone CASHPRIZE 2, SHIFTER_PRO26 — samedi 26 septembre 2026, 21h00, Rebirth Island, mode classé en équipe de 3, entrée 10€ par joueur / 30€ par équipe, cash prize 180€ pour la 1ère place, 120€ pour la 2ème, 60€ pour la 3ème, en direct sur Twitch."
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="tournament-poster__info">
        <span className="tournament-poster__badge">
          <CrownIcon aria-hidden="true" /> Warzone — Cashprize 2
        </span>
        <h3 className="tournament-poster__title">SHIFTER_PRO26</h3>

        <div className="tournament-poster__date">
          <span className="tournament-poster__date-label">
            <CalendarIcon aria-hidden="true" /> Rendez-vous
          </span>
          <span className="tournament-poster__date-value">Samedi 26 Septembre 2026</span>
          <span className="tournament-poster__date-time">21H00 — Rebirth Island</span>
        </div>

        <div className="tournament-poster__facts">
          <div className="tournament-poster__fact">
            <UsersIcon aria-hidden="true" />
            <div>
              <span className="tournament-poster__fact-label">Format</span>
              <span className="tournament-poster__fact-value">Classé — Team de 3</span>
            </div>
          </div>
          <div className="tournament-poster__fact">
            <TrophyIcon aria-hidden="true" />
            <div>
              <span className="tournament-poster__fact-label">Inscription</span>
              <span className="tournament-poster__fact-value">10€ / joueur — 30€ / team</span>
            </div>
          </div>
        </div>

        <div className="tournament-poster__podium">
          <div className="tournament-poster__prize tournament-poster__prize--1">
            <CrownIcon aria-hidden="true" />
            <span>Team #1</span>
            <strong>180€</strong>
          </div>
          <div className="tournament-poster__prize tournament-poster__prize--2">
            <CrownIcon aria-hidden="true" />
            <span>Team #2</span>
            <strong>120€</strong>
          </div>
          <div className="tournament-poster__prize tournament-poster__prize--3">
            <CrownIcon aria-hidden="true" />
            <span>Team #3</span>
            <strong>60€</strong>
          </div>
        </div>

        <div className="tournament-poster__cta-row">
          <a className="tournament-poster__cta tournament-poster__cta--primary" href="#tournament-registration">
            S'inscrire au tournoi
            <span className="cta-shine" aria-hidden="true" />
          </a>
          <a
            className="tournament-poster__cta tournament-poster__cta--secondary"
            href="https://twitch.tv/shifter_pro2"
            target="_blank"
            rel="noreferrer"
          >
            Voir le Live Twitch
          </a>
        </div>
      </div>
    </div>
  );
}
