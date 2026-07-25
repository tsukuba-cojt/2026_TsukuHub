import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  MapPin,
  MessageSquareQuote,
  Sparkles,
} from "lucide-react";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import "../styles/career/Career.css";

const categories = [
  {
    id: "career-basics",
    icon: BookOpenCheck,
    eyebrow: "JOB HUNTING BASICS",
    title: "基礎知識",
    description: "就活や長期インターンの進め方を、基礎から学べます",
    button: "基礎知識を見る",
    color: "blue",
  },
  {
    id: "career-internships",
    icon: BriefcaseBusiness,
    eyebrow: "LONG-TERM INTERNSHIP",
    title: "長期インターン情報",
    description: "筑波大生が応募できる長期インターンを探せます",
    button: "インターンを探す",
    color: "green",
  },
  {
    id: "career-stories",
    icon: MessageSquareQuote,
    eyebrow: "ALUMNI STORIES",
    title: "卒業生の体験記",
    description: "筑波大学の卒業生や先輩の経験から、就活とキャリアを学べます",
    button: "体験記を読む",
    color: "purple",
  },
] as const;

const articles = [
  {
    category: "基礎知識",
    title: "就活はいつから？ 学年別スケジュールと最初にやること",
    summary: "大学生活と両立しながら進めるための準備を、時期ごとに整理します。",
    date: "2026/07/18",
    readTime: "6分",
  },
  {
    category: "長期インターン",
    title: "筑波大生向け・長期インターンの探し方と選び方",
    summary: "職種、勤務条件、通いやすさなど、応募前に確認したいポイントを紹介します。",
    date: "2026/07/12",
    readTime: "8分",
  },
  {
    category: "卒業生の体験記",
    title: "研究と就活を両立。理系院卒の先輩に聞いた選考対策",
    summary: "研究スケジュールの組み方から面接準備まで、実体験をもとに聞きました。",
    date: "2026/07/05",
    readTime: "10分",
  },
  {
    category: "基礎知識",
    title: "自己分析で迷わないための3つの視点",
    summary: "経験の棚卸しから、自分らしい強みを言葉にする方法を解説します。",
    date: "2026/06/28",
    readTime: "5分",
  },
] as const;

function Career() {
  return (
    <div className="careerPage">
      <Globalnav />

      <main>
        <div className="careerContainer">
          <nav className="careerBreadcrumb" aria-label="パンくずリスト">
            <Link to="/">ホーム</Link>
            <span aria-hidden="true">/</span>
            <span>就活・キャリア</span>
          </nav>

          <section className="careerHero">
            <div className="careerHeroCopy">
              <span className="careerHeroLabel">
                <Sparkles aria-hidden="true" />
                CAREER SUPPORT
              </span>
              <h1>就活・キャリア</h1>
              <p>
                筑波大生の就活とキャリア選択を、知る・探す・学ぶの3つの入口からサポートします。
              </p>
            </div>
            <div className="careerHeroVisual" aria-hidden="true">
              <BriefcaseBusiness />
              <span className="careerHeroVisualDot dotOne" />
              <span className="careerHeroVisualDot dotTwo" />
              <span className="careerHeroVisualDot dotThree" />
            </div>
          </section>

          <section className="careerCategories" aria-labelledby="career-categories-title">
            <div className="careerSectionHeading">
              <span>3つのカテゴリー</span>
              <h2 id="career-categories-title">目的から探す</h2>
              <p>知りたい情報に合わせて、カテゴリーを選んでください。</p>
            </div>

            <div className="careerCategoryGrid">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <article
                    className={`careerCategoryCard is-${category.color}`}
                    id={category.id}
                    key={category.title}
                  >
                    <div className="careerCategoryIcon">
                      <Icon aria-hidden="true" />
                    </div>
                    <p className="careerCategoryEyebrow">{category.eyebrow}</p>
                    <h3>{category.title}</h3>
                    <p className="careerCategoryDescription">{category.description}</p>
                    <a className="careerCategoryButton" href="#career-articles">
                      {category.button}
                      <ArrowRight aria-hidden="true" />
                    </a>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="careerArticles" id="career-articles" aria-labelledby="career-articles-title">
            <div className="careerArticlesHeader">
              <div className="careerSectionHeading">
                <span>CAREER ARTICLES</span>
                <h2 id="career-articles-title">役立つ就活・キャリア情報</h2>
                <p>就活準備やキャリアを考えるときに役立つ記事をお届けします。</p>
              </div>
              <a className="careerTextLink" href="#career-articles">
                記事をすべて見る
                <ArrowRight aria-hidden="true" />
              </a>
            </div>

            <div className="careerArticleList">
              {articles.map((article) => (
                <article className="careerArticleCard" key={article.title}>
                  <div className="careerArticleMeta">
                    <span>{article.category}</span>
                    <time dateTime={article.date.replaceAll("/", "-")}>
                      <CalendarDays aria-hidden="true" />
                      {article.date}
                    </time>
                  </div>
                  <h3>{article.title}</h3>
                  <p>{article.summary}</p>
                  <div className="careerArticleFooter">
                    <span>
                      <Clock3 aria-hidden="true" />
                      読了目安 {article.readTime}
                    </span>
                    <a href="#career-articles" aria-label={`${article.title}を読む`}>
                      記事を読む
                      <ArrowRight aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>

            <div className="careerLocationNote">
              <MapPin aria-hidden="true" />
              <p>
                筑波大生向けの情報を中心に、オンライン参加やつくば周辺の情報も掲載しています。
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Career;
