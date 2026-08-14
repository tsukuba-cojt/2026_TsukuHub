import { Link } from "react-router-dom";
import type { AlumniStoryRecord } from "../../types/content";
import { useUniversity } from "../university/universityContextValue";

type AlumniStoryCardProps = {
  story: AlumniStoryRecord;
};

export default function AlumniStoryCard({ story }: AlumniStoryCardProps) {
  const { path } = useUniversity();
  return (
    <article className="alumniCard">
      <div>
        <span>{story.graduation_year}年度卒</span>
        <span>{story.faculty}</span>
      </div>
      <p className="alumniRole">
        {story.destination}／{story.job_role}
      </p>
      <h2>{story.title}</h2>
      <p>{story.summary}</p>
      <ul>
        {story.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      <Link to={path(`/career/alumni/${story.id}`)}>詳しく読む</Link>
    </article>
  );
}
