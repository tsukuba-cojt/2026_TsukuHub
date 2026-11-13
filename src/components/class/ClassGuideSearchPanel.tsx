import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import {
  classGuideCategories,
  type ClassGuideCategory,
} from "../../data/classGuideCategories";
import { useUniversity } from "../university/universityContextValue";

type ClassGuideSearchPanelProps = {
  activeCategory: ClassGuideCategory;
  draftQuery: string;
  hasFilter: boolean;
  onDraftQueryChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
};

export default function ClassGuideSearchPanel({
  activeCategory,
  draftQuery,
  hasFilter,
  onDraftQueryChange,
  onSearch,
  onClear,
}: ClassGuideSearchPanelProps) {
  const { path } = useUniversity();

  return (
    <aside className="listingSearchPanel classGuideSearchPanel">
      <form
        className="listingKeywordSearch"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch();
        }}
      >
        <h2>フリーワードから探す</h2>
        <div className="listingKeywordRow">
          <input
            type="search"
            value={draftQuery}
            onChange={(event) => onDraftQueryChange(event.target.value)}
            placeholder="キーワードで検索"
            aria-label="履修ガイドのキーワード検索"
          />
          <button type="submit" className="careerPrimaryButton" aria-label="検索">
            <Search aria-hidden="true" />
            検索
          </button>
        </div>
      </form>

      <div className="listingCategorySearch">
        <div className="listingCategoryHead">
          <h2>カテゴリーから探す</h2>
          {hasFilter && (
            <button type="button" onClick={onClear}>
              条件をクリア
            </button>
          )}
        </div>
        <div className="listingCategoryGroup">
          <p>授業・プログラム</p>
          <ul>
            {Object.entries(classGuideCategories).map(([key, meta]) => (
              <li key={key}>
                {key === activeCategory ? (
                  <span className="classGuideCategoryCurrent" aria-current="page">
                    {meta.label}
                  </span>
                ) : (
                  <Link to={path(`/class/guides/${meta.slug}`)}>{meta.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
