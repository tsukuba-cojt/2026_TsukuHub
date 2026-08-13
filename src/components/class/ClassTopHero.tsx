import { BookOpen } from "lucide-react";
import "../../styles/class/ClassTop.css";
import { useUniversity } from "../university/universityContextValue";

// 授業・履修トップページのヒーローセクション
function ClassTopHero() {
  const { university } = useUniversity();
  return (
    <section className="classTopHero">
      <div className="classTopHeroText">
        <h1 className="classTopHeroTitle">
          <BookOpen aria-hidden="true" />
          講義・履修
        </h1>
        <p className="classTopHeroDesc">
          講義の検索や履修計画、みんなの時間割まで。
          <br />
          {university?.short_name}生の学びをサポートする機能をまとめました。
        </p>
      </div>
      {/* ダミーのプレースホルダー画像（本実装時にイラストへ差し替える） */}
      <div
        className="classTopHeroImage"
        role="img"
        aria-label="講義・履修のイメージイラスト（準備中）"
      />
    </section>
  );
}

export default ClassTopHero;
