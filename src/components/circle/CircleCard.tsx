import { Calendar, ChevronRight, User } from "lucide-react";
import type { Circle, CircleCategory } from "./mockCircles";
import "../../styles/circle/CircleCard.css";

const categoryClass: Record<CircleCategory, string> = {
  文化系: "isCulture",
  体育系: "isSports",
  学術系: "isAcademic",
  ボランティア系: "isVolunteer",
};

type CircleCardProps = {
  circle: Circle;
};

function CircleCard({ circle }: CircleCardProps) {
  const [membersPrefix, membersCount, membersSuffix] = circle.members.split(/(\d+)/);

  return (
    <article className="circleCard">
      <div className="circleCardBody">
        <div className="circleCardImage">
          {circle.image && <img src={circle.image} alt="" />}
        </div>
        <div className="circleCardMain">
          <span className={`circleCategoryBadge ${categoryClass[circle.category]}`}>
            {circle.category}
          </span>
          <h2>{circle.name}</h2>
          <p className="circleCardDescription">{circle.description}</p>
          <div className="circleCardTags">
            {circle.tags.map((tag) => (
              <span className="circleCardTag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="circleCardChips">
        <span>
          <Calendar aria-hidden="true" />
          {circle.frequency}
        </span>
        <span>
          <User aria-hidden="true" />
          {membersPrefix}
          <span className="circleNumber">{membersCount}</span>
          {membersSuffix}
        </span>
      </div>

      <ChevronRight className="circleCardChevron" aria-hidden="true" />
    </article>
  );
}

export default CircleCard;
