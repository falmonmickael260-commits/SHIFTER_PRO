import { useState } from "react";
import { AtmosphereFX } from "../components/AtmosphereFX";
import "./Hero.css";

export interface HeroProps {
  displayName?: string;
  eyebrow?: string;
  twitchHandle?: string;
  discordTag?: string;
  /** Real live status — false (OFFLINE) until a real Twitch check is wired up. */
  live?: boolean;
  watchLiveHref?: string;
  tournamentsHref?: string;
}

/**
 * Full-screen cinematic hero — direct visual continuation of ShifterLoader
 * (same tokens, same HUD chrome, same ambient canvas language). Renders
 * behind the loader from the first paint; the loader's own exit fade is
 * what reveals it, so this component's own entrance plays out early and
 * settles well before the loader finishes.
 */
export function Hero({
  displayName = "SHIFTER_PRO",
  eyebrow = "GAMING • LIVE • TOURNAMENTS",
  twitchHandle = "SHIFTER_PRO2",
  discordTag = "BKHWW.26",
  live = false,
  watchLiveHref = "#live",
  tournamentsHref = "#tournaments",
}: HeroProps) {
  const [copied, setCopied] = useState(false);

  async function copyDiscordTag() {
    try {
      await navigator.clipboard.writeText(discordTag);
    } catch {
      // Clipboard API unavailable (older browser / no permission) — the tag
      // is already shown as plain text and selectable, nothing more to do.
      // Importantly: don't claim success below when the write failed.
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="hero" id="hero">
      <AtmosphereFX className="hero__canvas" particleDensity={46} />
      <div className="hero__vignette" aria-hidden="true" />
      <div className="hero__scanlines" aria-hidden="true" />

      <div className="hero__hud" aria-hidden="true">
        <span className="hero__corner hero__corner--tl" />
        <span className="hero__corner hero__corner--tr" />
        <span className="hero__corner hero__corner--bl" />
        <span className="hero__corner hero__corner--br" />
        <div className="hero__readout">
          <span>SHIFTER_PRO // HQ</span>
          <span>CALL OF DUTY OPS</span>
        </div>
      </div>

      <div className="hero__live" role="status" aria-atomic="true">
        <span className="hero__live-dot" data-live={live ? "true" : "false"} />
        <span>{live ? "LIVE" : "OFFLINE"}</span>
        <span className="hero__sr-only">
          {live ? "Statut : en direct maintenant sur Twitch" : "Statut : actuellement hors ligne"}
        </span>
      </div>

      <div className="hero__content">
        <p className="hero__eyebrow">{eyebrow}</p>
        <h1 className="hero__name">{displayName}</h1>

        <div className="hero__cta-row">
          <a className="hero__cta hero__cta--primary" href={watchLiveHref}>
            Watch Live
          </a>
          <a className="hero__cta hero__cta--secondary" href={tournamentsHref}>
            Tournaments
          </a>
        </div>

        <div className="hero__connections">
          <a
            className="hero__tag hero__tag--link"
            href={`https://twitch.tv/${twitchHandle.toLowerCase()}`}
            target="_blank"
            rel="noreferrer"
          >
            TWITCH // {twitchHandle}
          </a>
          <button className="hero__tag hero__tag--action" type="button" onClick={copyDiscordTag}>
            DISCORD // {discordTag}
            <span className="hero__sr-only" aria-live="polite">
              {copied ? "Tag copié dans le presse-papiers" : ""}
            </span>
            <span className="hero__tag-hint" aria-hidden="true">
              {copied ? "COPIÉ" : "COPIER"}
            </span>
          </button>
        </div>
      </div>

      <a className="hero__scroll-cue" href={watchLiveHref} aria-hidden="true" tabIndex={-1}>
        <span>SCROLL</span>
        <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
          <path d="M6 1v13M2 10l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </section>
  );
}
