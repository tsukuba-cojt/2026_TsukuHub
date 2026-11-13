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
          <p>{internship.summary}</p>
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
