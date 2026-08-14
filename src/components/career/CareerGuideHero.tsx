import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type CareerGuideHeroProps = {
  eyebrow: string;
  title: string;
  lead: string;
  icon: LucideIcon;
  heroNote: string;
};

export default function CareerGuideHero({
  eyebrow,
  title,
  lead,
  icon: HeroIcon,
  heroNote,
}: CareerGuideHeroProps) {
  return (
    <section className="careerGuideHero">
      <div className="careerGuideHeroCopy">
        <span className="careerGuideEyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{lead}</p>
        <a href="#guide-content" className="careerGuideHeroButton">
          まずはここから <ArrowRight aria-hidden="true" />
        </a>
      </div>
      <div className="careerGuideHeroVisual" aria-hidden="true">
        <span className="careerGuideHeroIcon">
          <HeroIcon />
        </span>
        <p>{heroNote}</p>
        <span className="careerGuideOrb orbOne" />
        <span className="careerGuideOrb orbTwo" />
      </div>
    </section>
  );
}
