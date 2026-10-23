import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminInternshipPreview from "../../components/admin/AdminInternshipPreview";
import AdminLayout from "../../components/admin/AdminLayout";
import { useAuth } from "../../components/auth/authContextValue";
import {
  createInternship,
  getInternship,
  getInternshipTargetUniversityIds,
  removeCompanyLogo,
  updateInternship,
  uploadCompanyLogo,
  uploadInternshipCover,
} from "../../services/careerService";
import { listUniversities } from "../../services/universityService";
import type { University } from "../../types/university";
import type { InternshipInput, InternshipStatus } from "../../types/career";

const emptyForm: InternshipInput = {
  company_name: "", company_logo_url: null, cover_image_url: null, title: "", summary: "",
  company_description: "", company_mission: "", company_business: "", company_message_to_students: "",
  company_address: "", company_map_url: "",
  job_category: "エンジニア", location: "", work_style: "ハイブリッド", is_remote: false,
  work_conditions: "", compensation: "", description: "", requirements: "", preferred_skills: "",
  acquirable_skills: "", selection_process: "", tags: [], deadline: "", status: "draft", is_featured: false,
};

const toLocalDateTime = (value: string) => value ? new Date(value).toISOString().slice(0, 16) : "";
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

type ImageKind = "logo" | "cover";

export default function AdminInternshipForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState<ImageKind | null>(null);
  const [removing, setRemoving] = useState<ImageKind | null>(null);
  const [error, setError] = useState("");
  const [universities, setUniversities] = useState<University[]>([]);
  const [targetUniversityIds, setTargetUniversityIds] = useState<string[]>([]);

  useEffect(() => {
    void listUniversities().then((items) => {
      setUniversities(items);
      if (!id) setTargetUniversityIds(items.filter((item) => item.slug === "tsukuba").map((item) => item.id));
    }).catch(() => setError("大学一覧を取得できませんでした。"));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    void Promise.all([getInternship(id), getInternshipTargetUniversityIds(id)]).then(([item, targets]) => {
      if (!item) throw new Error();
      const { id: itemId, created_at: createdAt, updated_at: updatedAt, created_by: createdBy, ...input } = item;
      void itemId; void createdAt; void updatedAt; void createdBy;
      setForm({ ...input, deadline: toLocalDateTime(input.deadline) });
      setTags(input.tags.join(", "));
      setTargetUniversityIds(targets);
    }).catch(() => setError("求人を取得できませんでした。"))
      .finally(() => setLoading(false));
  }, [id]);

  const parsedTags = useMemo(
    () => tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    [tags],
  );

  const update = <K extends keyof InternshipInput>(key: K, value: InternshipInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const busy = uploading !== null || removing !== null;

  const uploadImage = async (kind: ImageKind, file: File) => {
    if (!user) return;
    if (!file.type.startsWith("image/") || file.size > MAX_IMAGE_BYTES) {
      setError("2MB以下の画像ファイルを選択してください。");
      return;
    }
    setUploading(kind);
    setError("");
    try {
      const url =
        kind === "logo"
          ? await uploadCompanyLogo(file, user.id)
          : await uploadInternshipCover(file, user.id);
      update(kind === "logo" ? "company_logo_url" : "cover_image_url", url);
    } catch {
      setError(kind === "logo" ? "ロゴをアップロードできませんでした。" : "カバー画像をアップロードできませんでした。");
    } finally {
      setUploading(null);
    }
  };

  const removeImage = async (kind: ImageKind) => {
    const currentUrl = kind === "logo" ? form.company_logo_url : form.cover_image_url;
    if (!currentUrl) return;
    setRemoving(kind);
    setError("");
    try {
      // ローカルのダミーパス（/data/dummy/...）は Storage に無いので URL だけ外す
      if (currentUrl.includes("/company-logos/")) {
        await removeCompanyLogo(currentUrl);
      }
      update(kind === "logo" ? "company_logo_url" : "cover_image_url", null);
    } catch {
      setError(kind === "logo" ? "ロゴを削除できませんでした。" : "カバー画像を削除できませんでした。");
    } finally {
      setRemoving(null);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError("");
    const required = [form.company_name, form.title, form.summary, form.company_mission, form.company_business,
      form.company_message_to_students, form.job_category,
      form.location, form.work_style, form.work_conditions, form.compensation, form.description,
      form.requirements, form.selection_process, form.deadline];
    if (required.some((value) => !value.trim()) || targetUniversityIds.length === 0) { setError("必須項目と掲載対象大学を入力してください。"); return; }
    if (form.company_map_url.trim()) {
      try {
        const url = new URL(form.company_map_url.trim());
        if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
      } catch {
        setError("GoogleマップのURLの形式を確認してください。");
        return;
      }
    }
    setSubmitting(true);
    try {
      const input = {
        ...form,
        deadline: new Date(form.deadline).toISOString(),
        tags: parsedTags,
        company_description: [form.company_mission, form.company_business, form.company_message_to_students]
          .map((value) => value.trim())
          .filter(Boolean)
          .join("\n\n"),
      };
      if (id) await updateInternship(id, input, targetUniversityIds); else await createInternship(input, targetUniversityIds);
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
        <div className="adminImageFields">
          <div className="adminImageField">
            <label>
              企業ロゴ
              <span className="adminImageHint">詳細ページの企業アイコンに表示されます</span>
              <input
                type="file"
                accept="image/*"
                disabled={busy}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadImage("logo", file);
                  event.target.value = "";
                }}
              />
            </label>
            {form.company_logo_url ? (
              <div className="logoPreview">
                <img src={form.company_logo_url} alt="アップロード済み企業ロゴ" />
                <button type="button" disabled={busy} onClick={() => void removeImage("logo")}>
                  {removing === "logo" ? "削除中..." : "削除"}
                </button>
              </div>
            ) : null}
            {uploading === "logo" ? <p className="adminImageStatus">ロゴをアップロードしています...</p> : null}
          </div>
          <div className="adminImageField">
            <label>
              カバー画像
              <span className="adminImageHint">一覧カード・おすすめ枠・詳細ページ上部に表示されます</span>
              <input
                type="file"
                accept="image/*"
                disabled={busy}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadImage("cover", file);
                  event.target.value = "";
                }}
              />
            </label>
            {form.cover_image_url ? (
              <div className="logoPreview coverPreview">
                <img src={form.cover_image_url} alt="アップロード済みカバー画像" />
                <button type="button" disabled={busy} onClick={() => void removeImage("cover")}>
                  {removing === "cover" ? "削除中..." : "削除"}
                </button>
              </div>
            ) : null}
            {uploading === "cover" ? <p className="adminImageStatus">カバー画像をアップロードしています...</p> : null}
          </div>
        </div>
        <label>求人タイトル <span>*</span><input value={form.title} maxLength={160} onChange={(event) => update("title", event.target.value)} /></label>
        <label>一言説明 <span>*</span><textarea rows={3} value={form.summary} maxLength={300} onChange={(event) => update("summary", event.target.value)} /></label>
        <label>ミッション <span>*</span><textarea rows={3} value={form.company_mission} maxLength={1000} onChange={(event) => update("company_mission", event.target.value)} /></label>
        <label>事業内容 <span>*</span><textarea rows={4} value={form.company_business} maxLength={2000} onChange={(event) => update("company_business", event.target.value)} /></label>
        <label>学生に一言 <span>*</span><textarea rows={3} value={form.company_message_to_students} maxLength={1000} onChange={(event) => update("company_message_to_students", event.target.value)} /></label>
        <label>住所<input value={form.company_address} maxLength={200} onChange={(event) => update("company_address", event.target.value)} /></label>
        <label>
          GoogleマップのURL
          <input
            type="url"
            value={form.company_map_url}
            maxLength={500}
            placeholder="空欄なら住所から自動で開きます"
            onChange={(event) => update("company_map_url", event.target.value)}
          />
        </label>
      </div>
      <div className="formSection"><h2>勤務条件</h2><div className="formGrid">
        <label>勤務地 <span>*</span><input value={form.location} onChange={(event) => update("location", event.target.value)} /></label>
        <label>勤務形態 <span>*</span><input value={form.work_style} onChange={(event) => update("work_style", event.target.value)} /></label>
        <label>稼働条件 <span>*</span><input value={form.work_conditions} onChange={(event) => update("work_conditions", event.target.value)} /></label>
        <label>時給 <span>*</span><input value={form.compensation} placeholder="例: 時給1,300円〜" onChange={(event) => update("compensation", event.target.value)} /></label>
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
        <fieldset className="adminUniversityTargets"><legend>掲載対象大学 <span>*</span></legend>{universities.map((university) => <label className="checkboxLabel" key={university.id}><input type="checkbox" checked={targetUniversityIds.includes(university.id)} onChange={(event) => setTargetUniversityIds((current) => event.target.checked ? [...current, university.id] : current.filter((id) => id !== university.id))} />{university.name}</label>)}</fieldset>
        <label>特徴タグ（カンマ区切り）<input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="未経験歓迎, 週2日から" /></label>
        <label>募集締切 <span>*</span><input type="datetime-local" value={form.deadline} onChange={(event) => update("deadline", event.target.value)} /></label>
        <label>公開状態<select value={form.status} onChange={(event) => update("status", event.target.value as InternshipStatus)}><option value="draft">下書き</option><option value="published">公開中</option><option value="closed">募集終了</option></select></label>
        <label className="checkboxLabel"><input type="checkbox" checked={form.is_featured} onChange={(event) => update("is_featured", event.target.checked)} />おすすめ求人として表示</label>
      </div></div>
      <AdminInternshipPreview form={form} tags={parsedTags} />
      {error && <p className="formError" role="alert">{error}</p>}
      <div className="formActions"><Link to="/admin/internships">キャンセル</Link><button className="careerPrimaryButton" disabled={submitting || busy}>{submitting ? "保存しています..." : isEdit ? "変更を保存" : "求人を登録"}</button></div>
    </form>
  </AdminLayout>;
}
