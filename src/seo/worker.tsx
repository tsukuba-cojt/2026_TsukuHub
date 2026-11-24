import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import ClassGuideDetailContent from "../components/class/ClassGuideDetailContent";
import { classGuideCategories, classGuideCategoryFromSlug } from "../data/classGuideCategories";
import { isKnownAppPath } from "../data/comingSoon";
import { defaultFilters, pageSize, readSearch, searchQuery } from "../lib/courseSearch";
import { legacyRoots } from "../lib/legacyRoutes";
import type { CatalogCourse } from "../types/courseCatalog";
import { catalogYear, courseBucket, courseDetails, coursePath } from "./catalog";
import { classTopMetadata, courseMetadata, guideMetadata, homeMetadata, listMetadata, type PageMetadata } from "./metadata";
import { hasPublicCourses, publicGuide, publicUniversities } from "./publicData";
import { readAsset, sitemap, type Assets } from "./sitemap";

async function documentResponse(assets: Assets, url: URL, status = 200, meta?: PageMetadata, body?: ReactNode, noindex = false) {
  const shell = await assets.fetch(new Request(new URL("/", url)));
  if (!shell.ok) return shell;
  let html = await shell.text();
  if (meta) {
    const canonical = new URL(meta.path, url.origin).href;
    const head = renderToStaticMarkup(<>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={meta.type ?? "website"} />
      <meta property="og:site_name" content="TsukuHub" />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
    </>);
    html = html.replace(/<!--page-meta-->[\s\S]*?<!--\/page-meta-->/, () => head);
  }
  if (body) {
    const content = renderToStaticMarkup(<main>{body}</main>);
    html = html.replace('<div id="root"></div>', () => `<div id="root">${content}</div>`);
  }
  const headers = new Headers({ "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
  if (noindex || status === 404) headers.set("X-Robots-Tag", "noindex");
  if (status === 503) headers.set("Retry-After", "60");
  return new Response(html, { status, headers });
}

async function route(request: Request, assets: Assets) {
  const url = new URL(request.url);
  const { origin, pathname } = url;
  if (request.method !== "GET" && request.method !== "HEAD") return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
  if (pathname === "/robots.txt") return new Response(`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
  if (/^\/sitemap(?:-[a-z0-9-]+)?\.xml$/.test(pathname)) {
    try { return await sitemap(url, assets); }
    catch { return new Response("サイトマップを取得できませんでした。", { status: 503, headers: { "Retry-After": "60" } }); }
  }
  if (pathname === "/") return Response.redirect(new URL("/tsukuba" + url.search, origin), 308);
  const app = (noindex = false) => documentResponse(assets, url, 200, undefined, undefined, noindex);
  const missing = () => documentResponse(assets, url, 404, undefined, <h1>ページが見つかりません</h1>);
  const [, slug, ...segments] = pathname.replace(/\/+$/, "").split("/");
  const section = segments.join("/");
  if (slug === "404") return missing();
  if (slug === "admin" || slug === "company" || legacyRoots.includes(slug)) return app(true);
  if (pathname.includes(".") || /^\/(?:assets|data|images|@|src)\//.test(pathname)) return assets.fetch(request);
  if (!/^[a-z][a-z0-9-]*$/.test(slug)) return missing();
  if (section === "career/stories") return Response.redirect(new URL(`/${slug}/career/alumni${url.search}`, origin), 308);

  const guide = /^class\/guide\/([^/]+)$/.exec(section);
  const course = /^class\/([^/]+)$/.exec(section);
  const isCoursePage = course && section !== "class/top";
  if (section && section !== "class" && section !== "class/top" && !isCoursePage && !guide) {
    if (/^(?:login|signup|auth|mypage|timetable|graduation-checker)(?:\/|$)/.test(section)
      || /^career\/internships\/[^/]+$/.test(section) || /\/(?:edit|review)$/.test(section)) return app(true);
    if (segments[0] === "class" && segments[1] === "guides" && !classGuideCategoryFromSlug(segments[2])) return missing();
    return isKnownAppPath("/" + section) ? app() : missing();
  }
  try {
    const [university] = await publicUniversities(slug);
    if (!university) return missing();
    if (university.status !== "active") return app(true);
    const coursesEnabled = hasPublicCourses(university);
    const list = `/${slug}/class`;
    if (!section) {
      const meta = homeMetadata(slug, university.name);
      return documentResponse(assets, url, 200, meta, <>
        <h1>{university.name}のキャンパス情報</h1><p>{meta.description}</p>
        {coursesEnabled && <p><a href={list + "/top"}>授業・履修ガイド</a></p>}
        <a href={`/${slug}/career`}>キャリア・インターン</a>
      </>);
    }
    if (!coursesEnabled) return app(true);
    if (section === "class/top") {
      const meta = classTopMetadata(slug, university.name);
      return documentResponse(assets, url, 200, meta, <>
        <h1>{university.name}の授業・履修</h1><p>{meta.description}</p>
        <p><a href={list}>授業を検索する</a></p>
        {Object.values(classGuideCategories).map((category) => <p key={category.slug}>
          <a href={`${list}/guides/${category.slug}`}>{category.label}</a>
        </p>)}
      </>);
    }
    if (guide) {
      if (!/^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(guide[1])) return missing();
      const article = await publicGuide(university.id, guide[1]);
      if (!article) return missing();
      return documentResponse(assets, url, 200, guideMetadata(slug, university.name, article), <>
        <a href={list + "/top"}>授業・履修</a><ClassGuideDetailContent article={article} />
      </>);
    }
    if (slug !== "tsukuba") return app();
    const year = catalogYear(url.searchParams);
    const dir = `/data/course-pages/tsukuba/${year}`;
    if (isCoursePage) {
      const code = course[1];
      if (!/^[a-z0-9]+$/i.test(code)) return missing();
      const rows = await readAsset<CatalogCourse[]>(assets, origin, `${dir}/${courseBucket(code)}.json`);
      const { course: item, related } = courseDetails(rows, code);
      if (!item) return missing();
      return documentResponse(assets, url, 200, courseMetadata(slug, university.name, item, year), <>
        <a href={`${list}?year=${year}`}>{university.name}の授業検索</a>
        <h1>{item.course_name}</h1><p>{year}年度・{code}</p>
        <p>{[item.instructor, item.semester, item.schedule, item.credits && item.credits + "単位"].filter(Boolean).join(" ／ ")}</p>
        {item.overview && <p>{item.overview}</p>}{item.remarks && <p>{item.remarks}</p>}
        {related.map((row) => <p key={row.course_number}><a href={coursePath(slug, row.course_number, year)}>{row.course_name}</a></p>)}
      </>);
    }
    const { filters, page } = readSearch(url.searchParams);
    if (searchQuery(filters, 1) !== searchQuery({ ...defaultFilters, academicYear: year }, 1)) return app(true);
    const rows = await readAsset<[string, string][]>(assets, origin, dir + "/listing.json");
    const lastPage = Math.max(1, Math.ceil(rows.length / pageSize));
    if (page > lastPage) return missing();
    const meta = listMetadata(slug, university.name, filters, page);
    return documentResponse(assets, url, 200, meta, <>
      <h1>{university.name}の授業検索（{year}年度）</h1>
      <ul>{rows.slice((page - 1) * pageSize, page * pageSize).map(([code, name]) =>
        <li key={code}><a href={coursePath(slug, code, year)}>{name}（{code}）</a></li>
      )}</ul>
      {page > 1 && <a href={list + searchQuery(filters, page - 1)}>前のページ</a>}
      {page < lastPage && <a href={list + searchQuery(filters, page + 1)}>次のページ</a>}
    </>);
  } catch {
    // The original app can retry independently. A failed dependency is not a missing page.
    return documentResponse(assets, url, 503, undefined, <p>公開情報を取得できませんでした。</p>);
  }
}

export default {
  async fetch(request: Request, env: { ASSETS: Assets }) {
    const response = await route(request, env.ASSETS);
    return request.method === "HEAD" ? new Response(null, response) : response;
  },
};
