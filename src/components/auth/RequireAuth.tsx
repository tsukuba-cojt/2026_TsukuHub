import { useEffect } from "react";
import { useAuth } from "./authContextValue";
import Unauthorized from "./Unauthorized";

// 会員限定ページ用のガード。
// ページ本体は常にレンダリングし、未ログイン確定時のみ Unauthorized オーバーレイを重ねる。
// 認証状態の判定中（loading）はオーバーレイを出さないので、
// ログイン済みユーザーにゲートが一瞬見える flash は発生しない。
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const showGate = !loading && !user;

  // オーバーレイ表示中は背後のページをスクロールさせない
  useEffect(() => {
    if (!showGate) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [showGate]);

  return (
    <>
      {children}
      {showGate && <Unauthorized />}
    </>
  );
}
