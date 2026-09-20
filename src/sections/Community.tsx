import { useState } from "react";
import { SectionHeading } from "../components/SectionHeading";
import { SocialLink } from "../components/SocialLink";
import { DiscordIcon, KickIcon, TikTokIcon, TwitchIcon } from "../components/icons";
import { useInView } from "../hooks/useInView";
import "./Community.css";

export interface CommunityProps {
  discordTag?: string;
  /** Real invite link (discord.gg/...) — once you have one, pass it here
   * and the button becomes a direct join link instead of a copy action. */
  discordInviteUrl?: string;
  twitchHandle?: string;
  kickHandle?: string;
  tiktokHandle?: string;
}

export function Community({
  discordTag = "BKHHWW.26",
  discordInviteUrl,
  twitchHandle = "shifter_pro2",
  kickHandle,
  tiktokHandle,
}: CommunityProps) {
  const [copied, setCopied] = useState(false);
  const { ref: bodyRef, visible: bodyVisible } = useInView<HTMLDivElement>();

  async function handleJoinClick() {
    if (discordInviteUrl) return;
    try {
      await navigator.clipboard.writeText(discordTag);
    } catch {
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="community" id="community">
      <div className="community__inner">
        <SectionHeading eyebrow="COMMUNITY" title="Join the Squad" align="center" />

        <div ref={bodyRef} className={`community__body reveal${bodyVisible ? " reveal--visible" : ""}`}>
          <p className="community__intro">
            Le QG de la communauté SHIFTER_PRO : tactique, entraide et tournois entre membres.
          </p>

          {discordInviteUrl ? (
            <a className="community__join" href={discordInviteUrl} target="_blank" rel="noreferrer">
              <DiscordIcon /> Join Discord
            </a>
          ) : (
            <button type="button" className="community__join" onClick={handleJoinClick}>
              <DiscordIcon /> {copied ? "Tag copié !" : `Join Discord — ${discordTag}`}
            </button>
          )}

          <div className="community__socials">
            <SocialLink icon={<TwitchIcon />} label="Twitch" href={`https://twitch.tv/${twitchHandle}`} />
            <SocialLink icon={<KickIcon />} label="Kick" href={kickHandle ? `https://kick.com/${kickHandle}` : undefined} />
            <SocialLink icon={<TikTokIcon />} label="TikTok" href={tiktokHandle ? `https://tiktok.com/@${tiktokHandle}` : undefined} />
            <SocialLink icon={<DiscordIcon />} label="Discord" href={discordInviteUrl} />
          </div>
        </div>
      </div>
    </section>
  );
}
