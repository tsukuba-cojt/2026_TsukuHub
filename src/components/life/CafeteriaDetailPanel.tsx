import { ExternalLink, Info, SquarePen } from "lucide-react";
import mapPinIcon from "../../assets/utility/Map.svg";
import RatingStars from "../class/RatingStars";
import { CafeteriaCategoryBadge, PaymentIcons } from "./CafeteriaTags";
import {
  CONGESTION_SLOT_MINUTES,
  CONGESTION_START_HOUR,
  mockCafeteriaReviews,
  type Cafeteria,
} from "./mockCafeterias";
import { isOpenNow, toMinutes } from "../../lib/cafeteriaSearch";
import "../../styles/utility/ComingSoon.css";
import "../../styles/life/Cafeteria.css";

const AXIS_HOURS = [8, 10, 12, 14, 16];
const PHOTO_TILE_COUNT = 27;
const PHOTO_PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1' height='1'><rect width='1' height='1' fill='%23d9d9d9'/></svg>";

type CongestionLevel = "isLow" | "isMid" | "isHigh";

const congestionLevel = (value: number): CongestionLevel =>
  value > 70 ? "isHigh" : value > 40 ? "isMid" : "isLow";

const congestionLabel: Record<CongestionLevel, string> = {
  isLow: "空いている",
  isMid: "やや混雑",
  isHigh: "混雑",
};

const formatSlot = (minutes: number) =>
  `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;

/** 現在時刻の混雑状況の文言。営業時間外なら「営業時間外」 */
function currentCongestionText(cafeteria: Cafeteria, now: Date): string {
  if (!isOpenNow(cafeteria, now)) return "営業時間外";
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const index = Math.floor((nowMinutes - CONGESTION_START_HOUR * 60) / CONGESTION_SLOT_MINUTES);
  const value = cafeteria.congestion[index];
  // 営業中だがグラフの範囲外（夕方以降など）は混雑データがない
  if (index < 0 || value === undefined) return "混雑データなし";
  return `${congestionLabel[congestionLevel(value)]} の可能性`;
}

function CongestionChart({ cafeteria, now }: { cafeteria: Cafeteria; now: Date }) {
  const today = now.getDay();
  const chartDay = cafeteria.hours.slots.some((slot) => slot.days.includes(today)) ? today : 1;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const chartStart = CONGESTION_START_HOUR * 60;
  const chartLength = cafeteria.congestion.length * CONGESTION_SLOT_MINUTES;

  const bars = cafeteria.congestion.map((value, index) => {
    const start = chartStart + index * CONGESTION_SLOT_MINUTES;
    const end = start + CONGESTION_SLOT_MINUTES;
    const open = cafeteria.hours.slots.some(
      (slot) =>
        slot.days.includes(chartDay) && toMinutes(slot.open) < end && toMinutes(slot.close) > start,
    );
    const isCurrent = chartDay === today && nowMinutes >= start && nowMinutes < end;
    return { value, start, open, isCurrent, level: congestionLevel(value) };
  });

  const openBars = bars.filter((bar) => bar.open);
  const peak = openBars.reduce<(typeof bars)[number] | null>(
    (best, bar) => (!best || bar.value > best.value ? bar : best),
    null,
  );
  const summary = peak
    ? `混雑傾向グラフ。最も混むのは${formatSlot(peak.start)}頃`
    : "混雑傾向グラフ。8時〜16時は営業時間外です";

  return (
    <div className="cafeteriaChart" role="img" aria-label={summary}>
      <div className="cafeteriaChartBars">
        {bars.map((bar) => (
          <span className="cafeteriaChartSlot" key={bar.start}>
            {bar.open && (
              <>
                <span
                  className={`cafeteriaChartBar ${bar.level}${bar.isCurrent ? " isCurrent" : ""}`}
                  style={{ height: `${bar.value}%` }}
                />
                <span
                  className="comingSoonTip cafeteriaChartTip"
                  style={{ bottom: `calc(${bar.value}% + 6px)` }}
                  aria-hidden="true"
                >
                  {formatSlot(bar.start)}-{formatSlot(bar.start + CONGESTION_SLOT_MINUTES)}{" "}
                  {congestionLabel[bar.level]}
                </span>
              </>
            )}
          </span>
        ))}
      </div>
      <div className="cafeteriaChartAxis" aria-hidden="true">
        {AXIS_HOURS.map((hour) => (
          <span
            key={hour}
            style={{ left: `${((hour * 60 - chartStart) / chartLength) * 100}%` }}
          >
            {hour}時
          </span>
        ))}
      </div>
    </div>
  );
}

function MenuSection({ cafeteria }: { cafeteria: Cafeteria }) {
  const photoNames = Array.from({ length: PHOTO_TILE_COUNT }, (_, index) =>
    cafeteria.mainMenu
      ? cafeteria.mainMenu[index % cafeteria.mainMenu.length].name
      : `メニュー写真${index + 1}`,
  );

  return (
    <div className="cafeteriaMenu">
      <div className={`cafeteriaMainMenu${cafeteria.mainMenu ? " hasList" : ""}`}>
        {cafeteria.mainMenu ? (
          <>
            <p className="cafeteriaMainMenuTitle">メインメニュー</p>
            <ul>
              {cafeteria.mainMenu.map((item) => (
                <li key={item.name}>
                  <span>{item.name}</span>
                  <span className="cafeteriaNumber">{item.price}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <span>メインメニュー</span>
        )}
      </div>
      <div className="cafeteriaMenuPhotosWrap">
        <div className="cafeteriaMenuPhotos" tabIndex={0} aria-label="メニュー写真（横にスクロールできます）">
          {photoNames.map((name, index) => (
            <img src={PHOTO_PLACEHOLDER} alt={name} key={`${name}-${index}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

type CafeteriaDetailPanelProps = {
  cafeteria: Cafeteria | null;
  now: Date;
};

function CafeteriaDetailPanel({ cafeteria, now }: CafeteriaDetailPanelProps) {
  if (!cafeteria) {
    return (
      <section className="cafeteriaDetail isEmpty" aria-label="施設の詳細">
        <p className="cafeteriaEmpty">条件に合う施設がありません</p>
      </section>
    );
  }

  const cautions = cafeteria.notes?.filter((note) => note.isCaution) ?? [];

  return (
    <section className="cafeteriaDetail" aria-label={`${cafeteria.name}の詳細`}>
      <div className="cafeteriaDetailHeader">
        <img className="cafeteriaDetailPin" src={mapPinIcon} alt="" />
        <div className="cafeteriaDetailHeading">
          <h2>{cafeteria.name}</h2>
          <div className="cafeteriaDetailMeta">
            <div>
              <p className="cafeteriaDetailLocation">{cafeteria.location}</p>
              {cafeteria.phone && <p>{cafeteria.phone}</p>}
            </div>
            <div>
              {cafeteria.hours.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </div>
        <div className="cafeteriaDetailScore">
          <span className="cafeteriaDetailScoreLabel">おすすめ度</span>
          <span className="cafeteriaDetailScoreValue cafeteriaNumber">
            {cafeteria.rating.toFixed(1)}
          </span>
          <RatingStars rating={cafeteria.rating} />
          <span className="cafeteriaDetailScoreCount">
            （<span className="cafeteriaNumber">{cafeteria.reviewCount}</span>件）
          </span>
          {/* 口コミ投稿ページは未実装のため、現時点ではクリックしても遷移しない */}
          <button type="button" className="cafeteriaReviewPostBtn" aria-label="口コミを投稿する">
            <SquarePen aria-hidden="true" />
            <span className="comingSoonTip" aria-hidden="true">
              口コミを投稿する
            </span>
          </button>
        </div>
      </div>

      <div className="cafeteriaDetailTags">
        <CafeteriaCategoryBadge category={cafeteria.category} />
        <PaymentIcons payments={cafeteria.payments} showUnavailable />
        {cautions.map((note) => (
          <span className="cafeteriaCaution" key={note.text}>
            <Info aria-hidden="true" />
            {note.text}
          </span>
        ))}
      </div>

      <p className="cafeteriaChartStatus">現在：{currentCongestionText(cafeteria, now)}</p>
      <CongestionChart cafeteria={cafeteria} now={now} />

      <details className="cafeteriaAccordion" open>
        <summary>メニュー</summary>
        <MenuSection cafeteria={cafeteria} />
      </details>

      <details className="cafeteriaAccordion">
        <summary>ルート・行き方</summary>
        <p className="cafeteriaAccordionText">
          {cafeteria.location}にあります。最寄りの学内バス停から徒歩でのアクセスを想定しています（ルート案内は地図機能の公開後に掲載予定です）。
        </p>
      </details>

      <details className="cafeteriaAccordion">
        <summary>口コミ</summary>
        <ul className="cafeteriaReviews">
          {mockCafeteriaReviews.map((review) => (
            <li key={`${review.date}-${review.grade}`}>
              <div className="cafeteriaReviewMeta">
                <RatingStars rating={review.rating} />
                <span>
                  {review.grade} {review.department}
                </span>
                <time className="cafeteriaNumber">{review.date}</time>
              </div>
              <p>{review.comment}</p>
            </li>
          ))}
        </ul>
      </details>

      <details className="cafeteriaAccordion">
        <summary>その他情報</summary>
        <div className="cafeteriaAccordionText">
          {cafeteria.notes && cafeteria.notes.length > 0 ? (
            <ul className="cafeteriaNotes">
              {cafeteria.notes.map((note) => (
                <li key={note.text}>{note.text}</li>
              ))}
            </ul>
          ) : (
            <p>特記事項はありません。</p>
          )}
          <a
            className="cafeteriaSourceLink"
            href={cafeteria.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            出典：筑波大学 福利厚生施設情報
            <ExternalLink aria-hidden="true" />
          </a>
        </div>
      </details>
    </section>
  );
}

export default CafeteriaDetailPanel;
