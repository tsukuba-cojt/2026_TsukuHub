import { BriefcaseBusiness } from "lucide-react";

export default function CareerTopHero() {
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
          筑波大生のキャリア選択をサポートする機能をまとめました。
        </p>
      </div>
      <div
        className="careerHeroImage"
        role="img"
        aria-label="キャリア・インターンのイメージ画像（準備中）"
      />
    </section>
  );
}
