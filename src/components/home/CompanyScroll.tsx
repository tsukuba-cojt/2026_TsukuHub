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
    </div>
  );
}

export default CompanyScroll;
