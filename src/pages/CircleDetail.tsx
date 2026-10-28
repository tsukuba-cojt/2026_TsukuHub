import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Bookmark,
  Calendar,
  ChevronRight,
  Link as LinkIcon,
  MapPin,
  Megaphone,
  MessageCircleMore,
  PenLine,
  Smile,
  Sparkle,
  SquareArrowOutUpRight,
  SquarePen,
  User,
  UsersRound,
} from "lucide-react";
import { useUniversity } from "../components/university/universityContextValue";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import RatingStars from "../components/class/RatingStars";
import { circleCategoryClass, getCircleNotices, getCircleReviews, mockCircles } from "../components/circle/mockCircles";
import "../styles/class/Class.css";
import "../styles/class/ClassDetail.css";
import "../styles/circle/CircleCard.css";
import "../styles/circle/CircleDetail.css";

const facultyColors = ["#4fb8f5", "var(--color-label-club)", "#d9d9d9", "var(--color-label-job)", "var(--color-label-life)"];

function CircleDetail() {
  const { path } = useUniversity();
  const { circleId } = useParams<{ circleId: string }>();
  const navigate = useNavigate();
  const circle = mockCircles.find((item) => item.id === circleId);

  if (!circle) {
    return (
      <div className="classPage">
        <Globalnav />
        <main className="classPageLayout">
          <div className="classDetailNotFound">
            <p className="classStatus">該当するサークルが見つかりませんでした（ID：{circleId}）。</p>
            <Link to={path("/circles/search")} className="classDetailBackLink">
              サークル検索へ戻る
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { detail } = circle;
  const [membersPrefix, membersCount, membersSuffix] = circle.members.split(/(\d+)/);
  const gradeMembers = detail.gradeMembers.filter((item) => item.count > 0).sort((a, b) => b.grade - a.grade);
  const totalMembers = gradeMembers.reduce((sum, item) => sum + item.count, 0);
  const notices = getCircleNotices(circle);
  const reviews = getCircleReviews(circle);
  const reviewCount = reviews.length;
  const averageRating = reviewCount ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount : 0;

  return (
    <div className="classPage">
      <Globalnav />
      <main className="classPageLayout">
        <p className="classBreadcrumb">
          <Link to={path()} className="classBreadcrumbLink">
            ホーム
          </Link>{" "}
          &gt; サークル・課外活動 &gt;{" "}
          <Link to={path("/circles/search")} className="classBreadcrumbLink">
            サークル検索
          </Link>{" "}
          &gt; {circle.name}
        </p>

        <div className="classDetailPanel">
          <section className="classDetailInfoCard circleDetailInfoCard">
            <div className="circleDetailInfoMain">
              <div className="circleDetailImage">{circle.image && <img src={circle.image} alt="" />}</div>
              <div className="circleDetailSummary">
                <span className={`circleCategoryBadge ${circleCategoryClass[circle.category]}`}>{circle.category}</span>
                <h1>{circle.name}</h1>
                <p className="circleDetailDescription">{circle.description}</p>
                <div className="circleCardTags">
                  {circle.tags.map((tag) => (
                    <span className="circleCardTag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <dl className="circleDetailFacts">
                  <div>
                    <Calendar aria-hidden="true" />
                    <dt>主な活動日</dt>
                    <dd>{detail.activityDays}</dd>
                  </div>
                  <div>
                    <MapPin aria-hidden="true" />
                    <dt>主な活動場所</dt>
                    <dd>{detail.activityPlace}</dd>
                  </div>
                  <div>
                    <User aria-hidden="true" />
                    <dt>所属人数</dt>
                    <dd>
                      {membersPrefix}
                      <span className="circleNumber">{membersCount}</span>
                      {membersSuffix}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="classDetailActions">
              <button type="button" className="classDetailActionBtn">
                <Bookmark aria-hidden="true" />
                ブックマーク
              </button>
              <button
                type="button"
                className="classDetailActionBtn isPrimary"
                onClick={() => navigate(path(`/circles/${circle.id}/review`))}
              >
                <SquarePen aria-hidden="true" />
                口コミを投稿
              </button>
            </div>
          </section>

          <div className="circleDetailBody">
            <div className="circleDetailMain">
              <section className="sidebarCard circleDetailCard">
                <div className="circleDetailCardHead">
                  <h2>
                    <Megaphone aria-hidden="true" />
                    サークルからのお知らせ
                  </h2>
                  <Link to={path(`/circles/${circle.id}/notices`)} className="circleDetailMore">
                    一覧を見る
                    <ChevronRight aria-hidden="true" />
                  </Link>
                </div>
                <ul className="circleDetailNotices">
                  {notices.slice(0, 3).map((notice) => (
                    <li key={`${notice.date}-${notice.title}`}>
                      <time className="circleNumber">{notice.date}</time>
                      <div>
                        <strong>{notice.title}</strong>
                        <p>{notice.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="sidebarCard circleDetailCard">
                <div className="circleDetailCardHead">
                  <h2>
                    <Sparkle aria-hidden="true" />
                    サークルの詳細
                  </h2>
                </div>
                <div className="circleDetailGrid">
                  <div className="circleDetailBlock">
                    <h3>
                      <Calendar aria-hidden="true" />
                      活動日・場所
                    </h3>
                    <table className="circleDetailTable">
                      <tbody>
                        <tr>
                          <th>活動日</th>
                          <td>
                            {detail.activityDays}
                            <br />
                            <span className="circleNumber">{detail.activityTime}</span>
                          </td>
                        </tr>
                        <tr>
                          <th>活動場所</th>
                          <td>{detail.activityPlace}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="circleDetailBlock">
                    <h3>
                      <UsersRound aria-hidden="true" />
                      構成人数
                    </h3>
                    <p className="circleDetailTotal">
                      合計<strong className="circleNumber">{totalMembers}</strong>名
                    </p>
                    <p className="circleDetailGrades">
                      (
                      {gradeMembers.map((item, index) => (
                        <span key={item.grade}>
                          {index > 0 && " / "}
                          <span className="circleNumber">{item.grade}</span>年
                          <span className="circleNumber">{item.count}</span>名
                        </span>
                      ))}
                      )
                    </p>
                    <p className="circleDetailSubhead">所属学類の割合</p>
                    <div className="circleDetailRatioBar">
                      {detail.facultyRatios.map((ratio, index) => (
                        <span
                          key={ratio.name}
                          style={{ width: `${ratio.percent}%`, background: facultyColors[index % facultyColors.length] }}
                        />
                      ))}
                    </div>
                    <ul className="circleDetailLegend">
                      {detail.facultyRatios.map((ratio, index) => (
                        <li key={ratio.name} style={{ width: `${ratio.percent}%` }}>
                          <span>
                            <i style={{ background: facultyColors[index % facultyColors.length] }} />
                            {ratio.name}
                          </span>
                          <strong className="circleNumber">{ratio.percent}%</strong>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="circleDetailBlock">
                    <h3>
                      <Smile aria-hidden="true" />
                      雰囲気
                    </h3>
                    <div className="circleCardTags circleDetailMoodTags">
                      {detail.atmosphereTags.map((tag) => (
                        <span className="circleCardTag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="circleDetailMoodText">{detail.atmosphereDescription}</p>
                  </div>

                  <div className="circleDetailBlock">
                    <h3>
                      <LinkIcon aria-hidden="true" />
                      外部リンク・SNS
                    </h3>
                    <ul className="circleDetailLinks">
                      {detail.links.map((link) => (
                        <li key={link.url}>
                          <span>{link.label}</span>
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            {link.text}
                          </a>
                          <SquareArrowOutUpRight aria-hidden="true" />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {detail.additionalInfo && (
                  <div className="circleDetailExtra">
                    <h3>
                      <PenLine aria-hidden="true" />
                      サークルからの追加情報
                    </h3>
                    <p>{detail.additionalInfo}</p>
                  </div>
                )}
              </section>
            </div>

            <section className="sidebarCard circleDetailCard circleDetailReviews">
              <div className="circleDetailCardHead">
                <h2>
                  <MessageCircleMore aria-hidden="true" />
                  口コミ一覧
                </h2>
              </div>
              <div className="sidebarScoreRow circleDetailScore">
                <strong className="circleNumber">{averageRating.toFixed(1)}</strong>
                <RatingStars rating={averageRating} />
                <span>
                  (<span className="circleNumber">{reviewCount}</span>件の評価)
                </span>
              </div>
              <div className="circleDetailReviewScroll">
                <ul className="circleDetailReviewList">
                  {reviews.slice(0, 10).map((review) => (
                    <li key={`${review.date}-${review.comment}`}>
                      <time className="circleNumber">{review.date}</time>
                      <div className="circleDetailReviewMeta">
                        <RatingStars rating={review.rating} />
                        <span>
                          {review.grade} {review.department}
                        </span>
                      </div>
                      <p>{review.comment}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <Link to={path(`/circles/${circle.id}/reviews`)} className="circleDetailMore circleDetailReviewMore">
                一覧を見る
                <ChevronRight aria-hidden="true" />
              </Link>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default CircleDetail;
