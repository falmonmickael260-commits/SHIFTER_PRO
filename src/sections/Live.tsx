import { useEffect, useRef, useState } from "react";
import { AtmosphereFX } from "../components/AtmosphereFX";
import { SectionHeading } from "../components/SectionHeading";
import { ExternalLinkIcon, KickIcon, TwitchIcon } from "../components/icons";
import { useInView } from "../hooks/useInView";
import "./Live.css";

export interface LiveProps {
  twitchHandle?: string;
  kickHandle?: string;
  live?: boolean;
}

type Platform = "twitch" | "kick";

declare global {
  interface Window {
    Twitch?: { Embed: new (elementId: string, options: Record<string, unknown>) => unknown };
  }
}

const TWITCH_EMBED_SRC = "https://embed.twitch.tv/embed/v1.js";

/**
 * Official Twitch Embed (embed.twitch.tv/embed/v1.js — dev.twitch.tv/docs/embed)
 * and the official Kick iframe player (player.kick.com/<handle> — Kick Help
 * Center's "How to embed your KICK livestream"). No unofficial/simulated
 * integration — verified against each platform's current docs before wiring.
 */
export function Live({ twitchHandle = "shifter_pro2", kickHandle, live = false }: LiveProps) {
  const [platform, setPlatform] = useState<Platform>("twitch");
  const embedHostRef = useRef<HTMLDivElement>(null);
  const [twitchReady, setTwitchReady] = useState(false);

  useEffect(() => {
    if (platform !== "twitch" || !embedHostRef.current) return;

    let cancelled = false;
    function mountEmbed() {
      if (cancelled || !window.Twitch || !embedHostRef.current) return;
      embedHostRef.current.innerHTML = "";
      new window.Twitch.Embed(embedHostRef.current.id, {
        width: "100%",
        height: "100%",
        channel: twitchHandle,
        parent: [window.location.hostname],
        layout: window.innerWidth >= 900 ? "video-with-chat" : "video",
        theme: "dark",
        autoplay: false,
      });
      setTwitchReady(true);
    }

    if (window.Twitch?.Embed) {
      mountEmbed();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${TWITCH_EMBED_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", mountEmbed);
      return () => existing.removeEventListener("load", mountEmbed);
    }

    const script = document.createElement("script");
    script.src = TWITCH_EMBED_SRC;
    script.async = true;
    script.addEventListener("load", mountEmbed);
    document.body.appendChild(script);

    return () => {
      cancelled = true;
      script.removeEventListener("load", mountEmbed);
    };
  }, [platform, twitchHandle]);

  const { ref: panelRef, visible: panelVisible } = useInView<HTMLDivElement>();

  return (
    <section className="live" id="live">
      <AtmosphereFX className="live__canvas" particleDensity={24} />
      <div className="live__vignette" aria-hidden="true" />

      <div className="live__inner">
        <SectionHeading eyebrow="BROADCAST" title="Live" />

        <div ref={panelRef} className={`live__panel reveal${panelVisible ? " reveal--visible" : ""}`}>
          <div className="live__tabs" role="tablist" aria-label="Plateforme de diffusion">
            <button
              type="button"
              role="tab"
              aria-selected={platform === "twitch"}
              className="live__tab"
              onClick={() => setPlatform("twitch")}
            >
              <TwitchIcon /> Twitch
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={platform === "kick"}
              className="live__tab"
              onClick={() => setPlatform("kick")}
              disabled={!kickHandle}
            >
              <KickIcon /> Kick
              {!kickHandle && <span className="live__tab-hint">Bientôt</span>}
            </button>

            <span className="live__status" role="status" aria-atomic="true">
              <span className="live__status-dot" data-live={live ? "true" : "false"} />
              {live ? "En direct" : "Hors ligne"}
            </span>
          </div>

          <div className="live__player">
            {platform === "twitch" && (
              <>
                <div id="twitch-embed" ref={embedHostRef} className="live__embed" />
                {!twitchReady && (
                  <div className="live__placeholder">
                    <TwitchIcon />
                    <span>Chargement du lecteur Twitch…</span>
                  </div>
                )}
              </>
            )}
            {platform === "kick" && kickHandle && (
              <iframe
                className="live__embed"
                src={`https://player.kick.com/${kickHandle}`}
                title={`Flux Kick de ${kickHandle}`}
                allowFullScreen
                frameBorder={0}
              />
            )}
          </div>

          <a
            className="live__cta"
            href={`https://twitch.tv/${twitchHandle}`}
            target="_blank"
            rel="noreferrer"
          >
            Ouvrir sur Twitch <ExternalLinkIcon />
          </a>

          <p className="live__broadcast-note">
            Les jours de tournoi SHIFTER_PRO26, la diffusion démarre généralement à 21h sur Twitch.
          </p>
        </div>
      </div>
    </section>
  );
}
