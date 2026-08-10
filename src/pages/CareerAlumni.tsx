import { useEffect, useState } from "react";
import AlumniStoryCard from "../components/career/AlumniStoryCard";
import CareerBreadcrumb from "../components/career/CareerBreadcrumb";
import CareerPageHeader from "../components/career/CareerPageHeader";
import Footer from "../components/utility/Footer";
import Globalnav from "../components/utility/Globalnav";
import { fallbackAlumniStories } from "../data/careerFallbacks";
import { listPublishedAlumniStories } from "../services/contentService";
import type { AlumniStoryRecord } from "../types/content";
import "../styles/career/CareerPlatform.css";

export default function CareerAlumni() {
  const [stories, setStories] = useState<AlumniStoryRecord[]>(
    fallbackAlumniStories,
  );

  useEffect(() => {
    void listPublishedAlumniStories().then(setStories).catch(() => {
      // Supabase取得失敗時は既存サンプルを表示する
    });
  }, []);

  return (
    <div className="careerPlatform">
      <Globalnav />
      <main className="careerShell">
        <CareerBreadcrumb
          items={[
            { label: "就活", to: "/career" },
            { label: "卒業生の体験記" },
          ]}
        />
        <CareerPageHeader
          eyebrow="ALUMNI STORIES"
          title="卒業生のキャリア・体験記"
        >
          進路に正解は一つではありません。卒業生の体験記から、考え方や行動のヒントを探せます。
        </CareerPageHeader>
        <div className="alumniGrid">
          {stories.map((story) => (
            <AlumniStoryCard story={story} key={story.id} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
