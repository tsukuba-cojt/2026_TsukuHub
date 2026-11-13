import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import AlumniStoryDetail from "../components/career/AlumniStoryDetail";
import Footer from "../components/utility/Footer";
import Globalnav from "../components/utility/Globalnav";
import {
  getPublishedAlumniStory,
  listPublishedAlumniStories,
} from "../services/contentService";
import { useUniversity } from "../components/university/universityContextValue";
import type { AlumniStoryRecord } from "../types/content";
import "../styles/career/CareerPlatform.css";

export default function CareerAlumniDetail() {
  const { id } = useParams();
  const { university, path } = useUniversity();
  const [story, setStory] = useState<AlumniStoryRecord | null>(null);
  const [related, setRelated] = useState<AlumniStoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !university) return;
    void Promise.all([
      getPublishedAlumniStory(id, university.id),
      listPublishedAlumniStories(university.id),
    ])
      .then(([item, stories]) => {
        setStory(item);
        setRelated(stories.filter((entry) => entry.id !== id).slice(0, 3));
      })
      .catch(() => {
        setStory(null);
        setRelated([]);
      })
      .finally(() => setLoading(false));
  }, [id, university]);

  if (loading) {
    return (
      <div className="careerPlatform">
        <Globalnav />
        <main className="careerState">読み込んでいます...</main>
        <Footer />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="careerPlatform">
        <Globalnav />
        <main className="careerState">
          <h1>体験記が見つかりません</h1>
          <Link to={path("/career/alumni")}>一覧へ戻る</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="careerPlatform">
      <Globalnav />
      <main className="careerShell alumniStoryPage">
        <nav className="careerBreadcrumb" aria-label="パンくずリスト">
          <Link to={path("/career")}>キャリア・インターン</Link>
          <ChevronRight aria-hidden="true" />
          <Link to={path("/career/alumni")}>卒業生体験記</Link>
          <ChevronRight aria-hidden="true" />
          <span>{story.title}</span>
        </nav>

        <div className="alumniArticleLayout">
          <AlumniStoryDetail story={story} />

          <aside className="alumniSidebar">
            <div className="alumniSidebarCta">
              <p>進路のヒントを、体験記とインターンから。</p>
              <Link className="careerPrimaryButton" to={path("/career/alumni")}>
                体験記一覧を見る
              </Link>
              <Link className="alumniSidebarSubLink" to={path("/career/internships")}>
                長期インターンを探す
              </Link>
            </div>

            {related.length > 0 && (
              <section className="alumniRelated">
                <h2>ほかの体験記</h2>
                <ul>
                  {related.map((item) => (
                    <li key={item.id}>
                      <Link to={path(`/career/alumni/${item.id}`)}>
                        <span>{item.job_role}</span>
                        <strong>{item.title}</strong>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
