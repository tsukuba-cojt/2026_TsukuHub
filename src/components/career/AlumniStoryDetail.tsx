import type { AlumniStoryRecord } from "../../types/content";

type AlumniStoryDetailProps = {
  story: AlumniStoryRecord;
};

export default function AlumniStoryDetail({ story }: AlumniStoryDetailProps) {
  const sections = [
    ["就活を始めた時期", story.started_at],
    ["志望業界", story.target_industries],
    ["就活で苦労したこと", story.challenge],
    ["実際に行った対策", story.actions],
    ["後輩へのアドバイス", story.advice],
    ["現在の仕事", story.current_work],
  ];

  return (
    <>
      <header>
        <span>卒業生体験記</span>
        <h1>{story.title}</h1>
        <p>
          {story.graduation_year}年度卒・{story.faculty}・{story.job_role}
        </p>
      </header>
      {sections.map(([title, body]) => (
        <section key={title}>
          <h2>{title}</h2>
          <p>{body}</p>
        </section>
      ))}
    </>
  );
}
