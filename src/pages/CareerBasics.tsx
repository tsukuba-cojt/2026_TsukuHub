import CareerBreadcrumb from "../components/career/CareerBreadcrumb";
import CareerPageHeader from "../components/career/CareerPageHeader";
import NoteArticleEmbed from "../components/career/NoteArticleEmbed";
import Footer from "../components/utility/Footer";
import Globalnav from "../components/utility/Globalnav";
import { careerNoteArticles } from "../data/careerNoteArticles";
import "../styles/career/CareerPlatform.css";

export default function CareerBasics() {
  return (
    <div className="careerPlatform">
      <Globalnav />
      <main className="careerShell">
        <CareerBreadcrumb
          items={[
            { label: "就活", to: "/career" },
            { label: "基礎知識" },
          ]}
        />
        <CareerPageHeader
          eyebrow="CAREER BASICS"
          title="就活・長期インターンの基礎知識"
        >
          就活の全体像から、応募書類や面接まで。必要なテーマから一つずつ確認できます。
        </CareerPageHeader>
        <NoteArticleEmbed articles={careerNoteArticles} />
      </main>
      <Footer />
    </div>
  );
}
