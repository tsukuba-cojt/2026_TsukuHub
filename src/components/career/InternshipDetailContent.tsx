import { BriefcaseBusiness, CalendarDays, Check, MapPin } from "lucide-react";
import type { Internship } from "../../types/career";

type InternshipDetailContentProps = {
  internship: Internship;
  closed: boolean;
  onApply: () => void;
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("ja-JP", { dateStyle: "long" }).format(new Date(date));

export default function InternshipDetailContent({
  internship,
  closed,
  onApply,
}: InternshipDetailContentProps) {
  const sections = [
    ["仕事内容", internship.description],
    ["応募条件", internship.requirements],
    ["歓迎スキル", internship.preferred_skills],
    ["身につくスキル", internship.acquirable_skills],
    ["選考フロー", internship.selection_process],
    ["企業紹介", internship.company_description],
  ];

  return (
    <div className="internshipDetailLayout">
      <div className="internshipDetailMain">
        <section className="detailFacts">
          <h2>募集情報</h2>
          <dl>
            <div>
              <dt>
                <BriefcaseBusiness aria-hidden="true" />職種
              </dt>
              <dd>{internship.job_category}</dd>
            </div>
            <div>
              <dt>
                <MapPin aria-hidden="true" />勤務地
              </dt>
              <dd>{internship.location}</dd>
            </div>
            <div>
              <dt>勤務形態</dt>
              <dd>
                {internship.work_style}・
                {internship.is_remote ? "リモート可" : "原則出社"}
              </dd>
            </div>
            <div>
              <dt>稼働条件</dt>
              <dd>{internship.work_conditions}</dd>
            </div>
            <div>
              <dt>報酬</dt>
              <dd>{internship.compensation}</dd>
            </div>
            <div>
              <dt>
                <CalendarDays aria-hidden="true" />募集締切
              </dt>
              <dd>{formatDate(internship.deadline)}</dd>
            </div>
          </dl>
        </section>
        {sections.map(([title, body]) => (
          <section className="detailTextSection" key={title}>
            <h2>{title}</h2>
            {title === "選考フロー" ? (
              <ol>
                {body
                  .split(/→|\n/)
                  .filter(Boolean)
                  .map((line) => (
                    <li key={line}>
                      <Check aria-hidden="true" />
                      {line.trim()}
                    </li>
                  ))}
              </ol>
            ) : (
              <p>{body}</p>
            )}
          </section>
        ))}
      </div>
      <aside className="detailApplyBox">
        <p>
          {closed
            ? "この求人の募集は終了しました"
            : "興味を持ったら、応募情報を入力してください"}
        </p>
        <button
          disabled={closed}
          className="careerPrimaryButton"
          onClick={onApply}
        >
          {closed ? "募集は終了しました" : "応募する"}
        </button>
        <small>応募前に仕事内容・条件をご確認ください。</small>
      </aside>
    </div>
  );
}
