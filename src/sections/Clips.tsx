import { SectionHeading } from "../components/SectionHeading";
import { PlayIcon } from "../components/icons";
import "./Clips.css";

export interface Clip {
  id: string;
  title: string;
  duration: string;
  views: string;
  format: "horizontal" | "vertical";
  game: string;
}

export interface ClipsProps {
  clips?: Clip[];
}

/**
 * Placeholder clip set — clearly example data, not fetched footage. No
 * clip-fetching API is wired up yet (Twitch's Clips API needs an app
 * token + the streamer's user id); this grid is the target shape for
 * when that's connected, not a simulation of it.
 */
const EXAMPLE_CLIPS: Clip[] = [
  { id: "ex-1", title: "Clutch 1v4 — Search & Destroy", duration: "0:42", views: "—", format: "horizontal", game: "Call of Duty" },
  { id: "ex-2", title: "Ace en Ranked Play", duration: "0:28", views: "—", format: "vertical", game: "Call of Duty" },
  { id: "ex-3", title: "Snipe impossible — Highlight", duration: "0:15", views: "—", format: "horizontal", game: "Call of Duty" },
  { id: "ex-4", title: "Finale de tournoi", duration: "1:04", views: "—", format: "horizontal", game: "Call of Duty" },
];

export function Clips({ clips = EXAMPLE_CLIPS }: ClipsProps) {
  return (
    <section className="clips" id="clips">
      <div className="clips__inner">
        <SectionHeading eyebrow="HIGHLIGHTS" title="Best Moments" />

        <div className="clips__grid">
          {clips.map((clip) => (
            <article key={clip.id} className={`clip-card clip-card--${clip.format}`}>
              <div className="clip-card__thumb">
                <span className="clip-card__scan" aria-hidden="true" />
                <button type="button" className="clip-card__play" aria-label={`Lire ${clip.title}`}>
                  <PlayIcon />
                </button>
                <span className="clip-card__duration">{clip.duration}</span>
              </div>
              <div className="clip-card__meta">
                <h3 className="clip-card__title">{clip.title}</h3>
                <span className="clip-card__game">{clip.game}</span>
              </div>
            </article>
          ))}
        </div>

        <p className="clips__note">Aperçu — connectés automatiquement à l'API Twitch Clips dès qu'elle sera configurée.</p>
      </div>
    </section>
  );
}
