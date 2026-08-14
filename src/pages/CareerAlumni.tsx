import { useEffect, useState } from "react";
import AlumniStoryCard from "../components/career/AlumniStoryCard";
import CareerPageHeader from "../components/career/CareerPageHeader";
import Footer from "../components/utility/Footer";
import Globalnav from "../components/utility/Globalnav";
import { listPublishedAlumniStories } from "../services/contentService";
import { useUniversity } from "../components/university/universityContextValue";
import type { AlumniStoryRecord } from "../types/content";
import "../styles/career/CareerPlatform.css";

export default function CareerAlumni() {
  const { university } = useUniversity();
  const [stories, setStories] = useState<AlumniStoryRecord[]>([]);

  useEffect(() => {
    if (!university) return;
    void listPublishedAlumniStories(university.id).then(setStories).catch(() => setStories([]));
  }, [university]);

  return (
    <div className="careerPlatform">
      <Globalnav />
      <main className="careerShell">
        <CareerPageHeader
          eyebrow="ALUMNI STORIES"
          title="卒業生のキャリア・体験記"
        >
          進路に正解は一つではありません。卒業生の体験記から、考え方や行動のヒントを探せます。
        </CareerPageHeader>
        {stories.length === 0 ? <div className="careerState"><h2>まだ掲載がありません</h2><p>{university?.name}の卒業生体験記を準備中です。</p></div> : <div className="alumniGrid">
          {stories.map((story) => (
            <AlumniStoryCard story={story} key={story.id} />
          ))}
        </div>}
      </main>
      <Footer />
    </div>
  );
}
