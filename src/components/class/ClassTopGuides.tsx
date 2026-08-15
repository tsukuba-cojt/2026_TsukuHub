import { useEffect, useState } from "react";
import type { ClassGuideArticleRecord } from "../../types/classGuide";
import { listPublishedClassGuides } from "../../services/classGuideService";
import { useUniversity } from "../university/universityContextValue";
import ClassGuideSection from "./ClassGuideSection";
import "../../styles/career/CareerPlatform.css";

function ClassTopGuides() {
  const { university } = useUniversity();
  const [articles, setArticles] = useState<ClassGuideArticleRecord[]>([]);

  useEffect(() => {
    if (!university) return;
    void listPublishedClassGuides(university.id)
      .then(setArticles)
      .catch(() => setArticles([]));
  }, [university]);

  const strategyArticles = articles.filter((item) => item.category === "registration_strategy");
  const selectionArticles = articles.filter((item) => item.category === "course_selection");

  return (
    <div className="classTopGuides">
      <ClassGuideSection
        category="registration_strategy"
        articles={strategyArticles}
      />
      <ClassGuideSection
        category="course_selection"
        articles={selectionArticles}
      />
    </div>
  );
}

export default ClassTopGuides;
