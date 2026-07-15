import "../../styles/home/CompanyScroll.css";
import logoWhiteLine from "../../assets/home/CompanyScroll/LogoWhiteLine.svg";

const items = ["TsukuHub", "TsukuHub", "TsukuHub", "TsukuHub"];

function CompanyScroll() {
  return (
    <div aria-hidden="true">
      <div className="companyScroll">
        <div className="companyScrollTrack">
          {[...items, ...items].map((text, i) => (
            <span key={i} className="companyScrollItem">
              <img
                src={logoWhiteLine}
                alt=""
                aria-hidden="true"
                className="companyScrollDivider"
              />
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CompanyScroll;
