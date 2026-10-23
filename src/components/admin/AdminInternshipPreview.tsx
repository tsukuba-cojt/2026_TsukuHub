import ContentCover from "../career/ContentCover";
import { companyLocation, companyProfileSections, splitSelectionSteps } from "../../lib/internshipDetail";
import type { InternshipInput } from "../../types/career";
import "../../styles/career/CareerInternshipDetail.css";

type AdminInternshipPreviewProps = {
  form: InternshipInput;
  tags: string[];
};

const formatDate = (value: string) => {
  if (!value) return "未設定";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "未設定";
  return new Intl.DateTimeFormat("ja-JP", { dateStyle: "long" }).format(date);
};

export default function AdminInternshipPreview({ form, tags }: AdminInternshipPreviewProps) {
  const title = form.title.trim() || "求人タイトル（未入力）";
  const company = form.company_name.trim() || "企業名（未入力）";
  const summary = form.summary.trim() || "一言説明（未入力）";
  const steps = splitSelectionSteps(form.selection_process);
  const location = companyLocation(form);
  const closed = form.status === "closed";
  const facts: [string, string][] = [
    ["職種", form.job_category],
    ["勤務地", form.location.trim() || "未入力"],
    [
      "働き方",
      `${form.work_style.trim() || "未入力"}${form.is_remote ? " / リモート可" : ""}`,
    ],
    ["勤務条件", form.work_conditions.trim() || "未入力"],
    ["時給", form.compensation.trim() || "未入力"],
    ["募集締切", formatDate(form.deadline)],
  ];

  return (
    <section className="formSection adminJobPreview" aria-live="polite">
      <h2>公開時のプレビュー</h2>
      <p className="adminJobPreviewNote">
        入力内容が、求人一覧と詳細ページでどのように見えるかを確認できます。
      </p>

      <div className="adminJobPreviewBlock">
        <h3>一覧カード</h3>
        <div className="adminJobPreviewListing">
          <article className="alumniCard">
            <div className="alumniCardLink">
              <ContentCover
                variant="card"
                imageUrl={form.cover_image_url}
                eyebrow={form.job_category}
                title={title}
                org={company}
              />
              <div className="alumniCardBody">
                <div>
                  {form.location.trim() ? <span>{form.location}</span> : null}
                  {form.is_remote ? <span>リモート可</span> : null}
                  {form.is_featured ? <span>おすすめ</span> : null}
                  {!form.location.trim() && !form.is_remote && !form.is_featured ? (
                    <span>タグ未設定</span>
                  ) : null}
                </div>
                <h2>{title}</h2>
                {form.compensation.trim() ? (
                  <p className="alumniCardWage">{form.compensation}</p>
                ) : (
                  <p className="alumniCardWage">時給（未入力）</p>
                )}
                <p>{summary}</p>
                {tags.length > 0 ? (
                  <ul>
                    {tags.slice(0, 4).map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                ) : null}
                <em>詳しく見る</em>
              </div>
            </div>
          </article>
        </div>
      </div>

      <div className="adminJobPreviewBlock">
        <h3>詳細ページ（募集概要）</h3>
        <div className="adminJobPreviewDetail">
          <article className="internPost">
            <section className="internPostCard">
              <p className="internPostKicker">募集概要</p>
              <div className={`internPostCover${form.cover_image_url ? " hasImage" : ""}`}>
                {form.cover_image_url ? (
                  <img src={form.cover_image_url} alt="" />
                ) : (
                  <div>
                    <span>{form.job_category}</span>
                    <strong>{company}</strong>
                  </div>
                )}
              </div>

              <header className="internPostHead">
                <div className="internPostCompany">
                  <div className="internPostLogo">
                    {form.company_logo_url ? (
                      <img src={form.company_logo_url} alt={`${company}のロゴ`} />
                    ) : (
                      <span>{company.slice(0, 1)}</span>
                    )}
                  </div>
                  <div>
                    <strong>{company}</strong>
                    <span>プレビュー表示</span>
                  </div>
                  <span className={`internPostStatus${closed ? " isClosed" : ""}`}>
                    {closed ? "募集終了" : form.status === "draft" ? "下書き" : "募集中"}
                  </span>
                </div>
                <h1>{title}</h1>
                {tags.length > 0 ? (
                  <ul className="internPostTags">
                    {tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                ) : null}
                <p className="internPostLead">{summary}</p>
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
                <div className="internPostBlock">
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
              ) : (
                <div className="internPostBlock">
                  <h2>選考の流れ</h2>
                  <p>選考フロー（未入力）</p>
                </div>
              )}

              <div className="internPostBlock">
                <h2>仕事内容</h2>
                <p style={{ whiteSpace: "pre-wrap" }}>
                  {form.description.trim() || "仕事内容（未入力）"}
                </p>
              </div>
            </section>

            <section className="internPostCard">
              <p className="internPostKicker">企業について</p>
              {(companyProfileSections(form).length > 0
                ? companyProfileSections(form)
                : ([
                    ["ミッション", "未入力"],
                    ["事業内容", "未入力"],
                    ["学生に一言", "未入力"],
                  ] as const)
              ).map(([label, text]) => (
                <div className="internPostBlock" key={label}>
                  <h2>{label}</h2>
                  <p style={{ whiteSpace: "pre-wrap" }}>{text}</p>
                </div>
              ))}
              <div className="internPostBlock">
                <h2>住所</h2>
                <p>{location.address || "未入力"}</p>
                {location.embedUrl ? (
                  <div className="internPostMap">
                    <iframe
                      title={location.address ? `${location.address}の地図` : "所在地の地図"}
                      src={location.embedUrl}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
                  </div>
                ) : null}
                {location.mapUrl ? (
                  <p>
                    <a
                      className="internPostMapLink"
                      href={location.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Google マップで開く
                    </a>
                  </p>
                ) : null}
              </div>
            </section>
          </article>
        </div>
      </div>
    </section>
  );
}
