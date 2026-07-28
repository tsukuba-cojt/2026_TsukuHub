import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  Laptop,
  MapPin,
  MessageCircle,
  Send,
  Sparkles,
  WalletCards,
} from "lucide-react";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import { getInternship } from "../data/internships";
import "../styles/career/CareerInternshipDetail.css";

export default function CareerInternshipDetail() {
  const { internshipId } = useParams();
  const internship = getInternship(internshipId);

  if (!internship) {
    return (
      <div className="internDetailPage"><Globalnav /><main className="internDetailMissing">
        <h1>募集が見つかりませんでした</h1><Link to="/career/internships">一覧へ戻る</Link>
      </main><Footer /></div>
    );
  }

  const sections: Array<[string, string]> = [
    ["企業概要", internship.companyOverview],
    ["インターンの目的", internship.purpose],
    ["仕事内容", internship.description],
  ];
  const listSections: Array<[string, string[]]> = [
    ["任せてもらえる業務", internship.duties],
    ["身につくスキル", internship.skills],
    ["必須条件", internship.requirements],
    ["歓迎条件", internship.welcome],
    ["求める人物像", internship.personality],
  ];

  const share = async () => {
    if (navigator.share) await navigator.share({ title: internship.title, url: window.location.href });
    else await navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="internDetailPage">
      <Globalnav />
      <main>
        <div className="internDetailContainer">
          <Link className="internDetailBack" to="/career/internships"><ArrowLeft />長期インターン一覧に戻る</Link>

          <header className="internDetailHero">
            <div className="internDetailCover">
              <span style={{ background: internship.color }}>{internship.initials}</span>
              <div><small>LONG-TERM INTERNSHIP</small><strong>{internship.company}</strong></div>
            </div>
            <div className="internDetailHeroBody">
              <div className="internDetailBadges">
                <span className={`status is-${internship.status === "募集中" ? "open" : "few"}`}>{internship.status}</span>
                {internship.isNew && <span>NEW</span>}
                {internship.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
              <h1>{internship.title}</h1>
              <p className="internDetailCompany"><Building2 />{internship.company}</p>
            </div>
          </header>

          <div className="internDetailLayout">
            <div className="internDetailMain">
              <section className="internDetailInfo">
                <h2>基本情報</h2>
                <dl>
                  <div><dt><BriefcaseBusiness />職種</dt><dd>{internship.role}</dd></div>
                  <div><dt><MapPin />勤務地</dt><dd>{internship.location}</dd></div>
                  <div><dt><Laptop />リモート</dt><dd>{internship.remote ? "対応可" : "原則出社"}</dd></div>
                  <div><dt><WalletCards />報酬</dt><dd>{internship.salaryLabel}</dd></div>
                  <div><dt><Clock3 />勤務条件</dt><dd>週{internship.minDays}日〜／{internship.hours}</dd></div>
                  <div><dt><CalendarDays />応募締切</dt><dd>{internship.deadline}</dd></div>
                </dl>
              </section>

              <section className="internDetailRecommend">
                <Sparkles />
                <div><span>筑波大生へのおすすめポイント</span><p>{internship.recommendation}</p></div>
              </section>

              {sections.map(([title, body]) => (
                <section className="internDetailSection" key={title}><h2>{title}</h2><p>{body}</p></section>
              ))}
              {listSections.map(([title, items]) => (
                <section className="internDetailSection" key={title}>
                  <h2>{title}</h2>
                  <ul>{items.map((item) => <li key={item}><CheckCircle2 />{item}</li>)}</ul>
                </section>
              ))}
              <section className="internDetailSection">
                <h2>選考フロー</h2>
                <ol>{internship.flow.map((step, index) => <li key={step}><span>{index + 1}</span><strong>{step}</strong></li>)}</ol>
              </section>
            </div>

            <aside className="internDetailActions">
              <p>このインターンに興味がありますか？</p>
              <button className="internApply" type="button">
                <Send />{internship.external ? "外部サイトで応募" : "応募する"}{internship.external && <ArrowUpRight />}
              </button>
              <button className="internTalk" type="button"><MessageCircle />話を聞いてみる</button>
              <button className="internShare" type="button" onClick={share}><Copy />URLを共有</button>
              <small>応募前の質問や相談だけでも大丈夫です。</small>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
