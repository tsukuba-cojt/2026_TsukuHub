import { type User } from "@supabase/supabase-js";
import { Link } from "react-router-dom";
import "../../styles/home/CtaSection.css";

type Props = {
  user: User | null;
};

function CtaSection({ user }: Props) {
  if(user) return ;  
  return (
    <section className="ctaSection">
      <div className="ctaImage">
        <img
          src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=600"
          alt=""
        />
      </div>

      <div className="ctaContent">
        <h2>
          <span>TsukuHub</span>をもっと活用しよう！
        </h2>
        <p>
          気になる情報を保存したり、自分に合った情報を見つけて、
          充実した筑波大ライフを送ろう！
        </p>

        <div className="ctaButtons">
          <Link to="/signup" className="registerButton large">新規登録（無料）</Link>
          <Link to="/login" className="loginButton large">ログイン</Link>
        </div>
      </div>

      <div className="ctaIllust">👨‍🎓📱</div>
    </section>
  );
}

export default CtaSection;