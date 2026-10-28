import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, GraduationCap } from "lucide-react";
import { listPublishedAlumniStories } from "../../services/contentService";
import { useUniversity } from "../university/universityContextValue";
import type { AlumniStoryRecord } from "../../types/content";

// キャリアトップの卒業生の体験記セクション。
// 基礎知識・おすすめインターン（classGuidePanel + careerMiniCard）と同じ見た目にそろえる。
export default function AlumniStoryPreview() {
  const { university, path } = useUniversity();
  const [stories, setStories] = useState<AlumniStoryRecord[]>([]);

  useEffect(() => {
    if (!university) return;
    void listPublishedAlumniStories(university.id)
      .then((items) => setStories(items.slice(0, 3)))
      .catch(() => setStories([]));
  }, [university]);

  return (
    <section className="classGuidePanel">
      <div className="classGuidePanelHead">
        <h2 className="classGuidePanelTitle">
          <GraduationCap aria-hidden="true" />
          卒業生の体験記
        </h2>
        <Link className="classGuidePanelMore" to={path("/career/alumni")}>
          体験記一覧を見る
          <ChevronRight aria-hidden="true" />
        </Link>
      </div>
      {stories.length > 0 ? (
        <div className="careerMiniGrid">
          {stories.map((story) => (
            <Link className="careerMiniCard" to={path(`/career/alumni/${story.id}`)} key={story.id}>
              <div className={`careerMiniCover${story.cover_image_url ? " hasImage" : ""}`}>
                {story.cover_image_url ? <img src={story.cover_image_url} alt="" /> : null}
                <span>{story.graduation_year}年度卒</span>
              </div>
              <div className="careerMiniCardBody">
                <h3>{story.title}</h3>
                <p>{story.destination}・{story.job_role}</p>
                <strong>
                  詳しく読む <ArrowRight aria-hidden="true" />
                </strong>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="careerInlineState">卒業生の体験記は、現在準備中です。</div>
      )}
    </section>
  );
}
