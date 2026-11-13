import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { normalizeHttpUrl } from "../../components/career/applicationFormState";
import {
  getAdminApplication,
  updateAdminApplication,
} from "../../services/careerService";
import {
  applicationStatusLabels,
  type AdminApplication,
  type ApplicationStatus,
} from "../../types/career";

export default function AdminApplicationDetail() {
  const { id = "" } = useParams();
  const [item, setItem] = useState<AdminApplication | null>(null);
  const [status, setStatus] = useState<ApplicationStatus>("submitted");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void getAdminApplication(id)
      .then((data) => {
        setItem(data);
        if (data) {
          setStatus(data.status);
          setNotes(data.admin_notes ?? "");
        }
      })
      .catch(() => setError("応募情報を取得できませんでした。"))
      .finally(() => setLoading(false));
  }, [id]);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await updateAdminApplication(id, status, notes);
      setItem((current) =>
        current ? { ...current, status, admin_notes: notes } : current
      );
      setMessage("ステータスと管理者メモを更新しました。");
    } catch {
      setError("更新できませんでした。");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="応募詳細">
        <div className="careerState">読み込んでいます...</div>
      </AdminLayout>
    );
  }

  if (!item) {
    return (
      <AdminLayout title="応募詳細">
        <div className="careerState isError">
          {error || "応募が見つかりません。"}
        </div>
      </AdminLayout>
    );
  }

  const portfolioUrl = item.portfolio_url
    ? normalizeHttpUrl(item.portfolio_url)
    : "";
  const detailRows = [
    ["氏名", item.applicant_name],
    ["メールアドレス", item.email],
    ["所属", item.faculty],
    ["卒業予定年", String(item.graduation_year)],
    [
      "応募日時",
      new Intl.DateTimeFormat("ja-JP", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date(item.created_at)),
    ],
  ];

  return (
    <AdminLayout title="応募詳細">
      <Link className="careerBack" to="/admin/applications">
        応募一覧へ戻る
      </Link>
      {message && (
        <p className="formSuccess" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="formError" role="alert">
          {error}
        </p>
      )}
      <div className="adminApplicationLayout">
        <div>
          <section className="adminPanel">
            <h2>応募者情報</h2>
            <dl className="adminDetailList">
              {detailRows.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="adminPanel">
            <h2>応募内容</h2>
            <div className="applicationAnswers">
              <h3>志望理由</h3>
              <p>{item.motivation}</p>
              <h3>経験・スキル</h3>
              <p>{item.skills}</p>
              <h3>ポートフォリオURL</h3>
              <p>
                {portfolioUrl ? (
                  <a href={portfolioUrl} target="_blank" rel="noreferrer">
                    {portfolioUrl}
                  </a>
                ) : (
                  "未入力"
                )}
              </p>
              <h3>補足事項</h3>
              <p>{item.additional_notes || "未入力"}</p>
            </div>
          </section>
        </div>
        <aside className="adminPanel adminReviewPanel">
          <h2>選考管理</h2>
          <p className="jobReference">
            <span>応募先</span>
            <strong>{item.internship?.title}</strong>
            <small>{item.internship?.company_name}</small>
          </p>
          <label>
            ステータス
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as ApplicationStatus)
              }
            >
              {Object.entries(applicationStatusLabels).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            管理者用メモ
            <textarea
              rows={9}
              maxLength={5000}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>
          <small>このメモは学生には表示されません。</small>
          <button
            className="careerPrimaryButton"
            disabled={saving}
            onClick={() => void save()}
          >
            {saving ? "更新しています..." : "更新する"}
          </button>
        </aside>
      </div>
    </AdminLayout>
  );
}
