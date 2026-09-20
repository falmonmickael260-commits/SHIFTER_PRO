import { SectionHeading } from "../components/SectionHeading";
import { useInView } from "../hooks/useInView";
import "./Business.css";

export interface BusinessProps {
  /** Real business email once one exists — falls back to Discord, the
   * only confirmed contact channel, rather than inventing an address. */
  contactEmail?: string;
  discordTag?: string;
  discordInviteUrl?: string;
}

const AREAS = ["Sponsors", "Partenariats", "Collaborations", "Événements"];

export function Business({
  contactEmail = "Vantm26100@hotmail.com",
  discordTag = "BKHHWW.26",
  discordInviteUrl,
}: BusinessProps) {
  const { ref, visible } = useInView<HTMLDivElement>();

  return (
    <section className="business" id="business">
      <div className="section-glow" aria-hidden="true" />
      <div className="business__inner">
        <SectionHeading eyebrow="PARTNERSHIPS" title="Business & Collaborations" />

        <div ref={ref} className={`reveal${visible ? " reveal--visible" : ""}`}>
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

          {contactEmail && (
            <a className="business__cta" href={`mailto:${contactEmail}`}>
              {contactEmail}
            </a>
          )}

          {discordInviteUrl ? (
            <a className="business__fallback" href={discordInviteUrl} target="_blank" rel="noreferrer">
              Ou rejoins le Discord — <strong>{discordTag}</strong>
            </a>
          ) : (
            <p className="business__fallback">
              Contact business : via Discord — <strong>{discordTag}</strong>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
