import { useEffect, useState, type CSSProperties } from "react";
import { CloseIcon, MenuIcon } from "../components/icons";
import "./Navbar.css";

const LINKS = [
  { href: "#live", label: "Live" },
  { href: "#clips", label: "Clips" },
  { href: "#tournaments", label: "Tournaments" },
  { href: "#community", label: "Community" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className={`navbar${scrolled ? " navbar--scrolled" : ""}`}>
        <a className="navbar__brand" href="#hero">
          SHIFTER_PRO
        </a>

        <nav className="navbar__links" aria-label="Navigation principale">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="navbar__link">
              {link.label}
            </a>
          ))}
        </nav>

        <a className="navbar__cta" href="#live">
          Watch Live
        </a>

        <button
          type="button"
          className="navbar__toggle"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </header>

      <div className={`navbar__mobile${open ? " navbar__mobile--open" : ""}`}>
        <nav aria-label="Navigation mobile">
          {LINKS.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              className="navbar__mobile-link"
              style={{ "--i": index } as CSSProperties}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a className="navbar__mobile-cta" href="#live" onClick={() => setOpen(false)}>
          Watch Live
        </a>
      </div>
    </>
  );
}
