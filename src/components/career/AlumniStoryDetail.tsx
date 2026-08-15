import type { AlumniStoryRecord } from "../../types/content";
import ContentCover from "./ContentCover";

type AlumniStoryDetailProps = {
  story: AlumniStoryRecord;
};

const interviewSections = (story: AlumniStoryRecord) => [
  ["就活を始めたのはいつですか？", story.started_at],
  ["どのような業界を志望していましたか？", story.target_industries],
  ["就活で苦労したことは何ですか？", story.challenge],
  ["実際にどのような対策をしましたか？", story.actions],
  ["後輩へのアドバイスを教えてください。", story.advice],
  ["現在はどのような仕事をしていますか？", story.current_work],
] as const;

const formatStoryDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

export default function AlumniStoryDetail({ story }: AlumniStoryDetailProps) {
  const published = formatStoryDate(story.created_at);
  const updated = formatStoryDate(story.updated_at);

  return (
    <article className="alumniArticle">
      <ContentCover
        variant="article"
        imageUrl={story.cover_image_url}
        eyebrow="Graduate Interview"
        title={story.job_role}
        org={story.destination}
        meta={`${story.faculty} ・ ${story.graduation_year}年度卒`}
      />

      <h1 className="alumniArticleTitle">{story.title}</h1>

      <div className="alumniArticleInfo">
        <span className="alumniCategoryLabel">卒業生のキャリア</span>
        <dl className="alumniArticleMeta">
          {published && (
            <div>
              <dt>公開日</dt>
              <dd>
                <time dateTime={story.created_at}>{published}</time>
              </dd>
            </div>
          )}
          {updated && (
            <div>
              <dt>更新日</dt>
              <dd>
                <time dateTime={story.updated_at}>{updated}</time>
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="alumniArticleBody">
        <p className="alumniLead">{story.summary}</p>
        {interviewSections(story).map(([question, answer]) => (
          <div className="alumniInterviewBlock" key={question}>
            <p className="alumniQuestion">
              <strong>──{question}</strong>
            </p>
            <p className="alumniAnswer">{answer}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
