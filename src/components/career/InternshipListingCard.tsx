import { Link } from "react-router-dom";
import type { Internship } from "../../types/career";
import { useUniversity } from "../university/universityContextValue";
import ContentCover from "./ContentCover";

type InternshipListingCardProps = {
  internship: Internship;
};

export default function InternshipListingCard({ internship }: InternshipListingCardProps) {
  const { path } = useUniversity();
  return (
    <article className="alumniCard">
      <Link className="alumniCardLink" to={path(`/career/internships/${internship.id}`)}>
        <ContentCover
          variant="card"
          imageUrl={internship.cover_image_url}
          eyebrow={internship.job_category}
          title={internship.title}
          org={internship.company_name}
        />
        <div className="alumniCardBody">
          <div>
            <span>{internship.location}</span>
            {internship.is_remote && <span>リモート可</span>}
            {internship.is_featured && <span>おすすめ</span>}
          </div>
          <h2>{internship.title}</h2>
          <div className="internshipCardCompany">
            {internship.company_logo_url ? (
              <img src={internship.company_logo_url} alt={`${internship.company_name}のロゴ`} loading="lazy" />
            ) : null}
            <p>{internship.company_name}</p>
          </div>
          <p>{internship.summary}</p>
          <dl className="careerMiniJobDetails">
            <div>
              <dt>報酬</dt>
              <dd>{internship.compensation?.trim() || "未記載"}</dd>
            </div>
            <div>
              <dt>最寄り駅</dt>
              <dd>{internship.location?.trim() || "未記載"}</dd>
            </div>
          </dl>
          <ul>
            {internship.tags.slice(0, 4).map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <em>詳しく見る</em>
        </div>
      </Link>
    </article>
  );
}
