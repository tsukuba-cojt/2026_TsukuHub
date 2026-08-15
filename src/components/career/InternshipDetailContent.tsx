import { Link } from "react-router-dom";
import type { Internship } from "../../types/career";
import type { ArticleHeading } from "../../lib/articleMarkdown";
import { splitSelectionSteps } from "../../lib/internshipDetail";
import { useUniversity } from "../university/universityContextValue";

type InternshipDetailContentProps = {
  internship: Internship;
  closed: boolean;
  onApply: () => void;
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("ja-JP", { dateStyle: "long" }).format(new Date(date));

const formatMetaDate = (date: string) => {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return date;
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

const lines = (value: string) =>
  value
    .split(/\n+/)
    .map((line) => line.replace(/^[-・●]\s*/, "").trim())
    .filter(Boolean);

const TextBlock = ({ text }: { text: string }) => {
  const items = lines(text);
  if (items.length === 0) return null;
  if (items.length === 1) return <p>{items[0]}</p>;
  return (
    <ul>
      {items.map((item, index) => (
        <li key={`${index}-${item}`}>{item}</li>
      ))}
    </ul>
  );
};

export const internshipHeadings = (internship: Internship): ArticleHeading[] => {
  const headings: ArticleHeading[] = [
    { id: "overview", level: 2, text: "募集概要" },
    { id: "flow", level: 2, text: "選考の流れ" },
    { id: "work", level: 2, text: "仕事内容" },
  ];
  if (internship.company_description.trim()) {
    headings.push({ id: "company", level: 2, text: "企業について" });
  }
  headings.push({ id: "apply", level: 2, text: "応募" });
  return headings;
};

export default function InternshipDetailContent({
  internship,
  closed,
  onApply,
}: InternshipDetailContentProps) {
  const { path } = useUniversity();
  const updated = formatMetaDate(internship.updated_at);
  const steps = splitSelectionSteps(internship.selection_process);
  const facts: [string, string][] = [
    ["職種", internship.job_category],
    ["勤務地", internship.location],
    [
      "働き方",
      `${internship.work_style}${internship.is_remote ? " / リモート可" : ""}`,
    ],
    ["勤務条件", internship.work_conditions],
    ["給与", internship.compensation],
    ["募集締切", formatDate(internship.deadline)],
  ].filter(([, value]) => Boolean(value.trim())) as [string, string][];

  return (
    <article className="internPost">
      <section className="internPostCard" id="overview">
        <p className="internPostKicker">募集概要</p>
        <div className={`internPostCover${internship.cover_image_url ? " hasImage" : ""}`}>
          {internship.cover_image_url ? (
            <img src={internship.cover_image_url} alt="" />
          ) : (
            <div>
              <span>{internship.job_category}</span>
              <strong>{internship.company_name}</strong>
            </div>
          )}
        </div>

        <header className="internPostHead">
          <div className="internPostCompany">
            <div className="internPostLogo">
              {internship.company_logo_url ? (
                <img
                  src={internship.company_logo_url}
                  alt={`${internship.company_name}のロゴ`}
                />
              ) : (
                <span>{internship.company_name.slice(0, 1)}</span>
              )}
            </div>
            <div>
              <strong>{internship.company_name}</strong>
              <time dateTime={internship.updated_at}>{updated} 更新</time>
            </div>
            <span className={`internPostStatus${closed ? " isClosed" : ""}`}>
              {closed ? "募集終了" : "募集中"}
            </span>
          </div>
          <h1>{internship.title}</h1>
          {internship.tags.length > 0 ? (
            <ul className="internPostTags">
              {internship.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          ) : null}
          {internship.summary ? <p className="internPostLead">{internship.summary}</p> : null}
          <p>
            <Link className="internPostGuide" to={path("/career/basics")}>
              長期インターンの基礎知識を見る
            </Link>
          </p>
        </header>

        <dl className="internPostFacts">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        {steps.length > 0 ? (
          <div className="internPostBlock" id="flow">
            <h2>選考の流れ</h2>
            <ol className="internPostSteps">
              {steps.map((step, index) => (
                <li key={`${index}-${step}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{step}</strong>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        <div className="internPostBlock" id="work">
          <h2>仕事内容</h2>
          <TextBlock text={internship.description} />
        </div>

        {internship.acquirable_skills.trim() ? (
          <div className="internPostBlock">
            <h2>身につくこと</h2>
            <TextBlock text={internship.acquirable_skills} />
          </div>
        ) : null}

        {internship.requirements.trim() ? (
          <div className="internPostBlock">
            <h2>応募条件</h2>
            <TextBlock text={internship.requirements} />
          </div>
        ) : null}

        {internship.preferred_skills.trim() ? (
          <div className="internPostBlock">
            <h2>歓迎する経験</h2>
            <TextBlock text={internship.preferred_skills} />
          </div>
        ) : null}

        <div className="internPostBlock" id="apply">
          <h2>応募</h2>
          <p>
            {closed
              ? "この求人の募集は終了しました。ほかの長期インターンもぜひご覧ください。"
              : "内容を確認したら、このページから応募できます。"}
          </p>
          <button
            type="button"
            disabled={closed}
            className="careerPrimaryButton"
            onClick={onApply}
          >
            {closed ? "募集は終了しました" : "この募集に応募する"}
          </button>
        </div>
      </section>

      {internship.company_description.trim() ? (
        <section className="internPostCard" id="company">
          <p className="internPostKicker">企業について</p>
          <div className="internPostBlock">
            <h2>{internship.company_name}について</h2>
            <TextBlock text={internship.company_description} />
          </div>
        </section>
      ) : null}
    </article>
  );
}
