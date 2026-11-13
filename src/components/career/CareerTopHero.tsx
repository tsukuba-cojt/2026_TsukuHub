import { BriefcaseBusiness } from "lucide-react";
import { useUniversity } from "../university/universityContextValue";

export default function CareerTopHero() {
  const { university } = useUniversity();
  return (
    <section className="careerHero">
      <div className="careerHeroCopy">
        <h1>
          <BriefcaseBusiness aria-hidden="true" />
          キャリア・インターン
        </h1>
        <p>
          就活の基礎から長期インターン、卒業生の体験記まで。
          <br />
          {university?.short_name}生のキャリア選択をサポートする機能をまとめました。
        </p>
      </div>
    </section>
  );
}
