import { SectionHeading } from "../components/SectionHeading";
import "./Business.css";

export interface BusinessProps {
  /** Real business email once one exists — falls back to Discord, the
   * only confirmed contact channel, rather than inventing an address. */
  contactEmail?: string;
  discordTag?: string;
}

const AREAS = ["Sponsors", "Partenariats", "Collaborations", "Événements"];

export function Business({ contactEmail, discordTag = "BKHWW.26" }: BusinessProps) {
  return (
    <section className="business" id="business">
      <div className="business__inner">
        <SectionHeading eyebrow="PARTNERSHIPS" title="Business & Collaborations" />

        <div className="business__areas">
          {AREAS.map((area) => (
            <span key={area} className="business__area">
              {area}
            </span>
          ))}
        </div>

        <p className="business__text">
          Ouvert aux sponsors, partenariats et collaborations autour du gaming compétitif et des tournois
          Call of Duty.
        </p>

        {contactEmail ? (
          <a className="business__cta" href={`mailto:${contactEmail}`}>
            {contactEmail}
          </a>
        ) : (
          <p className="business__fallback">
            Contact business : via Discord — <strong>{discordTag}</strong>
          </p>
        )}
      </div>
    </section>
  );
}
