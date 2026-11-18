import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import "../../styles/utility/Mypage.css";

type Profile = {
  id: string;
  name: string;
  grade: number;
  major: string;
  category: string;
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

type UserInfoModalProps = {
  onClose: () => void;
};

export default function UserInfoModal({ onClose }: UserInfoModalProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        .select("id, name, grade, major, category")
        .eq("id", user.id)
        .single();

      if (profileError || !data) {
        setError("ユーザー情報の取得に失敗しました。");
        setLoading(false);
        return;
      }

      setProfile(data as Profile);
      setLoading(false);
    };

    void fetchProfile();
  }, []);

  return (
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
          <table className="mypage-table">
            <tbody>
              <tr>
                <th>氏名</th>
                <td>{profile.name}</td>
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
        )}
      </div>
    </div>
  );
}
