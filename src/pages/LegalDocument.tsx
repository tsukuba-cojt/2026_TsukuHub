import { Link } from "react-router-dom";
import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import agreementSource from "../components/doc/agreement.html?raw";
import privacyPolicySource from "../components/doc/priverice.html?raw";
import { buildPrivacyPolicyDocument } from "../components/doc/privacyPolicyDocument";
import { useUniversity } from "../components/university/universityContextValue";
import "../styles/legal/LegalDocument.css";

const documents = {
  agreement: {
    title: "利用規約",
    source: agreementSource,
  },
  privacy: {
    title: "プライバシーポリシー",
    source: privacyPolicySource,
  },
} as const;

export default function LegalDocument({
  type,
}: {
  type: keyof typeof documents;
}) {
  const { path } = useUniversity();
  const document = documents[type];
  const html = document.source.trim()
    ? buildPrivacyPolicyDocument(document.source)
    : "";

  return (
    <div className="legalPage">
      <Globalnav />
      <main className="legalPageLayout">
        <p className="legalBreadcrumb">
          <Link to={path()} className="legalBreadcrumbLink">
            ホーム
          </Link>{" "}
          &gt; {document.title}
        </p>
        <div className="legalHeading">
          <p className="legalEyebrow">LEGAL</p>
          <h1 className="legalTitle">{document.title}</h1>
        </div>
        {html ? (
          <iframe
            className="legalFrame"
            srcDoc={html}
            title={`TsukuHub ${document.title}`}
            sandbox=""
          />
        ) : (
          <p className="legalEmpty">{document.title}は現在準備中です。</p>
        )}
      </main>
      <Footer />
    </div>
  );
}
