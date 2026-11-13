/** 明示的に true を設定した場合のみテスト版を使用する。 */
export const graduationCheckTestEnabled =
  import.meta.env.VITE_GRADUATION_CHECK_TEST === "true";
