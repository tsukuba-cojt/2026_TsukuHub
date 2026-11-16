import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  ChevronDown,
  ImagePlus,
  Megaphone,
  Pencil,
  Plus,
  Tags,
  Trash2,
  UserRound,
} from "lucide-react";
import CircleSubPage from "../components/circle/CircleSubPage";
import LeaveConfirmModal from "../components/timetableShare/LeaveConfirmModal";
import { useLeaveConfirm } from "../components/timetableShare/useLeaveConfirm";
import { useUniversity } from "../components/university/universityContextValue";
import {
  circleCategories,
  circleTags,
  mockCircles,
  updateCircle,
  type Circle,
  type CircleCategory,
  type CircleNotice,
  type CircleTag,
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
  activityDays: string;
  activityPlace: string;
  membersCount: string;
  notices: CircleNotice[];
};

type NoticeDraft = {
  // 編集中のお知らせの位置。null なら新規追加
  index: number | null;
  date: string; // input[type=date] の値（YYYY-MM-DD）
  title: string;
  body: string;
};

type FormErrors = Partial<Record<"name" | "description" | "membersCount" | "image" | "notice", string>>;
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
  activityDays: circle.detail.activityDays,
  activityPlace: circle.detail.activityPlace,
  membersCount: splitMembers(circle.members).count,
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
  const { path } = useUniversity();
  const { circleId } = useParams<{ circleId: string }>();
  const navigate = useNavigate();
  const leave = useLeaveConfirm();
  const circle = mockCircles.find((item) => item.id === circleId);

  const [initialForm] = useState(() => (circle ? toForm(circle) : null));
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [noticeDraft, setNoticeDraft] = useState<NoticeDraft | null>(null);
  const [noticeErrors, setNoticeErrors] = useState<NoticeErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDirty = noticeDraft !== null || JSON.stringify(form) !== JSON.stringify(initialForm);
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

  const toggleTag = (tag: CircleTag) => {
    const next = form.tags.includes(tag)
      ? form.tags.filter((item) => item !== tag)
      : circleTags.filter((item) => form.tags.includes(item) || item === tag);
    update({ tags: next });
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
    if (!form.name.trim()) nextErrors.name = "サークル名を入力してください";
    if (!form.description.trim()) nextErrors.description = "紹介文を入力してください";
    if (form.membersCount !== "" && !/^\d+$/.test(form.membersCount)) {
      nextErrors.membersCount = "所属人数は0以上の整数で入力してください";
    }
    if (noticeDraft) nextErrors.notice = "編集中のお知らせを「確定」するか「取り消す」を押してください";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const { prefix, suffix } = splitMembers(circle.members);
    updateCircle({
      ...circle,
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      tags: form.tags,
      image: form.image || undefined,
      members: form.membersCount === "" ? circle.members : `${prefix}${form.membersCount}${suffix}`,
      detail: {
        ...circle.detail,
        activityDays: form.activityDays.trim(),
        activityPlace: form.activityPlace.trim(),
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
            <p className="circleEditHint circleEditLead">表示したいタグを選択してください（複数選択可）</p>
            <div className="ttShareChips">
              {circleTags.map((tag) => {
                const selected = form.tags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    className={`ttShareChip${selected ? " isSelected" : ""}`}
                    aria-pressed={selected}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                );
              })}
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
            <div className="ttShareField">
              <label className="ttShareFieldLabel" htmlFor="circleEditMembers">
                所属人数
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
