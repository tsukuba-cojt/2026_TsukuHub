import "../../styles/class/ClassSortBar.css";

type ClassSortBarProps = {
  currentPage: number;
  totalCount: number;
};

function ClassSortBar({ currentPage, totalCount }: ClassSortBarProps) {
  const displayedCount = Math.min(currentPage * 20, totalCount);

  return (
    <div className="classSortBar">
      <p>{displayedCount}件/{totalCount}件中</p>
      <label>
        <span>並び替え</span>
        <select defaultValue="rating">
          <option value="rating">評価が高い順</option>
          <option value="reviews">口コミが多い順</option>
          <option value="new">新着順</option>
        </select>
      </label>
    </div>
  );
}

export default ClassSortBar;
