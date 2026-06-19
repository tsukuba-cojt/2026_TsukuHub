import "../../styles/home/CompanyScroll.css";

const items = ["TsukuHub", "TsukuHub", "TsukuHub", "TsukuHub"];

function CompanyScroll() {
  return (
    <div aria-hidden="true">
      <div className="companyScroll">
        <div className="companyScrollTrack">
          {[...items, ...items].map((text, i) => (
            <span key={i} className="companyScrollItem">
              <span className="companyScrollDivider" />
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* Company logo placeholders — replace with real logos when assets arrive */}
      <div className="companyLogoStrip">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="companyLogoPlaceholder circle" />
        ))}
        {[...Array(3)].map((_, i) => (
          <div key={`p${i}`} className="companyLogoPlaceholder pill" />
        ))}
      </div>
    </div>
  );
}

export default CompanyScroll;
