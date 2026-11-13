import { useEffect, useState } from "react";
import { useAuth } from "../auth/authContextValue";
import { fetchReviewedCourseCodes as fetchReviewedCourseCodesFromDb } from "../../services/classReviewService";

/**
 * ログイン中ユーザーが口コミを投稿済みの講義（科目番号）の集合。
 *
 * 1ユーザーあたり1クエリで完結させる設計（行数分のリクエストを出さない）。
 */

/** 参照の同一性を保つための空集合（未ログイン・取得失敗時に返す） */
const EMPTY_CODES: ReadonlySet<string> = new Set<string>();

const fetchReviewedCourseCodes = async (userId: string): Promise<string[]> => {
  return fetchReviewedCourseCodesFromDb(userId);
};

export const useReviewedCourseCodes = (): ReadonlySet<string> => {
  const { user, loading: authLoading } = useAuth();
  // 取得元のユーザーとセットで持ち、ログアウト・ユーザー切替時に持ち越さない
  const [fetched, setFetched] = useState<{
    userId: string;
    codes: ReadonlySet<string>;
  } | null>(null);

  useEffect(() => {
    // 未ログイン（＝認証確認中を含む）なら投稿済み判定を行わない
    if (authLoading || user === null) return;

    let cancelled = false;
    fetchReviewedCourseCodes(user.id)
      .then((codes) => {
        if (!cancelled) {
          setFetched({ userId: user.id, codes: new Set(codes) });
        }
      })
      .catch(() => {
        // 取得に失敗しても画面は壊さず、全行を未投稿扱いにフォールバックする
        if (!cancelled) setFetched({ userId: user.id, codes: EMPTY_CODES });
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  return user !== null && fetched !== null && fetched.userId === user.id
    ? fetched.codes
    : EMPTY_CODES;
};
