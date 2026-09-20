import "./SectionHeading.css";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  align?: "center" | "left";
}

/** Shared eyebrow + title pattern used by every section after the Hero. */
export function SectionHeading({ eyebrow, title, align = "left" }: SectionHeadingProps) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      <span className="section-heading__eyebrow">{eyebrow}</span>
      <h2 className="section-heading__title">{title}</h2>
    </div>
  );
}
