import { useEffect } from "react";
import { Check } from "lucide-react";
import "../../styles/utility/Toast.css";

// 画面下部に数秒表示して自動で消える軽量トースト
type ToastProps = {
  message: string;
  onClose: () => void;
  durationMs?: number;
};

function Toast({ message, onClose, durationMs = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, durationMs);
    return () => clearTimeout(timer);
  }, [onClose, durationMs]);

  return (
    <div className="toast" role="status">
      <span className="toastIcon">
        <Check aria-hidden="true" />
      </span>
      {message}
    </div>
  );
}

export default Toast;
