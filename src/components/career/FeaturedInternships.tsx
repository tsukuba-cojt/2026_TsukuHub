import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Internship } from "../../types/career";
import { useUniversity } from "../university/universityContextValue";

type FeaturedInternshipsProps = {
  items: Internship[];
};

export default function FeaturedInternships({ items }: FeaturedInternshipsProps) {
  const { path } = useUniversity();
  return (
    <section className="careerHomeSection">
      <div className="careerSectionHeading">
        <span>FEATURED</span>
        <h2>おすすめの長期インターン</h2>
      </div>
      {items.length > 0 ? (
        <div className="careerMiniGrid">
          {items.map((item) => (
            <Link
              className="careerMiniCard"
              to={path(`/career/internships/${item.id}`)}
              key={item.id}
            >
              <span>{item.job_category}</span>
              <h3>{item.title}</h3>
              <p>{item.company_name}</p>
              <strong>
                詳細を見る <ArrowRight aria-hidden="true" />
              </strong>
            </Link>
          ))}
        </div>
      ) : (
        <div className="careerInlineState">
          公開中のおすすめ求人は、現在準備中です。
        </div>
      )}
    </section>
  );
}
