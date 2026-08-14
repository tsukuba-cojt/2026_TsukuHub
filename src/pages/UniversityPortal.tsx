import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  GraduationCap,
  LibraryBig,
  MessagesSquare,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getLastUniversitySlug } from "../lib/tenantSession";
import { listUniversities } from "../services/universityService";
import type { University } from "../types/university";
import "../styles/university/UniversityPortal.css";

const serviceFeatures = [
  {
    icon: BookOpenCheck,
    label: "授業・履修",
    title: "授業選びを、確かな情報から。",
    description: "授業検索、学生の口コミ、時間割、卒業要件の確認をひとつにつなぎます。",
    className: "isBlue",
  },
  {
    icon: BriefcaseBusiness,
    label: "キャリア",
    title: "次の一歩を、大学に合った情報で。",
    description: "長期インターン、就活記事、同じ大学の卒業生の体験記をまとめて届けます。",
    className: "isPurple",
  },
  {
    icon: MessagesSquare,
    label: "リアルな体験",
    title: "先輩の経験が、判断材料になる。",
    description: "公式情報だけでは分からない、学生と卒業生の具体的な経験を蓄積します。",
    className: "isGreen",
  },
  {
    icon: CalendarDays,
    label: "大学別のお知らせ",
    title: "自分に必要な情報だけを、見逃さない。",
    description: "所属大学に合わせて、ニュースや学生生活に必要な情報を整理して表示します。",
    className: "isOrange",
  },
];

const userBenefits = [
  "大学生活の情報を何か所も探し回らなくていい",
  "所属大学に関係する情報だけが表示される",
  "授業選びからキャリア選択まで同じ場所で考えられる",
];

export default function UniversityPortal() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const lastUniversity = getLastUniversitySlug();

  useEffect(() => {
    void listUniversities()
      .then(setUniversities)
      .catch(() => setError("大学一覧を取得できませんでした。"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="universityPortal">
      <header className="portalHeader">
        <Link to="/" className="portalBrand">TsukuHub</Link>
        <nav className="portalHeaderNav" aria-label="トップページナビゲーション">
          <a href="#about">サービスについて</a>
          <a href="#universities">大学を選ぶ</a>
          <Link to="/admin" className="portalAdminLink"><ShieldCheck aria-hidden="true" />管理者</Link>
        </nav>
      </header>

      <main>
        <section className="portalHero">
          <div className="portalHeroCopy">
            <p className="portalEyebrow"><Sparkles aria-hidden="true" /> ONE HUB, EVERY CAMPUS</p>
            <h1>大学生活の<br /><span>「知りたい」</span>を、<br />ひとつの場所に。</h1>
            <p>授業、履修、キャリア、先輩の体験。<br />所属大学に合わせた情報を、迷わず見つけられるキャンパスポータルです。</p>
            <div className="portalHeroActions">
              <a className="portalPrimaryButton" href="#universities">大学を選んではじめる <ArrowDown aria-hidden="true" /></a>
              <a className="portalTextLink" href="#about">TsukuHubについて知る <ArrowRight aria-hidden="true" /></a>
            </div>
          </div>

          <div className="portalHeroVisual" aria-label="TsukuHubで利用できる情報のイメージ">
            <div className="portalVisualGlow" />
            <article className="portalVisualWindow">
              <header><span /><span /><span /><strong>TsukuHub</strong></header>
              <div className="portalVisualBody">
                <div className="portalVisualSearch"><Search aria-hidden="true" /><span>大学生活の情報を検索</span></div>
                <div className="portalVisualCards">
                  <div><BookOpenCheck aria-hidden="true" /><span>授業・履修</span><strong>13,467</strong><small>件の授業情報</small></div>
                  <div><BriefcaseBusiness aria-hidden="true" /><span>キャリア</span><strong>大学別</strong><small>求人・体験記</small></div>
                </div>
                <div className="portalVisualNews"><i /><div><small>大学からのお知らせ</small><strong>必要な情報をまとめてチェック</strong></div></div>
              </div>
            </article>
            <span className="portalFloatingBadge isTop"><GraduationCap aria-hidden="true" /> 大学ごとに最適化</span>
            <span className="portalFloatingBadge isBottom"><ShieldCheck aria-hidden="true" /> データを大学別に分離</span>
          </div>
        </section>

        <section className="portalUniversities" id="universities" aria-labelledby="university-heading">
          <div className="portalSectionHeading">
            <span>SELECT YOUR UNIVERSITY</span>
            <h2 id="university-heading">所属する大学を選んでください</h2>
            <p>大学ごとのページからログインすると、あなたの大学専用の情報が表示されます。</p>
          </div>
          {loading ? (
            <p className="portalState">読み込んでいます...</p>
          ) : error ? (
            <p className="portalState isError">{error}</p>
          ) : (
            <div className="universityCardGrid">
              {universities.map((university) => (
                <Link
                  className={`universityCard${university.slug === lastUniversity ? " isRecent" : ""}${university.status === "suspended" ? " isSuspended" : ""}`}
                  to={`/${university.slug}`}
                  key={university.id}
                >
                  {university.slug === lastUniversity && <small>前回利用した大学</small>}
                  {university.status === "suspended" && <small>サービス停止中</small>}
                  <span className="universityCardIcon"><GraduationCap aria-hidden="true" /></span>
                  <span className="universityCardCode">TSUKUHUB FOR {university.slug.toUpperCase()}</span>
                  <h3>{university.name}</h3>
                  <p>{university.tagline}</p>
                  <strong>この大学ではじめる <ArrowRight aria-hidden="true" /></strong>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="portalAbout" id="about">
          <div className="portalAboutIntro">
            <div>
              <p className="portalEyebrow">WHAT IS TSUKUHUB?</p>
              <h2>情報を探す時間を、<br />大学生活を選ぶ時間へ。</h2>
            </div>
            <div>
              <p>大学生活に必要な情報は、大学公式サイト、シラバス、SNS、先輩の口コミなど、さまざまな場所に分散しています。</p>
              <p>TsukuHubはそれらを大学ごとに整理し、学生が「いま知りたいこと」へすぐ辿り着ける状態をつくるサービスです。</p>
            </div>
          </div>

          <div className="portalProblemFlow" aria-label="TsukuHubが解決する課題">
            <article>
              <span>BEFORE</span>
              <h3>情報がバラバラ</h3>
              <p>サイトやSNSを行き来して、正しい情報を自分で探し続ける。</p>
              <div className="portalScatteredSources"><i>大学サイト</i><i>SNS</i><i>口コミ</i><i>シラバス</i></div>
            </article>
            <ArrowRight className="portalFlowArrow" aria-hidden="true" />
            <article className="isAfter">
              <span>WITH TSUKUHUB</span>
              <h3>大学別に、ひとつに集約</h3>
              <p>必要な情報をひとつの入口から確認し、次の行動へ進める。</p>
              <div className="portalHubMark"><GraduationCap aria-hidden="true" /><strong>TsukuHub</strong></div>
            </article>
          </div>
        </section>

        <section className="portalFeatures" aria-labelledby="feature-heading">
          <div className="portalSectionHeading">
            <span>WHAT YOU CAN DO</span>
            <h2 id="feature-heading">大学生活の意思決定を支える機能</h2>
            <p>大学によって利用できる機能や掲載内容を切り替えながら、基本の使い方は共通です。</p>
          </div>
          <div className="portalFeatureGrid">
            {serviceFeatures.map((feature) => {
              const FeatureIcon = feature.icon;
              return <article className={feature.className} key={feature.label}>
                <span className="portalFeatureIcon"><FeatureIcon aria-hidden="true" /></span>
                <small>{feature.label}</small>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>;
            })}
          </div>
        </section>

        <section className="portalForStudents">
          <div className="portalStudentVisual">
            <div className="portalStudentCircle"><LibraryBig aria-hidden="true" /></div>
            <span className="isOne">授業を探す</span>
            <span className="isTwo">体験記を読む</span>
            <span className="isThree">求人を見つける</span>
          </div>
          <div className="portalStudentCopy">
            <p className="portalEyebrow">BUILT FOR STUDENTS</p>
            <h2>その大学で学ぶ、<br />すべての学生のために。</h2>
            <p>新入生、在学生、大学院生。学年や知り合いの多さにかかわらず、必要な情報へ同じようにアクセスできる環境を目指しています。</p>
            <ul>{userBenefits.map((benefit) => <li key={benefit}><Check aria-hidden="true" />{benefit}</li>)}</ul>
            <a className="portalPrimaryButton" href="#universities">自分の大学を選ぶ <ArrowRight aria-hidden="true" /></a>
          </div>
        </section>

        <section className="portalArchitecture">
          <ShieldCheck aria-hidden="true" />
          <div><p className="portalEyebrow">ONE SERVICE, EACH UNIVERSITY</p><h2>使いやすさは共通に。<br />情報とアカウントは大学ごとに。</h2></div>
          <p>TsukuHubはひとつのサービスでありながら、表示する授業、体験記、ニュース、ユーザーデータを大学単位で分離しています。別の大学の学生情報が混ざることはありません。</p>
        </section>

        <section className="portalFinalCta">
          <GraduationCap aria-hidden="true" />
          <p>READY TO START?</p>
          <h2>あなたの大学のTsukuHubへ。</h2>
          <p>所属大学を選んで、必要な情報を探しはじめましょう。</p>
          <a className="portalPrimaryButton isWhite" href="#universities">大学を選ぶ <ArrowRight aria-hidden="true" /></a>
        </section>
      </main>

      <footer className="portalFooter"><Link to="/" className="portalBrand">TsukuHub</Link><p>大学生活の情報を、ひとつの場所に。</p><span>© 2026 TsukuHub</span></footer>
    </div>
  );
}
