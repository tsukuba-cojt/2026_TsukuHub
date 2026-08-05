import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * 「入力内容が失われる遷移」の前に確認を挟むための共通フック。
 *
 * 時間割共有ウィザードの「マイページへ」ボタンで使うが、マイページ側から
 * 同じウィザードを開いたときにも使い回せるよう、遷移先は呼び出し時に渡す。
 *
 * 使い方:
 *   const leave = useLeaveConfirm();
 *   <button onClick={() => leave.request("/mypage")}>マイページへ</button>
 *   {leave.isOpen && (
 *     <LeaveConfirmModal onCancel={leave.cancel} onConfirm={leave.confirm} />
 *   )}
 */
export function useLeaveConfirm() {
  const navigate = useNavigate();
  // 確認待ちの遷移先。null なら確認ダイアログは閉じている。
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  /** 遷移を要求する（確認ダイアログを開く） */
  const request = useCallback((path: string) => setPendingPath(path), []);

  /** 確認をキャンセルする（遷移しない） */
  const cancel = useCallback(() => setPendingPath(null), []);

  /** 確認を承認して遷移する */
  const confirm = useCallback(() => {
    if (pendingPath === null) return;
    setPendingPath(null);
    navigate(pendingPath);
  }, [navigate, pendingPath]);

  return { isOpen: pendingPath !== null, request, cancel, confirm };
}
