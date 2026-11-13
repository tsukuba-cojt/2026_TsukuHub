import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

export function useLeaveConfirm() {
  const navigate = useNavigate();
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const request = useCallback((path: string) => setPendingPath(path), []);

  const cancel = useCallback(() => setPendingPath(null), []);

  const confirm = useCallback(() => {
    if (pendingPath === null) return;
    setPendingPath(null);
    navigate(pendingPath);
  }, [navigate, pendingPath]);

  return { isOpen: pendingPath !== null, request, cancel, confirm };
}
