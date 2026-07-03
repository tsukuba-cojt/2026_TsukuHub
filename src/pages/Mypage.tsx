// Mypage.tsx
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "../styles/utility/Mypage.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

type Profile = {
  id: string;
  name: string;
  grade: number;
  major: string;
  category: string;
};

// category の内部値 → 表示名
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

export default function Mypage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    fetchProfile();
  }, []);

  return (
    <div className="mypage-wrapper">
      <div className="mypage-card">
        <h1 className="mypage-title">ユーザー情報</h1>

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