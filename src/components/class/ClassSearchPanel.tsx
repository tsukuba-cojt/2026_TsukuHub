import "../../styles/class/ClassSearchPanel.css";
import bookMonoIcon from "../../assets/utility/Globalnav/BookMono.svg";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h10" />
      <path d="M18 7h2" />
      <path d="M4 17h2" />
      <path d="M10 17h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </svg>
  );
}

function ClassSearchPanel() {
  return (
    <section className="classSearchPanel" aria-labelledby="class-search-title">
      <div className="classSearchHeading">
        <img src={bookMonoIcon} alt="" />
        <div>
          <h1 id="class-search-title">講義検索</h1>
          <p>キーワード・条件から学びたい講義を検索</p>
        </div>
      </div>

      <form className="classSearchForm">
        <label className="classField classFieldText">
          <span>講義名・キーワードで検索</span>
          <div className="classInputShell">
            <input type="search" placeholder="例：データ構造" />
            <SearchIcon />
          </div>
        </label>

        <label className="classField classFieldCode">
          <span>講義番号で検索</span>
          <div className="classInputShell">
            <input type="search" placeholder="例：AB12345" />
            <SearchIcon />
          </div>
        </label>

        <label className="classField">
          <span>モジュール</span>
          <select defaultValue="all">
            <option value="all">すべて</option>
            <option value="spring-a">春A</option>
            <option value="spring-b">春B</option>
            <option value="fall-a">秋A</option>
          </select>
        </label>

        <label className="classField">
          <span>開設学期</span>
          <select defaultValue="all">
            <option value="all">すべて</option>
            <option value="spring">春学期</option>
            <option value="fall">秋学期</option>
          </select>
        </label>

        <label className="classField">
          <span>曜日時限</span>
          <select defaultValue="all">
            <option value="all">すべて</option>
            <option value="mon-2">月2</option>
            <option value="tue-3">火3</option>
            <option value="fri-5">金5</option>
          </select>
        </label>

        <button className="classClearButton" type="reset">
          <SlidersIcon />
          フィルターをクリア
        </button>
      </form>
    </section>
  );
}

export default ClassSearchPanel;
