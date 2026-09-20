import { useState } from "react";
import { ShifterLoader } from "./loader";
import { Hero } from "./hero/Hero";
import { Navbar } from "./nav/Navbar";
import { Live } from "./sections/Live";
import { Clips } from "./sections/Clips";
import { Tournaments } from "./sections/Tournaments";
import { Community } from "./sections/Community";
import { About } from "./sections/About";
import { Business } from "./sections/Business";
import "./App.css";

// The one real Discord invite for the whole site — every Discord button
// anywhere on the page passes this same constant, never a re-typed copy.
const DISCORD_INVITE_URL = "https://discord.gg/KsvzzU6g9";

function App() {
  const [runId, setRunId] = useState(0);
  const [loaderDone, setLoaderDone] = useState(false);

  return (
    <>
      {/* Always mounted — the loader sits on top and its own exit fade is
          what reveals the Hero underneath, so LOADER -> HERO reads as one
          continuous scene rather than a hard swap. */}
      <Navbar />
      <main>
        <Hero discordInviteUrl={DISCORD_INVITE_URL} />
        <Live />
        <Clips />
        <Tournaments discordInviteUrl={DISCORD_INVITE_URL} />
        <Community tiktokHandle="shifter_pro26" discordInviteUrl={DISCORD_INVITE_URL} />
        <About />
        <Business discordInviteUrl={DISCORD_INVITE_URL} />
      </main>

      {!loaderDone && <ShifterLoader key={runId} onComplete={() => setLoaderDone(true)} />}

      {loaderDone && (
        <button
          type="button"
          className="dev-replay"
          onClick={() => {
            setLoaderDone(false);
            setRunId((id) => id + 1);
            window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
          }}
        >
          Revoir le boot
        </button>
      )}
    </>
  );
}

export default App;
