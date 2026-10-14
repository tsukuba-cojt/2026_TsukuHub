import { ChevronDown, Search, SlidersHorizontal, Users, X } from "lucide-react";
import { circleCategories, circleTags } from "./mockCircles";
import "../../styles/class/ClassSearchPanel.css";
import "../../styles/circle/CircleSearchPanel.css";

const FREQUENCY_OPTIONS = ["週1回", "週2〜3回", "週4回以上", "不定期"];

function CircleSearchPanel() {
  return (
    <section className="classSearchPanel circleSearchPanel">
      <div className="classSearchHeading">
        <Users className="circleSearchHeadingIcon" aria-hidden="true" />
        <div>
          <h1>サークル検索</h1>
          <p>キーワード・条件から興味のあるサークルを検索</p>
        </div>
      </div>

      <form className="circleSearchForm" onSubmit={(e) => e.preventDefault()}>
        <label className="classField circleFieldText">
          <span>サークル名で検索</span>
          <div className="classInputShell">
            <input placeholder="例：バレー" />
            <Search aria-hidden="true" />
          </div>
        </label>

        <label className="circleSelect">
          <span>カテゴリ</span>
          <select defaultValue="all">
            <option value="all">すべて</option>
            {circleCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" />
        </label>

        <label className="circleSelect">
          <span>活動頻度</span>
          <select defaultValue="all">
            <option value="all">すべて</option>
            {FREQUENCY_OPTIONS.map((frequency) => (
              <option key={frequency} value={frequency}>
                {frequency}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" />
        </label>

        <button className="classClearButton circleClearButton" type="button">
          <SlidersHorizontal aria-hidden="true" />
          フィルターをクリア
        </button>
      </form>

      <div className="circleTagBar">
        <span className="circleTagBarLabel">おすすめのタグ</span>
        <div className="circleTagList">
          {circleTags.map((tag) => (
            <button type="button" className="circleTagChip" key={tag}>
              {tag}
            </button>
          ))}
        </div>
        <button type="button" className="circleTagClear">
          タグをクリア
          <X aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

export default CircleSearchPanel;
