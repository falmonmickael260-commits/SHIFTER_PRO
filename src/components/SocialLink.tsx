import type { ReactNode } from "react";
import "./SocialLink.css";

interface SocialLinkProps {
  icon: ReactNode;
  label: string;
  /** Real profile URL. When omitted, the link renders disabled — we never
   * fabricate a handle/URL that wasn't actually provided. */
  href?: string;
}

export function SocialLink({ icon, label, href }: SocialLinkProps) {
  if (!href) {
    return (
      <span className="social-link social-link--pending" aria-disabled="true">
        <span className="social-link__icon">{icon}</span>
        {label}
        <span className="social-link__hint">Bientôt</span>
      </span>
    );
  }
  return (
    <a className="social-link" href={href} target="_blank" rel="noreferrer">
      <span className="social-link__icon">{icon}</span>
      {label}
    </a>
  );
}
