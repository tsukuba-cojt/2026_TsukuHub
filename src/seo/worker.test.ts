import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import worker from "./worker";
import { courseBucket } from "./catalog";
import { defaultFilters, readSearch, searchQuery } from "../lib/courseSearch";
import type { CatalogCourse } from "../types/courseCatalog";

const origin = "https://campus.example";
const shell = readFileSync("index.html", "utf8");
const slug = "tsukuba";
const university = { id: "university-id", slug, name: "筑波大学", status: "active",
  university_features: [{ feature_key: "courses", status: "enabled" }] };
const course: CatalogCourse = {
  academic_year: 2025, course_number: "AB1001", course_name: "情報 & 社会", overview: "<基礎>を学ぶ",
  semester: "春A", schedule: "月1", method: "1", credits: "2", instructor: "担当教員", target_year: "1", remarks: "",
};
const guideId = "10000000-0000-4000-8000-000000000001";
const guide = { id: guideId, title: "履修登録", category: "registration_strategy", description: "新入生向け",
  content: "## 登録の流れ\n授業を選びます。", published_at: "2026-04-01", read_minutes: 3 };

const db = vi.fn<typeof fetch>();
const assets = {
  fetch: async (request: Request) => {
    const path = new URL(request.url).pathname;
    if (path === "/") return new Response(shell);
    if (path.endsWith("/codes.json")) return Response.json([course.course_number]);
    if (path.endsWith("/listing.json")) return Response.json(Array.from({ length: 11 }, (_, i) => ["C" + i, "授業" + i]));
    if (path === `/data/course-pages/tsukuba/2025/${courseBucket(course.course_number)}.json`) return Response.json([course]);
    if (path.startsWith("/data/course-pages/")) return Response.json([]);
    return new Response(null, { status: 404 });
  },
};
const open = (path: string, method = "GET") => worker.fetch(new Request(origin + path, { method }), { ASSETS: assets });

beforeEach(() => {
  vi.stubEnv("VITE_SUPABASE_URL", "https://db.example");
  vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "public-key");
  db.mockReset().mockImplementation(async (input) => {
    const url = new URL(String(input));
    return Response.json(url.pathname.endsWith("/universities") ? [university] : [guide]);
  });
  vi.stubGlobal("fetch", db);
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("公開ページの配信", () => {
  it("ルートからの転送先では最初にLoadingだけを表示し、JavaScript無効時は案内を表示する", async () => {
    const redirect = await open("/?from=campus");
    expect(redirect.status).toBe(308);
    expect(redirect.headers.get("Location")).toBe(origin + "/tsukuba?from=campus");

    const response = await worker.fetch(new Request(redirect.headers.get("Location")!), { ASSETS: assets });
    const html = await response.text();
    expect(response.status).toBe(200);
    expect(html).toContain(`rel="canonical" href="${origin}/tsukuba"`);
    const root = html.split('<div id="root">')[1].split("</main>")[0];
    expect(root).toMatch(/<noscript><h1>筑波大学のキャンパス情報<\/h1>[\s\S]*href="\/tsukuba\/class\/top"/);
    const visibleText = root.replace(/<noscript>[\s\S]*?<\/noscript>/g, "").replace(/<[^>]*>/g, "");
    expect(visibleText).toBe("Loading...");
  });

  it("年度別の本文と正規URLを最初のHTMLに一度だけ出力する", async () => {
    const path = "/tsukuba/class/AB1001?year=2025";
    const response = await open(path + "&utm_source=test");
    const html = await response.text();
    expect(response.status).toBe(200);
    expect(html.match(/<title>/g)).toHaveLength(1);
    expect(html).toContain("<h1>情報 &amp; 社会</h1>");
    expect(html).toContain("&lt;基礎&gt;を学ぶ");
    expect(html).toContain(`rel="canonical" href="${origin}${path}"`);
    const head = await open(path, "HEAD");
    expect(head.status).toBe(200);
    expect(await head.text()).toBe("");
  });

  it("公開記事だけを対象大学に絞って読み、見出しと本文を配信する", async () => {
    const html = await (await open("/tsukuba/class/guide/" + guideId)).text();
    expect(html).toContain("授業を選びます。");
    const [input, init] = db.mock.calls[1];
    const query = new URL(String(input)).searchParams;
    expect(query.get("status")).toBe("eq.published");
    expect(query.get("class_guide_article_universities.university_id")).toBe("eq.university-id");
    expect(init?.headers).toEqual({ apikey: "public-key" });
  });

  it("2ページ目の結果と前ページへのリンクを返す", async () => {
    const html = await (await open("/tsukuba/class?year=2025&page=2")).text();
    expect(html).toContain("授業10（C10）");
    expect(html).not.toContain("授業0（C0）");
    expect(html).toContain('href="/tsukuba/class?year=2025">前のページ');
  });

  it("絞り込み条件は2ページ目を直接開いても復元できる", () => {
    const filters = { ...defaultFilters, academicYear: 2024, text: "情報 & 社会", moduleRangeEnd: 4, scheduleDay: "mon" };
    expect(readSearch(new URLSearchParams(searchQuery(filters, 2)))).toEqual({ filters, page: 2 });
  });

  it("見つからない科目・記事は404、通信障害は再試行可能な503", async () => {
    expect((await open("/tsukuba/class/MISSING")).status).toBe(404);
    db.mockResolvedValueOnce(Response.json([university])).mockResolvedValueOnce(Response.json([]));
    expect((await open("/tsukuba/class/guide/" + guideId)).status).toBe(404);
    db.mockRejectedValueOnce(new Error("offline"));
    const response = await open("/tsukuba");
    expect(response.status).toBe(503);
    expect(response.headers.has("Retry-After")).toBe(true);
  });

  it("停止中・準備中の授業と会員画面をインデックス対象から外す", async () => {
    db.mockResolvedValueOnce(Response.json([{ ...university, university_features: [] }]));
    const page = await open("/tsukuba/class/guide/" + guideId);
    expect(page.headers.get("X-Robots-Tag")).toBe("noindex");
    expect(await page.text()).not.toContain(guide.description);
    expect((await open("/tsukuba/career/internships/123")).headers.get("X-Robots-Tag")).toBe("noindex");
    expect(db.mock.calls).toHaveLength(1);
  });

  it("サイトマップは公開大学・公開記事・年度別の正規URLから作成する", async () => {
    expect(await (await open("/robots.txt")).text()).toContain(origin + "/sitemap.xml");
    expect(await (await open("/sitemap.xml")).text()).toContain("/sitemap-tsukuba-2025.xml");
    expect(await (await open("/sitemap-pages.xml")).text()).toContain("/tsukuba/class/guide/" + guideId);
    const annual = await open("/sitemap-tsukuba-2025.xml");
    expect(annual.headers.get("Content-Type")).toContain("application/xml");
    expect(await annual.text()).toContain(origin + "/tsukuba/class/AB1001?year=2025");
    db.mockResolvedValueOnce(Response.json([]));
    expect((await open("/sitemap-tsukuba-2025.xml")).status).toBe(404);
  });
});
