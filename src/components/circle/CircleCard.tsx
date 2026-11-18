import { Link } from "react-router-dom";
import { Calendar, ChevronRight, User } from "lucide-react";
import { useUniversity } from "../university/universityContextValue";
import { circleCategoryClass, type Circle } from "./mockCircles";
import "../../styles/circle/CircleCard.css";

type CircleCardProps = {
  circle: Circle;
};

function CircleCard({ circle }: CircleCardProps) {
  const { path } = useUniversity();
  const [membersPrefix, membersCount, membersSuffix] = circle.members.split(/(\d+)/);

  return (
    <Link to={path(`/circles/${circle.id}`)} className="circleCardLink">
      <article className="circleCard">
        <div className="circleCardBody">
          <div className="circleCardImage">
            {circle.image && <img src={circle.image} alt="" />}
          </div>
          <div className="circleCardMain">
            <span className={`circleCategoryBadge ${circleCategoryClass[circle.category]}`}>
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
    </Link>
  );
}

export default CircleCard;
