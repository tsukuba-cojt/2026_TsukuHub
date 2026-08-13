export function resolveTenantPath(pathname: string, universitySlug: string) {
  const tenantPrefix = `/${universitySlug}`;
  if (pathname === tenantPrefix || pathname === `${tenantPrefix}/`) {
    return { isTenantPath: true, relativePath: "/" };
  }
  if (pathname.startsWith(`${tenantPrefix}/`)) {
    return {
      isTenantPath: true,
      relativePath: pathname.slice(tenantPrefix.length) || "/",
    };
  }
  return { isTenantPath: false, relativePath: pathname };
}
