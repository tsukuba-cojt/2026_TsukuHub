import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { useAuth } from "../../components/auth/authContextValue";
import {
  createInternship,
  getInternship,
  removeCompanyLogo,
  updateInternship,
  uploadCompanyLogo,
} from "../../services/careerService";
import type { InternshipInput, InternshipStatus } from "../../types/career";

const emptyForm: InternshipInput = {
  company_name: "", company_logo_url: null, title: "", summary: "", company_description: "",
  job_category: "エンジニア", location: "", work_style: "ハイブリッド", is_remote: false,
  work_conditions: "", compensation: "", description: "", requirements: "", preferred_skills: "",
  acquirable_skills: "", selection_process: "", tags: [], deadline: "", status: "draft", is_featured: false,
};

const toLocalDateTime = (value: string) => value ? new Date(value).toISOString().slice(0, 16) : "";

export default function AdminInternshipForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removingLogo, setRemovingLogo] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    void getInternship(id).then((item) => {
      if (!item) throw new Error();
      const { id: itemId, created_at: createdAt, updated_at: updatedAt, created_by: createdBy, ...input } = item;
      void itemId; void createdAt; void updatedAt; void createdBy;
      setForm({ ...input, deadline: toLocalDateTime(input.deadline) });
      setTags(input.tags.join(", "));
    }).catch(() => setError("求人を取得できませんでした。"))
      .finally(() => setLoading(false));
  }, [id]);

  const update = <K extends keyof InternshipInput>(key: K, value: InternshipInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const upload = async (file: File) => {
    if (!user) return;
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
      setError("2MB以下の画像ファイルを選択してください。");
      return;
    }
    setUploading(true); setError("");
    try { update("company_logo_url", await uploadCompanyLogo(file, user.id)); }
    catch { setError("ロゴをアップロードできませんでした。"); }
    finally { setUploading(false); }
  };

  const removeLogo = async () => {
    if (!form.company_logo_url) return;
    setRemovingLogo(true); setError("");
    try { await removeCompanyLogo(form.company_logo_url); update("company_logo_url", null); }
    catch { setError("ロゴを削除できませんでした。"); }
    finally { setRemovingLogo(false); }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError("");
    const required = [form.company_name, form.title, form.summary, form.company_description, form.job_category,
      form.location, form.work_style, form.work_conditions, form.compensation, form.description,
      form.requirements, form.selection_process, form.deadline];
    if (required.some((value) => !value.trim())) { setError("必須項目を入力してください。"); return; }
    setSubmitting(true);
    try {
      const input = { ...form, deadline: new Date(form.deadline).toISOString(), tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean) };
      if (id) await updateInternship(id, input); else await createInternship(input);
      navigate("/admin/internships", { state: { message: id ? "求人を更新しました。" : "求人を登録しました。" } });
    } catch { setError("求人を保存できませんでした。入力内容を確認してください。"); }
    finally { setSubmitting(false); }
  };

  if (loading) return <AdminLayout title={isEdit ? "求人を編集" : "求人を登録"}><div className="careerState">読み込んでいます...</div></AdminLayout>;

  return <AdminLayout title={isEdit ? "求人を編集" : "求人を登録"}>
    <form className="careerForm adminJobForm" onSubmit={submit}>
      <div className="formSection"><h2>企業・求人の基本情報</h2>
        <div className="formGrid">
          <label>企業名 <span>*</span><input value={form.company_name} maxLength={120} onChange={(event) => update("company_name", event.target.value)} /></label>
          <label>職種 <span>*</span><select value={form.job_category} onChange={(event) => update("job_category", event.target.value)}><option>エンジニア</option><option>営業・ビジネス</option><option>マーケティング</option><option>企画</option><option>デザイン</option></select></label>
        </div>
        <label>企業ロゴ<input type="file" accept="image/*" disabled={uploading || removingLogo} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} /></label>
        {form.company_logo_url && <div className="logoPreview"><img src={form.company_logo_url} alt="アップロード済み企業ロゴ" /><button type="button" disabled={removingLogo} onClick={() => void removeLogo()}>{removingLogo ? "削除中..." : "削除"}</button></div>}
        <label>求人タイトル <span>*</span><input value={form.title} maxLength={160} onChange={(event) => update("title", event.target.value)} /></label>
        <label>一言説明 <span>*</span><textarea rows={3} value={form.summary} maxLength={300} onChange={(event) => update("summary", event.target.value)} /></label>
        <label>企業紹介 <span>*</span><textarea rows={5} value={form.company_description} maxLength={3000} onChange={(event) => update("company_description", event.target.value)} /></label>
      </div>
      <div className="formSection"><h2>勤務条件</h2><div className="formGrid">
        <label>勤務地 <span>*</span><input value={form.location} onChange={(event) => update("location", event.target.value)} /></label>
        <label>勤務形態 <span>*</span><input value={form.work_style} onChange={(event) => update("work_style", event.target.value)} /></label>
        <label>稼働条件 <span>*</span><input value={form.work_conditions} onChange={(event) => update("work_conditions", event.target.value)} /></label>
        <label>報酬 <span>*</span><input value={form.compensation} onChange={(event) => update("compensation", event.target.value)} /></label>
        <label className="checkboxLabel"><input type="checkbox" checked={form.is_remote} onChange={(event) => update("is_remote", event.target.checked)} />リモート勤務可</label>
      </div></div>
      <div className="formSection"><h2>仕事内容・応募条件</h2>
        <label>仕事内容 <span>*</span><textarea rows={7} value={form.description} maxLength={5000} onChange={(event) => update("description", event.target.value)} /></label>
        <label>応募条件 <span>*</span><textarea rows={5} value={form.requirements} maxLength={3000} onChange={(event) => update("requirements", event.target.value)} /></label>
        <label>歓迎スキル<textarea rows={4} value={form.preferred_skills} maxLength={3000} onChange={(event) => update("preferred_skills", event.target.value)} /></label>
        <label>身につくスキル<textarea rows={4} value={form.acquirable_skills} maxLength={3000} onChange={(event) => update("acquirable_skills", event.target.value)} /></label>
        <label>選考フロー <span>*</span><textarea rows={3} value={form.selection_process} onChange={(event) => update("selection_process", event.target.value)} /></label>
      </div>
      <div className="formSection"><h2>公開設定</h2><div className="formGrid">
        <label>特徴タグ（カンマ区切り）<input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="未経験歓迎, 週2日から" /></label>
        <label>募集締切 <span>*</span><input type="datetime-local" value={form.deadline} onChange={(event) => update("deadline", event.target.value)} /></label>
        <label>公開状態<select value={form.status} onChange={(event) => update("status", event.target.value as InternshipStatus)}><option value="draft">下書き</option><option value="published">公開中</option><option value="closed">募集終了</option></select></label>
        <label className="checkboxLabel"><input type="checkbox" checked={form.is_featured} onChange={(event) => update("is_featured", event.target.checked)} />おすすめ求人として表示</label>
      </div></div>
      {error && <p className="formError" role="alert">{error}</p>}
      <div className="formActions"><Link to="/admin/internships">キャンセル</Link><button className="careerPrimaryButton" disabled={submitting || uploading || removingLogo}>{submitting ? "保存しています..." : isEdit ? "変更を保存" : "求人を登録"}</button></div>
    </form>
  </AdminLayout>;
}
