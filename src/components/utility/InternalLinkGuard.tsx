import { useEffect, useState } from "react";
import { COMING_SOON_NOTICE, shouldBlockInternalNavigation } from "../../data/comingSoon";
import Toast from "./Toast";

function InternalLinkGuard() {
  const [noticeKey, setNoticeKey] = useState(0);

  useEffect(() => {
    const handleInternalLinkClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;

      const rawHref = anchor.getAttribute("href");
      if (!rawHref || rawHref === "#" || rawHref.startsWith("#")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      if (!shouldBlockInternalNavigation(url.pathname)) return;

      event.preventDefault();
      event.stopPropagation();
      setNoticeKey((current) => current + 1);
    };

    document.addEventListener("click", handleInternalLinkClick, true);
    return () => document.removeEventListener("click", handleInternalLinkClick, true);
  }, []);

  return noticeKey > 0 ? (
    <Toast
      key={noticeKey}
      message={COMING_SOON_NOTICE}
      onClose={() => setNoticeKey(0)}
      variant="warning"
      durationMs={2600}
    />
  ) : null;
}

export default InternalLinkGuard;
