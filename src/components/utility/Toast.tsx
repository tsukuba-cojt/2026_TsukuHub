import { useEffect } from "react";
import { Check, TriangleAlert, X } from "lucide-react";
import "../../styles/utility/Toast.css";

// 画面下部に数秒表示して自動で消える軽量トースト。
// variant="warning" + dismissible で、閉じるまで残る警告表示にもできる。
type ToastProps = {
  message: string;
  onClose: () => void;
  durationMs?: number;
  /** 見た目の種類（success=完了通知の緑 / warning=警告の黄） */
  variant?: "success" | "warning";
  /** true なら閉じるボタンを出し、自動では消さない */
  dismissible?: boolean;
};

function Toast({
  message,
  onClose,
  durationMs = 4000,
  variant = "success",
  dismissible = false,
}: ToastProps) {
  useEffect(() => {
    // 手動で閉じる指定のときは自動消滅させない
    if (dismissible) return;
    const timer = setTimeout(onClose, durationMs);
    return () => clearTimeout(timer);
  }, [onClose, durationMs, dismissible]);

  const isWarning = variant === "warning";

  return (
    <div
      className={`toast${isWarning ? " isWarning" : ""}`}
      role={isWarning ? "alert" : "status"}
    >
      <span className="toastIcon">
        {isWarning ? (
          <TriangleAlert aria-hidden="true" />
        ) : (
          <Check aria-hidden="true" />
        )}
      </span>
      {message}
      {dismissible && (
        <button
          type="button"
          className="toastClose"
          aria-label="閉じる"
          onClick={onClose}
        >
          <X aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export default Toast;
