import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import "../styles/class/GraduationCheck.css";

// アップロードページから遷移時に受け取るデータ（永続化しない）
type GraduationCheckResultState = {
  fileName: string;
  major: string;
  admissionYear: string;
  agreedStats: boolean;
} | null;

// 卒業要件チェック 結果ページ（/graduation-checker/result）
// 中身はプレースホルダー。判定結果の表示は後日実装する。
//
// 結果データは意図的に揮発扱いにしている：
// 遷移時の history state をマウント時にメモリへ退避して即座に消去するため、
// リロードやブラウザバックで再訪しても結果は残らない（永続化しない仕様）。
function GraduationCheckResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const [result] = useState<GraduationCheckResultState>(
    () => location.state as GraduationCheckResultState
  );

  useEffect(() => {
    if (location.state !== null) {
      navigate("/graduation-checker/result", { replace: true, state: null });
    }
  }, [location.state, navigate]);

  return (
    <div className="gradCheckPage">
      <Globalnav />
      <main className="gradCheckPageLayout">
        <p className="gradCheckBreadcrumb">
          <Link to="/" className="gradCheckBreadcrumbLink">
            ホーム
          </Link>{" "}
          &gt;{" "}
          <Link to="/class/top" className="gradCheckBreadcrumbLink">
            授業・履修
          </Link>{" "}
          &gt;{" "}
          <Link to="/graduation-checker" className="gradCheckBreadcrumbLink">
            卒業要件チェック
          </Link>{" "}
          &gt; チェック結果
        </p>

        <div className="gradCheckResultCard">
          {result ? (
            <>
              <h1 className="gradCheckResultTitle">チェック結果</h1>
              {/* TODO: 要件判定の結果表示を実装する（現状はプレースホルダー） */}
              <p className="gradCheckResultBody">
                結果表示は準備中です（{result.fileName} を受け付けました）。
                <br />
                このページの内容は保存されません。ページを離れると結果は破棄されます。
              </p>
            </>
          ) : (
            <>
              <h1 className="gradCheckResultTitle">チェック結果がありません</h1>
              <p className="gradCheckResultBody">
                結果は保存されないため、ページの再読み込みや戻る操作では表示できません。
                <br />
                もう一度CSVをアップロードしてチェックを実行してください。
              </p>
            </>
          )}
          <Link to="/graduation-checker" className="gradCheckResultBackLink">
            アップロードページへ戻る
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default GraduationCheckResult;
