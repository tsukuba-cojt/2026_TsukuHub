import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import "../../styles/utility/Footer.css";
import { externalServicesByUniversity } from "../../data/externalServices";
import { useUniversity } from "../university/universityContextValue";
import logoBlue from "../../assets/utility/header_footer/logo-blue.svg";
import sparkleIcon from "../../assets/utility/header_footer/icon-sparkle.svg";
import sparkleIconBlue from "../../assets/utility/header_footer/icon-sparkle-blue.svg";
import snsXIcon from "../../assets/utility/header_footer/icon-sns-x.svg";
import snsInstagramIcon from "../../assets/utility/header_footer/icon-sns-instagram.svg";
import snsLineIcon from "../../assets/utility/header_footer/icon-sns-line.svg";

function Footer() {
  const { university, path } = useUniversity();
  const externalServices = university?.slug === "tsukuba"
    ? externalServicesByUniversity.tsukuba
    : externalServicesByUniversity.osaka;
  return (
    <footer className="footer">
      <div className="footerInner">
        {/* Column 1: Logo */}
        <div className="footerLogo">
          <div className="footerLogoTop">
            <img
              src={logoBlue}
              alt="TsukuHub Logo"
              className="footerLogoImg"
            />
            <div className="footerLogoTextGroup">
              <span className="footerLogoText">
                TsukuHub
                {/* ロゴタイプ右上のスパークル: 青(大)+黄(小) */}
                <img
                  src={sparkleIconBlue}
                  alt=""
                  className="footerSparkleBlue"
                  aria-hidden="true"
                />
                <img
                  src={sparkleIcon}
                  alt=""
                  className="footerSparkleYellow"
                  aria-hidden="true"
                />
              </span>
              <p className="footerTagline">
                {university?.short_name ?? "大学"}生のためのキャンパスライフを、もっと便利に、もっと楽しく。
              </p>
            </div>
          </div>
        </div>

        {/* Column 2: 外部サービス */}
        <div className="footerCol">
          <h3>外部サービス</h3>
          <div className="footerExternalServices">
            {externalServices.length === 0 ? <small>大学公式サービスは準備中です</small> : externalServices.map((service) => (
              <a
                className="footerExternalLink"
                href={service.href}
                key={service.name}
                target="_blank"
                rel="noreferrer"
              >
                <span>{service.name}</span>
                <ExternalLink aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        {/* Column 3: サポート */}
        <div className="footerCol">
          <h3>サポート</h3>
          <ul className="footerLinks">
            <li><Link to={path("/faq")}>よくある質問</Link></li>
            <li><Link to={path("/contact")}>お問い合わせ</Link></li>
            <li><Link to={path("/terms")}>利用規約</Link></li>
            <li><Link to={path("/privacy")}>プライバシーポリシー</Link></li>
          </ul>
        </div>

        {/* Column 4: 公式SNS */}
        <div className="footerSns">
          <h3>公式SNS</h3>
          <div className="footerSnsIcons">
            {/* icon-sns-*.svg — replace when assets arrive */}
            <a href="#" aria-label="X（旧Twitter）">
              <img src={snsXIcon} alt="X" />
            </a>
            <a
              href="https://www.instagram.com/tsukuhub/"
              aria-label="Instagram"
              target="_blank"
              rel="noreferrer"
            >
              <img src={snsInstagramIcon} alt="Instagram" />
            </a>
            <a href="#" aria-label="LINE">
              <img src={snsLineIcon} alt="LINE" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
