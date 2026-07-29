import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { AlumniStoryRecord } from "../../types/content";

type AlumniStoryPreviewProps = {
  stories: AlumniStoryRecord[];
};

export default function AlumniStoryPreview({ stories }: AlumniStoryPreviewProps) {
  return (
    <section className="careerHomeSection">
      <div className="careerSectionHeading">
        <span>ALUMNI STORIES</span>
        <h2>卒業生の体験記</h2>
      </div>
      <div className="careerMiniGrid">
        {stories.slice(0, 3).map((story) => (
          <Link
            className="careerMiniCard"
            to={`/career/alumni/${story.id}`}
            key={story.id}
          >
            <span>
              {story.graduation_year}年度卒・{story.job_role}
            </span>
            <h3>{story.title}</h3>
            <p>{story.summary}</p>
            <strong>
              体験記を読む <ArrowRight aria-hidden="true" />
            </strong>
          </Link>
        ))}
      </div>
    </section>
  );
}
