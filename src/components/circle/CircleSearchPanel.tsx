import { useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { circleCategories, circleTags, type CircleTag } from "./mockCircles";
import peopleIcon from "../../assets/home/CategoryCard/People.svg";
import "../../styles/class/ClassSearchPanel.css";
import "../../styles/circle/CircleSearchPanel.css";

const FREQUENCY_OPTIONS = ["週1回", "週2〜3回", "週4回以上", "不定期"];

function CircleSearchPanel() {
  const [selectedTags, setSelectedTags] = useState<CircleTag[]>([]);

  const toggleTag = (tag: CircleTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : circleTags.filter((t) => prev.includes(t) || t === tag)
    );
  };

  return (
    <section className="classSearchPanel circleSearchPanel">
      <div className="classSearchHeading">
        <img src={peopleIcon} alt="" className="classSearchHeadingIcon" />
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
          {circleTags.map((tag) => {
            const selected = selectedTags.includes(tag);
            return (
              <button
                type="button"
                className={`circleTagChip${selected ? " isSelected" : ""}`}
                key={tag}
                aria-pressed={selected}
                onClick={() => toggleTag(tag)}
              >
                {tag}
                {selected && <X aria-hidden="true" />}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="circleTagClear"
          disabled={selectedTags.length === 0}
          onClick={() => setSelectedTags([])}
        >
          タグをクリア
          <X aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

export default CircleSearchPanel;
