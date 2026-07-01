import { Link } from "react-router-dom";
import "../../styles/utility/Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footerInner">
        {/* Column 1: Logo */}
        <div className="footerLogo">
          <div className="footerLogoTop">
            <img
              src="/src/assets/utility/header_footer/Property 1=Blue.svg"
              alt="TsukuHub Logo"
              className="footerLogoImg"
            />
            <div className="footerLogoTextGroup">
              <span className="footerLogoText">
                TsukuHub
                {/* icon-sparkle.svg — replace when asset arrives */}
                <img
                  src="/src/assets/utility/header_footer/icon-sparkle.svg"
                  alt=""
                  className="footerSparkleYellow"
                  aria-hidden="true"
                />
              </span>
              {/* icon-sparkle.svg (blue) */}
              <img
                src="/src/assets/utility/header_footer/icon-sparkle.svg"
                alt=""
                className="footerSparkleBlue"
                aria-hidden="true"
              />
            </div>
          </div>
          <p className="footerTagline">
            筑波大生のためのキャンパスライフを、もっと便利に、もっと楽しく。
          </p>
        </div>

        {/* Column 2: サービス */}
        <div className="footerCol">
          <h3>サービス</h3>
          <ul className="footerLinks">
            <li><Link to="/career">就活・キャリア</Link></li>
            <li><Link to="/circles">サークル・課外活動</Link></li>
            <li><Link to="/news">イベント・お知らせ</Link></li>
            <li><Link to="/class">授業・履修</Link></li>
            <li><Link to="/lifestyle">生活・便利情報</Link></li>
            <li><Link to="/global">留学・国際情報</Link></li>
          </ul>
        </div>

        {/* Column 3: サポート */}
        <div className="footerCol">
          <h3>サポート</h3>
          <ul className="footerLinks">
            <li><Link to="/faq">よくある質問</Link></li>
            <li><Link to="/contact">お問合せ</Link></li>
            <li><Link to="/terms">利用規約</Link></li>
            <li><Link to="/privacy">プライバシーポリシー</Link></li>
          </ul>
        </div>

        {/* Column 4: 公式SNS */}
        <div className="footerSns">
          <h3>公式SNS</h3>
          <div className="footerSnsIcons">
            {/* icon-sns-*.svg — replace when assets arrive */}
            <a href="#" aria-label="X（旧Twitter）">
              <img src="/src/assets/utility/header_footer/icon-sns-x.svg" alt="X" />
            </a>
            <a href="#" aria-label="Instagram">
              <img src="/src/assets/utility/header_footer/icon-sns-instagram.svg" alt="Instagram" />
            </a>
            <a href="#" aria-label="LINE">
              <img src="/src/assets/utility/header_footer/icon-sns-line.svg" alt="LINE" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
