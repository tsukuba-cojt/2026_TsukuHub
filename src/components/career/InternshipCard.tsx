import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Internship } from "../../types/career";

type InternshipCardProps = {
  internship: Internship;
  currentTime: number;
};

const deadlineText = (date: string) =>
  new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium" }).format(
    new Date(date),
  );

const isClosingSoon = (date: string, currentTime: number) => {
  const days = (new Date(date).getTime() - currentTime) / 86400000;
  return days >= 0 && days <= 7;
};

export default function InternshipCard({
  internship,
  currentTime,
}: InternshipCardProps) {
  return (
    <article className="internshipCard">
      <div className="companyLogo">
        {internship.company_logo_url ? (
          <img
            src={internship.company_logo_url}
            alt={`${internship.company_name}のロゴ`}
          />
        ) : (
          <span>{internship.company_name.slice(0, 1)}</span>
        )}
      </div>
      <div className="internshipCardBody">
        <div className="tagRow">
          {internship.is_featured && <span>おすすめ</span>}
          {internship.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
          {isClosingSoon(internship.deadline, currentTime) && (
            <span className="isWarning">締切間近</span>
          )}
        </div>
        <h3>{internship.title}</h3>
        <p className="companyName">{internship.company_name}</p>
        <dl>
          <div>
            <dt>
              <BriefcaseBusiness aria-hidden="true" />職種
            </dt>
            <dd>{internship.job_category}</dd>
          </div>
          <div>
            <dt>
              <MapPin aria-hidden="true" />勤務地
            </dt>
            <dd>
              {internship.location}
              {internship.is_remote ? "（リモート可）" : ""}
            </dd>
          </div>
          <div>
            <dt>勤務条件</dt>
            <dd>{internship.work_conditions}</dd>
          </div>
          <div>
            <dt>報酬</dt>
            <dd>{internship.compensation}</dd>
          </div>
        </dl>
        <footer>
          <span>
            <CalendarDays aria-hidden="true" />締切 {deadlineText(internship.deadline)}
          </span>
          <Link to={`/career/internships/${internship.id}`}>
            詳細を見る
            <ChevronRight aria-hidden="true" />
          </Link>
        </footer>
      </div>
    </article>
  );
}
