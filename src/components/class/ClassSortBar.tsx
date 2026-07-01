import "../../styles/class/ClassSortBar.css";

function ClassSortBar() {
  return (
    <div className="classSortBar">
      <p>20件/1234件中</p>
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
