import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  ChevronDown,
  ImagePlus,
  Link as LinkIcon,
  Megaphone,
  Pencil,
  Plus,
  Smile,
  Tags,
  Trash2,
  UserRound,
} from "lucide-react";
import CircleSubPage from "../components/circle/CircleSubPage";
import CircleTagInput from "../components/circle/CircleTagInput";
import { addCircleTags } from "../components/circle/circleTagUtils";
import LeaveConfirmModal from "../components/timetableShare/LeaveConfirmModal";
import { useLeaveConfirm } from "../components/timetableShare/useLeaveConfirm";
import { useUniversity } from "../components/university/universityContextValue";
import { getCircleAcademicGroups } from "../data/circleAcademicOptions";
import {
  circleCategories,
  mockCircles,
  updateCircle,
  type Circle,
  type CircleCategory,
  type CircleNotice,
  type CircleTag,
  type CircleGradeMembers,
  type CircleFacultyRatio,
} from "../components/circle/mockCircles";
import "../styles/class/GraduationCheck.css";
import "../styles/class/TimetableShare.css";
import "../styles/class/ClassReviewForm.css";
import "../styles/circle/CircleEdit.css";

// 画像はデモデータ上 data URL で保持するため、大きすぎるファイルは弾く
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

type CircleEditForm = {
  image: string;
  category: CircleCategory;
  name: string;
  description: string;
  tags: CircleTag[];
  atmosphereTags: string[];
  atmosphereDescription: string;
  activityDays: string;
  activityTime: string;
  activityPlace: string;
  membersCount: string;
  gradeMembers: { grade: CircleGradeMembers["grade"]; program: "undergraduate" | "graduate"; count: string }[];
  facultyRatios: { name: string; percent: string; program: NonNullable<CircleFacultyRatio["program"]> }[];
  links: { label: string; url: string; text: string }[];
  notices: CircleNotice[];
};

type NoticeDraft = {
  // 編集中のお知らせの位置。null なら新規追加
  index: number | null;
  date: string; // input[type=date] の値（YYYY-MM-DD）
  title: string;
  body: string;
};

type FormErrors = Partial<Record<"name" | "description" | "membersCount" | "image" | "notice" | "distribution" | "links" | "tags" | "atmosphereTags", string>>;
type NoticeErrors = Partial<Record<"date" | "title", string>>;

// 所属人数は「約15名」の文字列なので、数値部分だけを編集し前後の文字は保存時に戻す
const splitMembers = (members: string) => {
  const match = members.match(/^(\D*)(\d+)(.*)$/);
  return match ? { prefix: match[1], count: match[2], suffix: match[3] } : { prefix: "約", count: "", suffix: "名" };
};

const toForm = (circle: Circle): CircleEditForm => ({
  image: circle.image ?? "",
  category: circle.category,
  name: circle.name,
  description: circle.description,
  tags: [...circle.tags],
  atmosphereTags: [...circle.detail.atmosphereTags],
  atmosphereDescription: circle.detail.atmosphereDescription,
  activityDays: circle.detail.activityDays,
  activityTime: circle.detail.activityTime,
  activityPlace: circle.detail.activityPlace,
  membersCount: splitMembers(circle.members).count,
  gradeMembers: (["undergraduate", "graduate"] as const).flatMap((program) =>
    Array.from({ length: program === "undergraduate" ? 6 : 4 }, (_, index) => {
      const grade = (index + 1) as CircleGradeMembers["grade"];
      const existing = circle.detail.gradeMembers.find((item) => item.grade === grade && (item.program ?? "undergraduate") === program);
      return { grade, program, count: existing ? String(existing.count) : "0" };
    }),
  ),
  facultyRatios: circle.detail.facultyRatios.map((item) => ({ ...item, percent: String(item.percent), program: item.program ?? "undergraduate" })),
  links: circle.detail.links.map((item) => ({ ...item })),
  notices: circle.detail.notices.map((notice) => ({ ...notice })),
});

// お知らせの日付はデータ上「YYYY/MM/DD」
const toInputDate = (date: string) => date.replaceAll("/", "-");
const toNoticeDate = (date: string) => date.replaceAll("-", "/");
const todayInputDate = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

const byNewest = (notices: CircleNotice[]) => [...notices].sort((a, b) => b.date.localeCompare(a.date));

function CircleEdit() {
  const { path, university } = useUniversity();
  const { circleId } = useParams<{ circleId: string }>();
  const navigate = useNavigate();
  const leave = useLeaveConfirm();
  const circle = mockCircles.find((item) => item.id === circleId);

  const [initialForm] = useState(() => (circle ? toForm(circle) : null));
  const [form, setForm] = useState(initialForm);
  const [tagDraft, setTagDraft] = useState("");
  const [atmosphereTagDraft, setAtmosphereTagDraft] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [noticeDraft, setNoticeDraft] = useState<NoticeDraft | null>(null);
  const [noticeErrors, setNoticeErrors] = useState<NoticeErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDirty = noticeDraft !== null || Boolean(tagDraft || atmosphereTagDraft) || JSON.stringify(form) !== JSON.stringify(initialForm);
  const detailPath = path(`/circles/${circleId}`);

  // 未保存の変更があるときは、ページ内リンク（パンくず・戻る・グローバルナビ）とリロード/タブを閉じる操作で確認する
  const requestLeave = leave.request;
  useEffect(() => {
    if (!isDirty) return;

    const handleLinkClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank") return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      event.preventDefault();
      event.stopPropagation();
      requestLeave(`${url.pathname}${url.search}${url.hash}`);
    };
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    document.addEventListener("click", handleLinkClick, true);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      document.removeEventListener("click", handleLinkClick, true);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty, requestLeave]);

  if (!circle || !form) {
    return (
      <CircleSubPage circle={undefined} circleId={circleId} label="編集">
        {null}
      </CircleSubPage>
    );
  }

  const update = (patch: Partial<CircleEditForm>) => setForm((prev) => (prev ? { ...prev, ...patch } : prev));
  const clearError = (key: keyof FormErrors) => setErrors((prev) => ({ ...prev, [key]: undefined }));

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "画像ファイルを選択してください" }));
      return;
    }
    if (file.size > IMAGE_MAX_BYTES) {
      setErrors((prev) => ({ ...prev, image: "画像は5MB以下のファイルを選択してください" }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      update({ image: String(reader.result) });
      clearError("image");
    };
    reader.readAsDataURL(file);
  };

  const openNoticeDraft = (index: number | null) => {
    const notice = index === null ? null : form.notices[index];
    setNoticeDraft({
      index,
      date: notice ? toInputDate(notice.date) : todayInputDate(),
      title: notice?.title ?? "",
      body: notice?.body ?? "",
    });
    setNoticeErrors({});
    clearError("notice");
  };

  const commitNoticeDraft = () => {
    if (!noticeDraft) return;
    const nextErrors: NoticeErrors = {};
    if (!noticeDraft.date) nextErrors.date = "日付を入力してください";
    if (!noticeDraft.title.trim()) nextErrors.title = "タイトルを入力してください";
    setNoticeErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const notice: CircleNotice = {
      date: toNoticeDate(noticeDraft.date),
      title: noticeDraft.title.trim(),
      body: noticeDraft.body.trim(),
    };
    const notices =
      noticeDraft.index === null
        ? [...form.notices, notice]
        : form.notices.map((item, index) => (index === noticeDraft.index ? notice : item));
    update({ notices: byNewest(notices) });
    setNoticeDraft(null);
  };

  const deleteNotice = (index: number) => {
    update({ notices: form.notices.filter((_, i) => i !== index) });
    if (noticeDraft?.index === index) setNoticeDraft(null);
  };

  const handleCancel = () => {
    if (isDirty) leave.request(detailPath);
    else navigate(detailPath);
  };

  const handleSave = () => {
    const nextErrors: FormErrors = {};
    const tagsResult = addCircleTags(form.tags, tagDraft);
    const atmosphereTagsResult = addCircleTags(form.atmosphereTags, atmosphereTagDraft);
    if (tagsResult.error) nextErrors.tags = tagsResult.error;
    if (atmosphereTagsResult.error) nextErrors.atmosphereTags = atmosphereTagsResult.error;
    if (!form.name.trim()) nextErrors.name = "サークル名を入力してください";
    if (!form.description.trim()) nextErrors.description = "紹介文を入力してください";
    if (!form.membersCount.trim()) nextErrors.membersCount = "所属人数を入力してください";
    else if (!/^\d+$/.test(form.membersCount) || !Number.isSafeInteger(Number(form.membersCount))) {
      nextErrors.membersCount = "所属人数は0以上の整数で入力してください";
    }
    if (form.gradeMembers.some((item) => item.count !== "" && (!/^\d+$/.test(item.count) || !Number.isSafeInteger(Number(item.count)))) ||
        form.facultyRatios.some((item) => (item.name.trim() || item.percent !== "") &&
          (!item.name.trim() || item.percent === "" || !Number.isFinite(Number(item.percent)) || Number(item.percent) < 0 || Number(item.percent) > 100)) ||
        form.facultyRatios.reduce((sum, item) => sum + Number(item.percent), 0) > 100) {
      nextErrors.distribution = "学年の人数は0以上の整数、学類・院のコースは名称と割合（0〜100%）を入力してください。割合の合計は100%以下にしてください。";
    }
    if (form.links.some((item) => {
      if (!item.label.trim() && !item.url.trim()) return false;
      try {
        return !item.label.trim() || !["https:", "http:"].includes(new URL(item.url.trim()).protocol);
      } catch { return true; }
    })) nextErrors.links = "リンク名と、http:// または https:// で始まる有効なURLを入力してください";
    if (noticeDraft) nextErrors.notice = "編集中のお知らせを「確定」するか「取り消す」を押してください";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const { prefix, suffix } = splitMembers(circle.members);
    updateCircle({
      ...circle,
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      tags: tagsResult.tags,
      image: form.image || undefined,
      members: form.membersCount === "" ? circle.members : `${prefix}${form.membersCount}${suffix}`,
      detail: {
        ...circle.detail,
        atmosphereTags: atmosphereTagsResult.tags,
        atmosphereDescription: form.atmosphereDescription.trim(),
        activityDays: form.activityDays.trim(),
        activityTime: form.activityTime.trim(),
        activityPlace: form.activityPlace.trim(),
        gradeMembers: form.gradeMembers.map((item) => ({ ...item, count: Number(item.count || "0") })),
        facultyRatios: form.facultyRatios.filter((item) => item.name.trim()).map((item) => ({ ...item, name: item.name.trim(), percent: Number(item.percent) })),
        links: form.links.filter((item) => item.label.trim() && item.url.trim()).map((item) => ({ label: item.label.trim(), url: item.url.trim(), text: item.url.trim() === circle.detail.links.find((link) => link.url === item.url.trim())?.url ? item.text : item.url.trim() })),
        notices: form.notices,
      },
    });
    navigate(detailPath, { state: { toast: "サークル情報を保存しました" } });
  };

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <CircleSubPage circle={circle} circleId={circleId} label="編集">
      <div className="ttShareWizard circleEditPanel">
        <h1 className="ttShareTitle">サークル情報を編集する</h1>

        <div className="circleEditSections">
          {/* ── 基本情報 ── */}
          <section className="ttShareCard">
            <h2 className="ttShareCardTitle">
              <Pencil aria-hidden="true" />
              基本情報
            </h2>

            <div className="ttShareField circleEditFirstField">
              <p className="ttShareFieldLabel">サークル画像</p>
              <div className="circleEditImageRow">
                <div className="circleEditImage">{form.image && <img src={form.image} alt="サークル画像のプレビュー" />}</div>
                <div className="circleEditImageActions">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="circleEditFileInput"
                    onChange={handleImageChange}
                  />
                  <button type="button" className="classDetailActionBtn" onClick={() => fileInputRef.current?.click()}>
                    <ImagePlus aria-hidden="true" />
                    {form.image ? "画像を変更" : "画像を選択"}
                  </button>
                  {form.image && (
                    <button type="button" className="classDetailActionBtn" onClick={() => update({ image: "" })}>
                      <Trash2 aria-hidden="true" />
                      削除
                    </button>
                  )}
                  <p className="circleEditHint">JPG・PNG など5MBまで</p>
                </div>
              </div>
              {errors.image && <p className="reviewFormError">{errors.image}</p>}
            </div>

            <div className="ttShareField">
              <label className="ttShareFieldLabel" htmlFor="circleEditCategory">
                カテゴリ
                <span className="reviewFormRequired">必須</span>
              </label>
              <div className="gradCheckSelectWrap">
                <select
                  id="circleEditCategory"
                  className="gradCheckSelect"
                  value={form.category}
                  onChange={(e) => update({ category: e.target.value as CircleCategory })}
                >
                  {circleCategories.map((category) => (
                    <option value={category} key={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown className="gradCheckSelectChevron" aria-hidden="true" />
              </div>
            </div>

            <div className="ttShareField">
              <label className="ttShareFieldLabel" htmlFor="circleEditName">
                サークル名
                <span className="reviewFormRequired">必須</span>
              </label>
              <input
                id="circleEditName"
                type="text"
                className={`circleEditInput${errors.name ? " isInvalid" : ""}`}
                maxLength={50}
                placeholder="例：アコースティックギターサークル"
                value={form.name}
                onChange={(e) => {
                  update({ name: e.target.value });
                  clearError("name");
                }}
              />
              {errors.name && <p className="reviewFormError">{errors.name}</p>}
            </div>

            <div className="ttShareField">
              <label className="ttShareFieldLabel" htmlFor="circleEditDescription">
                紹介文
                <span className="reviewFormRequired">必須</span>
              </label>
              <textarea
                id="circleEditDescription"
                className={`ttShareTextarea${errors.description ? " isInvalid" : ""}`}
                rows={4}
                maxLength={300}
                placeholder="サークルの活動内容や雰囲気を書いてください"
                value={form.description}
                onChange={(e) => {
                  update({ description: e.target.value });
                  clearError("description");
                }}
              />
              {errors.description && <p className="reviewFormError">{errors.description}</p>}
            </div>
          </section>

          {/* ── タグ ── */}
          <section className="ttShareCard">
            <h2 className="ttShareCardTitle">
              <Tags aria-hidden="true" />
              タグ
            </h2>
            <p className="circleEditHint circleEditLead">サークルの特徴を表すタグを自由に入力できます。例：初心者歓迎、兼サー可能</p>
            <CircleTagInput id="circleEditTags" label="サークルのタグ" tags={form.tags} draft={tagDraft}
              error={errors.tags} onChange={(tags) => update({ tags })} onDraftChange={setTagDraft}
              onError={(error) => setErrors((prev) => ({ ...prev, tags: error }))} />
          </section>

          <section className="ttShareCard">
            <h2 className="ttShareCardTitle"><Smile aria-hidden="true" />サークルの雰囲気</h2>
            <CircleTagInput id="circleEditAtmosphereTags" label="雰囲気のタグ" tags={form.atmosphereTags}
              draft={atmosphereTagDraft} error={errors.atmosphereTags}
              onChange={(atmosphereTags) => update({ atmosphereTags })} onDraftChange={setAtmosphereTagDraft}
              onError={(error) => setErrors((prev) => ({ ...prev, atmosphereTags: error }))} />
            <div className="ttShareField">
              <label className="ttShareFieldLabel" htmlFor="circleEditAtmosphereDescription">
                雰囲気の説明 <span className="circleEditOptional">任意</span>
              </label>
              <textarea id="circleEditAtmosphereDescription" className="ttShareTextarea" rows={4} maxLength={500}
                placeholder="例：学年を問わず仲が良く、初心者も気軽に参加できる雰囲気です。"
                value={form.atmosphereDescription} onChange={(e) => update({ atmosphereDescription: e.target.value })}
                aria-describedby="circleEditAtmosphereDescriptionHint" />
              <p id="circleEditAtmosphereDescriptionHint" className="circleEditHint">普段の様子やメンバー同士の関わり方などを紹介してください（500文字まで）。</p>
            </div>
          </section>

          {/* ── 活動情報 ── */}
          <section className="ttShareCard">
            <h2 className="ttShareCardTitle">
              <Activity aria-hidden="true" />
              活動情報
            </h2>
            <div className="circleEditGrid">
              <div className="ttShareField circleEditFirstField">
                <label className="ttShareFieldLabel" htmlFor="circleEditDays">
                  主な活動日
                </label>
                <input
                  id="circleEditDays"
                  type="text"
                  className="circleEditInput"
                  maxLength={50}
                  placeholder="例：毎週 火・金（週2回）"
                  value={form.activityDays}
                  onChange={(e) => update({ activityDays: e.target.value })}
                />
              </div>
              <div className="ttShareField circleEditFirstField">
                <label className="ttShareFieldLabel" htmlFor="circleEditTime">
                  活動時間 <span className="circleEditOptional">任意</span>
                </label>
                <input id="circleEditTime" type="text" className="circleEditInput" maxLength={100}
                  placeholder="例：18:00〜21:00" value={form.activityTime}
                  onChange={(e) => update({ activityTime: e.target.value })} aria-describedby="circleEditTimeHint" />
                <p id="circleEditTimeHint" className="circleEditHint">活動時間が決まっている場合のみ入力してください。未定の場合は空欄で提出できます。</p>
              </div>
              <div className="ttShareField circleEditFirstField">
                <label className="ttShareFieldLabel" htmlFor="circleEditPlace">
                  主な活動場所
                </label>
                <input
                  id="circleEditPlace"
                  type="text"
                  className="circleEditInput"
                  maxLength={50}
                  placeholder="例：文化系サークル棟"
                  value={form.activityPlace}
                  onChange={(e) => update({ activityPlace: e.target.value })}
                />
              </div>
            </div>
          </section>

          <section className="ttShareCard">
            <h2 className="ttShareCardTitle"><UserRound aria-hidden="true" />所属人数・分布</h2>
            <div className="ttShareField circleEditFirstField">
              <label className="ttShareFieldLabel" htmlFor="circleEditMembers">
                所属人数
                <span className="reviewFormRequired">必須</span>
              </label>
              <div className="circleEditMembers">
                <UserRound aria-hidden="true" />
                <span>{splitMembers(circle.members).prefix}</span>
                <input
                  id="circleEditMembers"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  required
                  aria-invalid={Boolean(errors.membersCount)}
                  className={`circleEditInput circleNumber${errors.membersCount ? " isInvalid" : ""}`}
                  value={form.membersCount}
                  onChange={(e) => {
                    update({ membersCount: e.target.value });
                    clearError("membersCount");
                  }}
                />
                <span>{splitMembers(circle.members).suffix}</span>
              </div>
              {errors.membersCount && <p className="reviewFormError">{errors.membersCount}</p>}
            </div>
            <fieldset className="circleEditDistribution">
              <legend>学年分布 <span className="circleEditOptional">任意</span></legend>
              <p className="circleEditHint">各学年の人数を入力してください。空欄は0人として保存されます。</p>
              <div className="circleEditGradeGrid">
                {form.gradeMembers.map((item, index) => (
                  <div key={`${item.program}-${item.grade}`}>
                    <label className="ttShareFieldLabel" htmlFor={`circleEditGrade${index}`}>{item.program === "graduate" ? "院" : "学類"}{item.grade}年</label>
                    <div className="circleEditNumberUnit">
                      <input id={`circleEditGrade${index}`} type="number" min={0} step={1} inputMode="numeric" className="circleEditInput"
                        value={item.count} onChange={(e) => { update({ gradeMembers: form.gradeMembers.map((row, i) => i === index ? { ...row, count: e.target.value } : row) }); clearError("distribution"); }}
                        onBlur={() => { if (item.count === "") update({ gradeMembers: form.gradeMembers.map((row, i) => i === index ? { ...row, count: "0" } : row) }); }} />
                      <span>名</span>
                    </div>
                  </div>
                ))}
              </div>
            </fieldset>
            <fieldset className="circleEditDistribution">
              <legend>所属学類・院のコース分布 <span className="circleEditOptional">任意</span></legend>
              <p className="circleEditHint">学類や院のコースごとの割合を入力してください。未入力の行は保存されません。</p>
              <div className="circleEditRows">
                {form.facultyRatios.map((item, index) => {
                  const groups = getCircleAcademicGroups(university?.slug ?? "tsukuba", item.program);
                  const isListed = groups.some((group) => group.options.includes(item.name));
                  return (
                  <div className="circleEditRatioRow" key={index}>
                    <label><span className="ttShareFieldLabel">区分</span>
                      <div className="gradCheckSelectWrap"><select className="gradCheckSelect" value={item.program} onChange={(e) => {
                        update({ facultyRatios: form.facultyRatios.map((row, i) => i === index ? { ...row, name: "", program: e.target.value as "undergraduate" | "graduate" } : row) });
                        clearError("distribution");
                      }}>
                        <option value="undergraduate">学類</option><option value="graduate">院のコース</option>
                      </select><ChevronDown className="gradCheckSelectChevron" aria-hidden="true" /></div>
                    </label>
                    <label><span className="ttShareFieldLabel">{item.program === "graduate" ? "学位プログラム・専攻名" : "学類・学群名"}</span>
                      <div className="gradCheckSelectWrap">
                        <select className="gradCheckSelect" value={item.name} onChange={(e) => {
                          update({ facultyRatios: form.facultyRatios.map((row, i) => i === index ? { ...row, name: e.target.value } : row) });
                          clearError("distribution");
                        }}>
                          <option value="">選択してください</option>
                          {item.name && !isListed && item.name !== "その他" && <option value={item.name}>{item.name}（登録済み）</option>}
                          {groups.map((group) => <optgroup key={group.label} label={group.label}>
                            {group.options.map((name) => <option key={name} value={name}>{name}</option>)}
                          </optgroup>)}
                          <option value="その他">その他</option>
                        </select>
                        <ChevronDown className="gradCheckSelectChevron" aria-hidden="true" />
                      </div>
                    </label>
                    <label><span className="ttShareFieldLabel">割合</span><div className="circleEditNumberUnit">
                      <input className="circleEditInput" type="number" min={0} max={100} step="any" value={item.percent} onChange={(e) => { update({ facultyRatios: form.facultyRatios.map((row, i) => i === index ? { ...row, percent: e.target.value } : row) }); clearError("distribution"); }} /><span>%</span>
                    </div></label>
                    <button type="button" className="classDetailActionBtn" aria-label={`${index + 1}行目の学類・コースを削除`} onClick={() => { update({ facultyRatios: form.facultyRatios.filter((_, i) => i !== index) }); clearError("distribution"); }}><Trash2 aria-hidden="true" />削除</button>
                  </div>
                  );
                })}
              </div>
              <button type="button" className="classDetailActionBtn" onClick={() => update({ facultyRatios: [...form.facultyRatios, { name: "", percent: "", program: "undergraduate" }] })}><Plus aria-hidden="true" />学類・コースを追加</button>
            </fieldset>
            {errors.distribution && <p className="reviewFormError" role="alert">{errors.distribution}</p>}
          </section>

          <section className="ttShareCard">
            <h2 className="ttShareCardTitle"><LinkIcon aria-hidden="true" />外部リンク・SNS <span className="circleEditOptional">任意</span></h2>
            <p className="circleEditHint circleEditLead">公式サイトやSNSのリンク名とURLを入力してください。</p>
            <div className="circleEditRows">
              {form.links.map((item, index) => (
                <div className="circleEditLinkRow" key={index}>
                  <label><span className="ttShareFieldLabel">リンク名</span><input className="circleEditInput" type="text" maxLength={100} placeholder="例：公式サイト、Instagram" value={item.label} onChange={(e) => { update({ links: form.links.map((row, i) => i === index ? { ...row, label: e.target.value } : row) }); clearError("links"); }} /></label>
                  <label><span className="ttShareFieldLabel">URL</span><input className="circleEditInput" type="url" placeholder="https://example.com/" value={item.url} onChange={(e) => { update({ links: form.links.map((row, i) => i === index ? { ...row, url: e.target.value } : row) }); clearError("links"); }} /></label>
                  <button type="button" className="classDetailActionBtn" aria-label={`${index + 1}行目のリンクを削除`} onClick={() => { update({ links: form.links.filter((_, i) => i !== index) }); clearError("links"); }}><Trash2 aria-hidden="true" />削除</button>
                </div>
              ))}
            </div>
            <button type="button" className="classDetailActionBtn" onClick={() => update({ links: [...form.links, { label: "", url: "", text: "" }] })}><Plus aria-hidden="true" />リンクを追加</button>
            {errors.links && <p className="reviewFormError" role="alert">{errors.links}</p>}
          </section>

          {/* ── お知らせ ── */}
          <section className="ttShareCard">
            <div className="circleEditCardHead">
              <h2 className="ttShareCardTitle">
                <Megaphone aria-hidden="true" />
                お知らせ
              </h2>
              <button
                type="button"
                className="classDetailActionBtn isPrimary"
                disabled={noticeDraft !== null}
                onClick={() => openNoticeDraft(null)}
              >
                <Plus aria-hidden="true" />
                お知らせを追加
              </button>
            </div>

            {noticeDraft && (
              <div className="circleEditNoticeForm">
                <p className="circleEditNoticeFormTitle">
                  {noticeDraft.index === null ? "お知らせを追加" : "お知らせを編集"}
                </p>
                <div className="circleEditNoticeFormGrid">
                  <div className="ttShareField circleEditFirstField">
                    <label className="ttShareFieldLabel" htmlFor="circleEditNoticeDate">
                      日付
                      <span className="reviewFormRequired">必須</span>
                    </label>
                    <input
                      id="circleEditNoticeDate"
                      type="date"
                      className={`circleEditInput circleNumber${noticeErrors.date ? " isInvalid" : ""}`}
                      value={noticeDraft.date}
                      onChange={(e) => setNoticeDraft({ ...noticeDraft, date: e.target.value })}
                    />
                    {noticeErrors.date && <p className="reviewFormError">{noticeErrors.date}</p>}
                  </div>
                  <div className="ttShareField circleEditFirstField">
                    <label className="ttShareFieldLabel" htmlFor="circleEditNoticeTitle">
                      タイトル
                      <span className="reviewFormRequired">必須</span>
                    </label>
                    <input
                      id="circleEditNoticeTitle"
                      type="text"
                      className={`circleEditInput${noticeErrors.title ? " isInvalid" : ""}`}
                      maxLength={50}
                      placeholder="例：新入生歓迎会のお知らせ"
                      value={noticeDraft.title}
                      onChange={(e) => setNoticeDraft({ ...noticeDraft, title: e.target.value })}
                    />
                    {noticeErrors.title && <p className="reviewFormError">{noticeErrors.title}</p>}
                  </div>
                </div>
                <div className="ttShareField">
                  <label className="ttShareFieldLabel" htmlFor="circleEditNoticeBody">
                    本文
                  </label>
                  <textarea
                    id="circleEditNoticeBody"
                    className="ttShareTextarea"
                    rows={3}
                    maxLength={500}
                    placeholder="お知らせの内容を書いてください"
                    value={noticeDraft.body}
                    onChange={(e) => setNoticeDraft({ ...noticeDraft, body: e.target.value })}
                  />
                </div>
                <div className="circleEditNoticeFormActions">
                  <button
                    type="button"
                    className="classDetailActionBtn"
                    onClick={() => {
                      setNoticeDraft(null);
                      clearError("notice");
                    }}
                  >
                    取り消す
                  </button>
                  <button type="button" className="classDetailActionBtn isPrimary" onClick={commitNoticeDraft}>
                    確定
                  </button>
                </div>
              </div>
            )}
            {errors.notice && <p className="reviewFormError">{errors.notice}</p>}

            {form.notices.length === 0 ? (
              <p className="circleEditHint circleEditEmpty">お知らせはまだありません</p>
            ) : (
              <ul className="circleDetailNotices circleEditNotices">
                {form.notices.map((notice, index) => (
                  <li key={`${notice.date}-${notice.title}-${index}`}>
                    <time className="circleNumber">{notice.date}</time>
                    <div>
                      <strong>{notice.title}</strong>
                      {notice.body && <p>{notice.body}</p>}
                    </div>
                    <div className="circleEditNoticeActions">
                      <button
                        type="button"
                        className="classDetailActionBtn"
                        disabled={noticeDraft !== null}
                        onClick={() => openNoticeDraft(index)}
                      >
                        <Pencil aria-hidden="true" />
                        編集
                      </button>
                      <button
                        type="button"
                        className="classDetailActionBtn"
                        aria-label={`「${notice.title}」を削除`}
                        onClick={() => deleteNotice(index)}
                      >
                        <Trash2 aria-hidden="true" />
                        削除
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {errorCount > 0 && (
          <p className="reviewFormError circleEditSummaryError">入力内容に不備があります。赤字の項目を確認してください。</p>
        )}
        <div className="ttShareActions">
          <button type="button" className="ttShareOutlineBtn" onClick={handleCancel}>
            キャンセル
          </button>
          <button type="button" className="ttSharePrimaryBtn" onClick={handleSave}>
            保存する
          </button>
        </div>
      </div>

      {leave.isOpen && (
        <LeaveConfirmModal
          onCancel={leave.cancel}
          onConfirm={leave.confirm}
          description="編集した内容は保存されません。"
        />
      )}
    </CircleSubPage>
  );
}

export default CircleEdit;
