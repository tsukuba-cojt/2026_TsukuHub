import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { isAuthRetryableFetchError, isAuthSessionMissingError } from "@supabase/supabase-js";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { createPasswordRecoveryAuth, supabase } from "../lib/supabase";
import "../styles/Auth.css";

function RecoveryPage({ title, loginPath, children }: {
  title: string;
  loginPath: string;
  children: ReactNode;
}) {
  return (
    <div className="auth-page">
      <main className="login-main">
        <h1 className="login-title">{title}</h1>
        <section className="auth-card login-card">{children}</section>
        <Link className="back-link" to={loginPath}>ログインへ戻る</Link>
      </main>
    </div>
  );
}

export function RequestPasswordReset() {
  const { accountSlug = "" } = useParams();
  const location = useLocation();
  const [email, setEmail] = useState((location.state as { email?: string } | null)?.email ?? "");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  if (!/^[a-z][a-z0-9-]*$/.test(accountSlug)) return <Navigate to="/404" replace />;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/${accountSlug}/auth/reset-password`,
      });
      if (error && error.code !== "user_not_found") throw error;
      setSent(true);
    } catch {
      setError("再設定メールを送信できませんでした。時間をおいて、もう一度お試しください。");
    } finally {
      setSending(false);
    }
  }

  return (
    <RecoveryPage title="パスワード再設定" loginPath={`/${accountSlug}/login`}>
      {sent ? (
        <p role="status">登録済みのメールアドレスには再設定用リンクが届きます。受信箱と迷惑メールフォルダをご確認ください。</p>
      ) : (
        <form className="auth-form" onSubmit={submit}>
          <label>
            <span className="label-text">登録したメールアドレス</span>
            <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="primary-button login-gradient-button" disabled={sending}>
            {sending ? "送信中..." : "再設定メールを送る"}
          </button>
        </form>
      )}
    </RecoveryPage>
  );
}

type RecoveryCredentials =
  | { token_hash: string }
  | { access_token: string; refresh_token: string };

function recoveryCredentials(hash: string): RecoveryCredentials | null {
  const params = new URLSearchParams(hash.slice(1));
  const tokenHash = params.get("token_hash");
  if (tokenHash) return { token_hash: tokenHash };

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (params.get("type") === "recovery" && accessToken && refreshToken) {
    return { access_token: accessToken, refresh_token: refreshToken };
  }
  return null;
}

type RecoveryState =
  | { status: "unverified"; credentials: RecoveryCredentials }
  | { status: "verified" | "invalid" | "complete" };

export function ResetPassword() {
  const { accountSlug = "" } = useParams();
  const { hash, pathname } = useLocation();
  const navigate = useNavigate();
  const [recovery, setRecovery] = useState<RecoveryState>(() => {
    const credentials = recoveryCredentials(hash);
    return credentials ? { status: "unverified", credentials } : { status: "invalid" };
  });
  const recoveryAuth = useRef<ReturnType<typeof createPasswordRecoveryAuth> | null>(null);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hash) void navigate(pathname, { replace: true });
  }, [hash, navigate, pathname]);

  useEffect(() => () => {
    const auth = recoveryAuth.current;
    if (auth) void auth.initialize().finally(() => auth.dispose());
  }, []);

  if (!/^[a-z][a-z0-9-]*$/.test(accountSlug)) return <Navigate to="/404" replace />;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || recovery.status === "invalid" || recovery.status === "complete") return;
    setError("");
    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください。");
      return;
    }
    if (password !== confirmation) {
      setError("パスワードが一致しません。");
      return;
    }

    setSaving(true);
    try {
      const auth = recoveryAuth.current ??= createPasswordRecoveryAuth();
      if (recovery.status === "unverified") {
        const { credentials } = recovery;
        const { data, error } = "token_hash" in credentials
          ? await auth.verifyOtp({ token_hash: credentials.token_hash, type: "recovery" })
          : await auth.setSession(credentials);
        if (error && (isAuthRetryableFetchError(error) || error.status === 429 || (error.status ?? 0) >= 500)) {
          throw error;
        }
        if (!data.session) {
          recoveryAuth.current = null;
          setRecovery({ status: "invalid" });
          void auth.dispose();
          return;
        }
        setRecovery({ status: "verified" });
      }

      const { error } = await auth.updateUser({ password });
      if (error) {
        if (isAuthSessionMissingError(error) || error.status === 401 || error.code === "session_not_found" || error.code === "reauthentication_needed") {
          recoveryAuth.current = null;
          setRecovery({ status: "invalid" });
          void auth.dispose();
        } else if (error.code === "same_password") {
          setError("現在のパスワードとは異なるパスワードを入力してください。");
        } else if (error.code === "weak_password") {
          setError("パスワードが安全性の条件を満たしていません。別のパスワードをお試しください。");
        } else {
          throw error;
        }
        return;
      }

      setPassword("");
      setConfirmation("");
      setRecovery({ status: "complete" });
      void auth.signOut({ scope: "local" }).catch(() => undefined);
    } catch {
      setError("パスワードを更新できませんでした。時間をおいて、もう一度お試しください。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <RecoveryPage title="新しいパスワードを設定" loginPath={`/${accountSlug}/login`}>
      {recovery.status === "complete" ? (
        <p role="status">パスワードを更新しました。ログイン画面から新しいパスワードでログインできます。</p>
      ) : recovery.status !== "invalid" ? (
        <form className="auth-form" onSubmit={submit}>
          <label>
            <span className="label-text">新しいパスワード（8文字以上）</span>
            <input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <label>
            <span className="label-text">新しいパスワード（確認用）</span>
            <input type="password" autoComplete="new-password" minLength={8} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="primary-button login-gradient-button" disabled={saving}>
            {saving ? "更新中..." : "パスワードを更新する"}
          </button>
        </form>
      ) : (
        <>
          <p role="alert">再設定リンクが無効か、有効期限が切れています。再設定メールをもう一度送信してください。</p>
          <p className="forgot-password-text"><Link to={`/${accountSlug}/auth/forgot-password`}>再設定メールを送る</Link></p>
        </>
      )}
    </RecoveryPage>
  );
}
