import type { Internship } from "../../types/career";

type InternshipDetailHeroProps = {
  internship: Internship;
  closed: boolean;
};

export default function InternshipDetailHero({
  internship,
  closed,
}: InternshipDetailHeroProps) {
  return (
    <header className="internshipDetailHero">
      <div className="companyLogo isLarge">
        {internship.company_logo_url ? (
          <img
            src={internship.company_logo_url}
            alt={`${internship.company_name}のロゴ`}
          />
        ) : (
          <span>{internship.company_name.slice(0, 1)}</span>
        )}
      </div>
      <div>
        <div className="tagRow">
          {internship.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
          <span className={closed ? "isWarning" : "isOpen"}>
            {closed ? "募集終了" : "募集中"}
          </span>
        </div>
        <h1>{internship.title}</h1>
        <p>{internship.company_name}</p>
        <strong>{internship.summary}</strong>
      </div>
    </header>
  );
}
