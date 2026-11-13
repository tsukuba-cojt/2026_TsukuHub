import { Link } from "react-router-dom";
import type { AlumniStoryRecord } from "../../types/content";
import { useUniversity } from "../university/universityContextValue";
import ContentCover from "./ContentCover";

type AlumniStoryCardProps = {
  story: AlumniStoryRecord;
};

export default function AlumniStoryCard({ story }: AlumniStoryCardProps) {
  const { path } = useUniversity();
  return (
    <article className="alumniCard">
      <Link className="alumniCardLink" to={path(`/career/alumni/${story.id}`)}>
        <ContentCover
          variant="card"
          imageUrl={story.cover_image_url}
          eyebrow="Graduate Interview"
          title={story.job_role}
          org={story.destination}
        />
        <div className="alumniCardBody">
          <div>
            <span>{story.graduation_year}年度卒</span>
            <span>{story.faculty}</span>
          </div>
          <h2>{story.title}</h2>
          <p>{story.summary}</p>
          <ul>
            {story.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <em>詳しく読む</em>
        </div>
      </Link>
    </article>
  );
}
