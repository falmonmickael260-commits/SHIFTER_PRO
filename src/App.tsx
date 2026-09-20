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
        <Hero />
        <Live />
        <Clips />
        <Tournaments />
        <Community tiktokHandle="shifter_pro" />
        <About />
        <Business />
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
