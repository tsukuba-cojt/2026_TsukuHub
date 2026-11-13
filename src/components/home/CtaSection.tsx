import { type User } from "@supabase/supabase-js";
import { Link } from "react-router-dom";
import "../../styles/home/CtaSection.css";
import { useUniversity } from "../university/universityContextValue";

type Props = {
  user: User | null;
};

function CtaSection({ user }: Props) {
  const { university, path } = useUniversity();
  if (user) return null;

  return (
    <div className="ctaWrap">
      <section className="ctaSection">
        {/* Left placeholder — replace with illustration when asset arrives */}
        <div className="ctaIllustLeft" aria-hidden="true" />

        <div className="ctaContent">
          <h2 className="ctaTitle">
            <span className="ctaTitleBrand">TsukuHub</span>
            <span className="ctaTitleSub">をもっと活用しよう！</span>
          </h2>
          <p className="ctaBody">
            気になる情報を保存したり、自分にあった情報を見つけて、
            <br />
            充実した{university?.short_name}ライフを送ろう！
          </p>
          <div className="ctaButtons">
            <Link to={path("/signup")} className="registerButton">
              新規登録（無料）
            </Link>
            <Link to={path("/login")} className="loginButton">
              <span>ログイン</span>
            </Link>
          </div>
        </div>

        {/* Right placeholder */}
        <div className="ctaIllustRight" aria-hidden="true" />
      </section>
    </div>
  );
}

export default CtaSection;
