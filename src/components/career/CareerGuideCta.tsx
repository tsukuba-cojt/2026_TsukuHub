import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

type CareerGuideCtaProps = {
  title: string;
  text: string;
  label: string;
  to: string;
};

export default function CareerGuideCta({
  title,
  text,
  label,
  to,
}: CareerGuideCtaProps) {
  return (
    <section className="careerGuideCta">
      <span>
        <MapPin aria-hidden="true" />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <Link to={to}>
        {label}
        <ArrowRight aria-hidden="true" />
      </Link>
    </section>
  );
}
