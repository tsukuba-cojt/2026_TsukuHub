import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Check, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../auth/authContextValue";
import {
  AVATAR_COLORS,
  AVATAR_COLOR_KEYS,
  GENDER_KEYS,
  GENDER_LABELS,
  normalizeAvatarColor,
  normalizeGender,
  type AvatarColor,
  type Gender,
} from "../../lib/userProfile";
import UserAvatar from "./UserAvatar";
import Toast from "./Toast";
import "../../styles/utility/Mypage.css";
import "../../styles/utility/ComingSoon.css";
import "../../styles/class/GraduationCheck.css";
import "../../styles/class/TimetableShare.css";

type Profile = {
  id: string;
  name: string;
  grade: number;
  major: string;
  category: string;
  avatarColor: AvatarColor;
  gender: Gender;
};

const categoryLabel = (category: string): string => {
  switch (category) {
    case "undergraduate":
      return "学群生";
    case "graduate":
      return "大学院生";
    default:
      return category;
  }
};

const handleRadioKeyDown = <T extends string>(
  event: ReactKeyboardEvent<HTMLElement>,
  keys: readonly T[],
  current: T,
  onSelect: (next: T) => void,
) => {
  const index = keys.indexOf(current);
  let nextIndex: number | null = null;
  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    nextIndex = (index + 1) % keys.length;
  } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    nextIndex = (index - 1 + keys.length) % keys.length;
  } else if (event.key === "Home") {
    nextIndex = 0;
  } else if (event.key === "End") {
    nextIndex = keys.length - 1;
  }
  if (nextIndex === null) return;
  event.preventDefault();
  onSelect(keys[nextIndex]);
  const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]');
  buttons[nextIndex]?.focus();
};

type UserInfoModalProps = {
  onClose: () => void;
};

export default function UserInfoModal({ onClose }: UserInfoModalProps) {
  const { setAvatarColor } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draftColor, setDraftColor] = useState<AvatarColor>("gray");
  const [draftGender, setDraftGender] = useState<Gender>("unspecified");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const savingRef = useRef(false);
  const closeToast = useCallback(() => setToastMessage(null), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("ログイン情報を取得できませんでした。");
        setLoading(false);
        return;
      }

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError || !data) {
        setError("ユーザー情報の取得に失敗しました。");
        setLoading(false);
        return;
      }

      const nextProfile: Profile = {
        id: data.id,
        name: data.name,
        grade: data.grade,
        major: data.major,
        category: data.category,
        avatarColor: normalizeAvatarColor(data.avatar_color),
        gender: normalizeGender(data.gender),
      };
      setProfile(nextProfile);
      setDraftColor(nextProfile.avatarColor);
      setDraftGender(nextProfile.gender);
      setLoading(false);
    };

    void fetchProfile();
  }, []);

  const isDirty =
    profile !== null &&
    (draftColor !== profile.avatarColor || draftGender !== profile.gender);

  const handleSave = async () => {
    if (!profile || !isDirty || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError(null);

    const { data, error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_color: draftColor, gender: draftGender })
      .eq("id", profile.id)
      .select("id");

    savingRef.current = false;
    setSaving(false);

    if (updateError || !data || data.length === 0) {
      setSaveError("保存に失敗しました。時間をおいて再度お試しください。");
      return;
    }

    setProfile({ ...profile, avatarColor: draftColor, gender: draftGender });
    setAvatarColor(draftColor);
    setToastMessage("保存しました");
  };

  return (
    <>
    <div className="mypageModalOverlay" onClick={onClose}>
      <div
        className="mypageModalPanel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-info-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="mypageModalClose"
          aria-label="閉じる"
          onClick={onClose}
        >
          <X aria-hidden="true" />
        </button>

        <h2 className="mypage-title" id="user-info-title">
          ユーザー情報
        </h2>

        {loading && <p className="mypage-status">読み込み中...</p>}

        {error && <p className="mypage-status mypage-error">{error}</p>}

        {profile && !loading && !error && (
          <>
            <table className="mypage-table">
              <tbody>
                <tr>
                  <th id="user-info-avatar-label">アイコン</th>
                  <td>
                    <div className="mypageAvatarField">
                      <UserAvatar color={draftColor} size={56} />
                      <div
                        className="mypageAvatarSwatches"
                        role="radiogroup"
                        aria-labelledby="user-info-avatar-label"
                        onKeyDown={(event) =>
                          handleRadioKeyDown(event, AVATAR_COLOR_KEYS, draftColor, setDraftColor)
                        }
                      >
                        {AVATAR_COLOR_KEYS.map((key) => {
                          const selected = key === draftColor;
                          return (
                            <button
                              type="button"
                              key={key}
                              role="radio"
                              aria-checked={selected}
                              aria-label={AVATAR_COLORS[key].label}
                              tabIndex={selected ? 0 : -1}
                              className={`mypageAvatarSwatch${selected ? " isSelected" : ""}`}
                              onClick={() => setDraftColor(key)}
                            >
                              <UserAvatar color={key} size={32} />
                              {selected && (
                                <span className="mypageAvatarSwatchCheck" aria-hidden="true">
                                  <Check />
                                </span>
                              )}
                              <span className="comingSoonTip" aria-hidden="true">
                                {AVATAR_COLORS[key].label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>氏名</th>
                  <td>{profile.name}</td>
                </tr>
                <tr>
                  <th id="user-info-gender-label">性別</th>
                  <td>
                    <div
                      className="ttShareChips"
                      role="radiogroup"
                      aria-labelledby="user-info-gender-label"
                      aria-describedby="user-info-gender-note"
                      onKeyDown={(event) =>
                        handleRadioKeyDown(event, GENDER_KEYS, draftGender, setDraftGender)
                      }
                    >
                      {GENDER_KEYS.map((key) => {
                        const selected = key === draftGender;
                        return (
                          <button
                            type="button"
                            key={key}
                            role="radio"
                            aria-checked={selected}
                            tabIndex={selected ? 0 : -1}
                            className={`ttShareChip${selected ? " isSelected" : ""}`}
                            onClick={() => setDraftGender(key)}
                          >
                            {GENDER_LABELS[key]}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mypageFieldNote" id="user-info-gender-note">
                      性別は他のユーザーには公開されません
                    </p>
                  </td>
                </tr>
                <tr>
                  <th>所属</th>
                  <td>{categoryLabel(profile.category)}</td>
                </tr>
                <tr>
                  <th>学年</th>
                  <td>{profile.grade}年</td>
                </tr>
                <tr>
                  <th>学類</th>
                  <td>{profile.major}</td>
                </tr>
              </tbody>
            </table>

            {saveError && (
              <p className="mypage-status mypage-error" role="alert">
                {saveError}
              </p>
            )}

            <div className="gradCheckModalActions mypageModalActions">
              <button type="button" className="gradCheckCancelBtn" onClick={onClose}>
                キャンセル
              </button>
              <button
                type="button"
                className="gradCheckStartBtn"
                disabled={!isDirty || saving}
                onClick={() => void handleSave()}
              >
                {saving ? "保存中..." : "保存"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
    {toastMessage && <Toast message={toastMessage} onClose={closeToast} />}
    </>
  );
}
