import { BriefcaseBusiness } from "lucide-react";
import type { Internship } from "../../types/career";
import InternshipCard from "./InternshipCard";

type InternshipListProps = {
  items: Internship[];
  loading: boolean;
  error: string;
  currentTime: number;
  onReload: () => void;
  onClearFilter: () => void;
};

export default function InternshipList({
  items,
  loading,
  error,
  currentTime,
  onReload,
  onClearFilter,
}: InternshipListProps) {
  return (
    <section className="internshipList">
      <h2>
        募集中の求人 <span>{items.length}件</span>
      </h2>
      {loading ? (
        <div className="careerState">求人を読み込んでいます...</div>
      ) : error ? (
        <div className="careerState isError">
          <p>{error}</p>
          <button onClick={onReload}>再読み込み</button>
        </div>
      ) : items.length === 0 ? (
        <div className="careerState">
          <BriefcaseBusiness aria-hidden="true" />
          <h3>条件に合う求人はありません</h3>
          <button onClick={onClearFilter}>すべて表示する</button>
        </div>
      ) : (
        <div className="internshipCards">
          {items.map((item) => (
            <InternshipCard
              internship={item}
              currentTime={currentTime}
              key={item.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}
