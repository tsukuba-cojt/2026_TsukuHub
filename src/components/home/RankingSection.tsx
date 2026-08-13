import "../../styles/home/RankingSection.css";
import { ExternalLink, SquareArrowOutUpRight } from "lucide-react";
import { externalServicesByUniversity } from "../../data/externalServices";
import { useUniversity } from "../university/universityContextValue";

function RankingSection() {
  const { university } = useUniversity();
  const services = university?.slug === "tsukuba"
    ? externalServicesByUniversity.tsukuba
    : [];
  return (
    <section className="panel externalServicesPanel">
      <div className="panelTitle">
        <SquareArrowOutUpRight aria-hidden="true" />
        <h2>外部サービス</h2>
      </div>

      <div className="externalServiceList">
        {services.length === 0 && <p>まだ登録されていません。</p>}
        {services.map((service) => {
          const ServiceIcon = service.icon;
          return (
            <a
              className="externalServiceCard"
              href={service.href}
              key={service.name}
              target="_blank"
              rel="noreferrer"
            >
              <span className={`externalServiceIcon ${service.colorClass}`}>
                <ServiceIcon aria-hidden="true" />
              </span>
              <span className="externalServiceText">
                <strong>{service.name}</strong>
                <small>{service.description}</small>
              </span>
              <ExternalLink className="externalServiceArrow" aria-hidden="true" />
            </a>
          );
        })}
      </div>
    </section>
  );
}

export default RankingSection;
