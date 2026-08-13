import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { COMING_SOON_NOTICE, isKnownAppPath, shouldBlockInternalNavigation } from "../../data/comingSoon";
import { useUniversity } from "../university/universityContextValue";
import Toast from "./Toast";
import { resolveTenantPath } from "../../lib/tenantNavigation";

function InternalLinkGuard() {
  const [noticeKey, setNoticeKey] = useState(0);
  const navigate = useNavigate();
  const { path, university } = useUniversity();

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

      const { isTenantPath, relativePath: pathname } = resolveTenantPath(
        url.pathname,
        university?.slug ?? "",
      );

      if (isTenantPath && !shouldBlockInternalNavigation(pathname)) return;
      if (!isTenantPath && isKnownAppPath(pathname)) {
        event.preventDefault();
        event.stopPropagation();
        navigate(`${path(pathname)}${url.search}${url.hash}`);
        return;
      }
      if (!shouldBlockInternalNavigation(pathname)) return;

      event.preventDefault();
      event.stopPropagation();
      setNoticeKey((current) => current + 1);
    };

    document.addEventListener("click", handleInternalLinkClick, true);
    return () => document.removeEventListener("click", handleInternalLinkClick, true);
  }, [navigate, path, university?.slug]);

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
