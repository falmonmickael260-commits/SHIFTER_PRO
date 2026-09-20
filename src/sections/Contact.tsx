import { SectionHeading } from "../components/SectionHeading";
import { DiscordIcon } from "../components/icons";
import { useInView } from "../hooks/useInView";
import "./Contact.css";

export interface ContactProps {
  email?: string;
  discordInviteUrl?: string;
}

/**
 * The site's one deliberate, user-initiated contact point. No automatic
 * action anywhere else on the site should open a mail client or send
 * anything on its own — if someone has a question, this is where they
 * choose to reach out, not something triggered for them by another button
 * (e.g. registering/paying for a tournament).
 */
export function Contact({ email = "Vantm26100@hotmail.com", discordInviteUrl }: ContactProps) {
  const { ref, visible } = useInView<HTMLDivElement>();

  return (
    <section className="contact" id="contact">
      <div className="section-glow" aria-hidden="true" />
      <div className="contact__inner">
        <SectionHeading eyebrow="SUPPORT" title="Une question ?" align="center" />

        <div ref={ref} className={`contact__body reveal${visible ? " reveal--visible" : ""}`}>
          <p className="contact__text">
            Pour toute question sur un tournoi, une inscription ou un paiement, écris-nous directement.
          </p>
          <div className="contact__actions">
            <a className="contact__cta" href={`mailto:${email}`}>
              {email}
            </a>
            {discordInviteUrl && (
              <a className="contact__cta contact__cta--secondary" href={discordInviteUrl} target="_blank" rel="noreferrer">
                <DiscordIcon aria-hidden="true" /> Sur Discord
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
