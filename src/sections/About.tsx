import { SectionHeading } from "../components/SectionHeading";
import "./About.css";

export interface AboutStat {
  label: string;
  value?: string;
}

export interface AboutProps {
  roles?: string[];
  bio?: string;
  /** Real numbers only — a stat with no value renders as pending, never guessed. */
  stats?: AboutStat[];
}

const DEFAULT_ROLES = ["Streamer", "Gamer", "Tournament Host"];

const DEFAULT_STATS: AboutStat[] = [
  { label: "Followers Twitch" },
  { label: "Tournois organisés" },
  { label: "Heures de stream" },
];

export function About({ roles = DEFAULT_ROLES, bio, stats = DEFAULT_STATS }: AboutProps) {
  return (
    <section className="about" id="about">
      <div className="about__inner">
        <SectionHeading eyebrow="IDENTITY" title="About SHIFTER_PRO" />

        <div className="about__roles">
          {roles.map((role) => (
            <span key={role} className="about__role">
              {role}
            </span>
          ))}
        </div>

        <p className="about__bio">
          {bio ?? "Joueur et streamer Call of Duty, SHIFTER_PRO organise des tournois réguliers et construit une communauté tactique autour du jeu compétitif."}
        </p>

        <div className="about__stats">
          {stats.map((stat) => (
            <div key={stat.label} className="about__stat">
              <span className="about__stat-value">{stat.value ?? "—"}</span>
              <span className="about__stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
