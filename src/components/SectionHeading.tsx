import { useInView } from "../hooks/useInView";
import "./SectionHeading.css";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  align?: "center" | "left";
}

/** Shared eyebrow + title pattern used by every section after the Hero. */
export function SectionHeading({ eyebrow, title, align = "left" }: SectionHeadingProps) {
  const { ref, visible } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`section-heading section-heading--${align} reveal${visible ? " reveal--visible" : ""}`}
    >
      <span className="section-heading__eyebrow">{eyebrow}</span>
      <h2 className="section-heading__title">{title}</h2>
    </div>
  );
}
