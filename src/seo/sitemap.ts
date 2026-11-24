import { catalogYears, coursePath } from "./catalog";
import { hasPublicCourses, publicGuideIds, publicUniversities } from "./publicData";

export interface Assets {
  fetch(request: Request): Promise<Response>;
}

export async function readAsset<T>(assets: Assets, origin: string, path: string): Promise<T> {
  const response = await assets.fetch(new Request(new URL(path, origin)));
  if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
    throw new Error(`Missing catalog asset: ${path}`);
  }
  return response.json();
}

function sitemapXml(origin: string, paths: string[], index = false) {
  const tag = index ? "sitemap" : "url";
  const root = index ? "sitemapindex" : "urlset";
  const entries = paths.map((path) => {
    const loc = new URL(path, origin).href.replaceAll("&", "&amp;").replaceAll("<", "&lt;");
    return `<${tag}><loc>${loc}</loc></${tag}>`;
  });
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><${root} xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join("\n")}</${root}>`, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300" },
  });
}

export async function sitemap(url: URL, assets: Assets) {
  const universities = await publicUniversities();
  const tsukuba = universities.find((u) => u.slug === "tsukuba");
  const years = tsukuba && hasPublicCourses(tsukuba) ? catalogYears : [];
  if (url.pathname === "/sitemap.xml") {
    return sitemapXml(url.origin, ["/sitemap-pages.xml", ...years.map((year) => `/sitemap-tsukuba-${year}.xml`)], true);
  }
  if (url.pathname === "/sitemap-pages.xml") {
    const pages = [];
    for (const university of universities) {
      const base = `/${university.slug}`;
      pages.push(base);
      if (!hasPublicCourses(university)) continue;
      pages.push(`${base}/class/top`);
      if (university.slug === "tsukuba") pages.push(...years.map((year) => `${base}/class?year=${year}`));
      for (const id of await publicGuideIds(university.id)) pages.push(`${base}/class/guide/${id}`);
    }
    return sitemapXml(url.origin, pages);
  }
  const year = years.find((y) => url.pathname === `/sitemap-tsukuba-${y}.xml`);
  if (!year) return new Response(null, { status: 404 });
  const codes = await readAsset<string[]>(assets, url.origin, `/data/course-pages/tsukuba/${year}/codes.json`);
  return sitemapXml(url.origin, codes.map((code) => coursePath("tsukuba", code, year)));
}
