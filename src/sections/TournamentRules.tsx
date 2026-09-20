import { useEffect, useState } from "react";
import { useInView } from "../hooks/useInView";
import { ShieldAlertIcon, TrophyIcon } from "../components/icons";
import "./TournamentRules.css";

export interface Rule {
  number: number;
  title: string;
  description: string;
  restricted?: boolean;
}

export interface TournamentRulesProps {
  rules: Rule[];
}

// Official rules poster — same Cloudinary asset used for CASHPRIZE 2,
// served through f_auto,q_auto (format/compression only, same pixels) with
// width-matched variants. The thumbnail stays light for fast loading; the
// lightbox requests a near-full-resolution, best-quality version.
const POSTER_BASE =
  "https://res.cloudinary.com/dkm8cbylh/image/upload/v1789937272/ChatGPT_Image_20_sept._2026_22_47_38_xidued.png";

function posterUrl(transform: string) {
  return POSTER_BASE.replace("/upload/", `/upload/${transform}/`);
}

const THUMB_SRCSET = [420, 640, 900]
  .map((w) => `${posterUrl(`f_auto,q_auto,w_${w}`)} ${w}w`)
  .join(", ");
const LIGHTBOX_SRC = posterUrl("f_auto,q_auto:best,w_1600");

export function TournamentRules({ rules }: TournamentRulesProps) {
  const { ref, visible } = useInView<HTMLDivElement>();
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  return (
    <div ref={ref} className={`tournament-rules-block reveal${visible ? " reveal--visible" : ""}`}>
      <h3 className="tournament-rules-block__title">Règles du tournoi</h3>

      <div className="tournament-rules-block__layout">
        <button
          type="button"
          className="rules-poster"
          onClick={() => setLightboxOpen(true)}
          aria-label="Agrandir l'affiche officielle des règles du tournoi"
        >
          <img
            className="rules-poster__image"
            src={posterUrl("f_auto,q_auto,w_640")}
            srcSet={THUMB_SRCSET}
            sizes="(max-width: 760px) 92vw, 380px"
            width={1024}
            height={1536}
            alt="Affiche officielle des règles du tournoi SHIFTER_PRO26 : #1 pour la victoire, match point à 50 points plus top 1, gagnez en équipe. #2 équipe de 3 obligatoire. #3 rejoindre le serveur Discord et les vocaux réservés à chaque team. #4 pompe enflammée interdite. #5 lance-roquettes interdit. #6 tout accessoire ou objet apportant un avantage en jeu interdit. #7 interdiction de quitter le tournoi. #8 envoyer obligatoirement un screen du tableau de score à chaque fin de game."
            loading="lazy"
            decoding="async"
          />
          <span className="rules-poster__zoom" aria-hidden="true">
            Agrandir
          </span>
        </button>

        <ul className="tournament-rules-block__list">
          {rules.map((rule) => (
            <li
              key={rule.number}
              className="rule-card"
              data-restricted={rule.restricted ? "true" : "false"}
            >
              <span className="rule-card__number">#{rule.number}</span>
              <div className="rule-card__body">
                <div className="rule-card__heading">
                  {rule.restricted ? <ShieldAlertIcon aria-hidden="true" /> : <TrophyIcon aria-hidden="true" />}
                  <h4 className="rule-card__title">{rule.title}</h4>
                </div>
                <p className="rule-card__text">{rule.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {lightboxOpen && (
        <div
          className="rules-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Affiche des règles en grand format"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            className="rules-lightbox__close"
            onClick={() => setLightboxOpen(false)}
            aria-label="Fermer"
          >
            ✕
          </button>
          <img
            className="rules-lightbox__image"
            src={LIGHTBOX_SRC}
            alt="Affiche officielle des règles du tournoi SHIFTER_PRO26, en grand format"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
