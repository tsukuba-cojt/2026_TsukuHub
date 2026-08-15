import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AlumniStoryCard from "./AlumniStoryCard";
import { listPublishedAlumniStories } from "../../services/contentService";
import { useUniversity } from "../university/universityContextValue";
import type { AlumniStoryRecord } from "../../types/content";

export default function AlumniStoryPreview() {
  const { university, path } = useUniversity();
  const [stories, setStories] = useState<AlumniStoryRecord[]>([]);

  useEffect(() => {
    if (!university) return;
    void listPublishedAlumniStories(university.id)
      .then((items) => setStories(items.slice(0, 2)))
      .catch(() => setStories([]));
  }, [university]);

  return (
    <section className="careerHomeSection">
      <div className="careerSectionHeading">
        <span>ALUMNI STORIES</span>
        <h2>卒業生の体験記</h2>
      </div>
      {stories.length === 0 ? (
        <div className="careerInlineState">卒業生の体験記は、現在準備中です。</div>
      ) : (
        <>
          <div className="alumniGrid">
            {stories.map((story) => (
              <AlumniStoryCard story={story} key={story.id} />
            ))}
          </div>
          <p className="alumniPreviewMore">
            <Link className="careerPrimaryButton" to={path("/career/alumni")}>
              体験記一覧を見る
              <ArrowRight aria-hidden="true" />
            </Link>
          </p>
        </>
      )}
    </section>
  );
}
