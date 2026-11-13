import { afterEach, describe, expect, it, vi } from "vitest";
import { getCatalogCourse, listCatalogCourses } from "./courseCatalog";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("courseCatalog", () => {
  it("大学スラッグが無いときは空のカタログを返す", async () => {
    await expect(listCatalogCourses("")).resolves.toEqual([]);
    await expect(listCatalogCourses(null)).resolves.toEqual([]);
    await expect(getCatalogCourse(undefined, "GC51234")).resolves.toBeNull();
  });

  it("指定年度の静的JSONだけを取得する", async () => {
    const courses = [
      {
        academic_year: 2024,
        course_number: "TEST001",
        course_name: "年度別テスト科目",
        method: "1",
        credits: "1.0",
        target_year: "1",
        semester: "春A",
        schedule: "月1",
        classroom: "3A202",
        instructor: "担当 教員",
        overview: "概要",
        remarks: "備考",
      },
    ];
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      headers: new Headers({ "Content-Type": "application/json" }),
      json: async () => ({ academic_year: 2024, courses }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(listCatalogCourses("test-university", 2024)).resolves.toEqual(
      courses
    );
    await expect(
      getCatalogCourse("test-university", "TEST001", 2024)
    ).resolves.toEqual(courses[0]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "/data/courses/test-university-2024.json"
    );
  });

  it("2026年度も年度付きファイルを使用する", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      headers: new Headers({ "Content-Type": "application/json" }),
      json: async () => ({ courses: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await listCatalogCourses("current-test", 2026);
    expect(fetchMock).toHaveBeenCalledWith(
      "/data/courses/current-test-2026.json"
    );
  });

  it("直近に利用した2年度だけをキャッシュする", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      headers: new Headers({ "Content-Type": "application/json" }),
      json: async () => ({ courses: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await listCatalogCourses("cache-test", 2023);
    await listCatalogCourses("cache-test", 2024);
    await listCatalogCourses("cache-test", 2023);
    await listCatalogCourses("cache-test", 2025);
    await listCatalogCourses("cache-test", 2024);

    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it.each([2021, 2022])("%i年度のJSONにSPAのHTMLが返ってもCSVの処理を妨げない", async (year) => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("<!doctype html><html><body><div id='root'></div></body></html>", {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(listCatalogCourses("spa-fallback-test", year)).resolves.toEqual([]);
    await expect(getCatalogCourse("spa-fallback-test", "TEST001", year)).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(`/data/courses/spa-fallback-test-${year}.json`);
  });

  it("カタログが404の場合は科目情報なしとして扱う", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 404 })));

    await expect(listCatalogCourses("missing-catalog-test", 2022)).resolves.toEqual([]);
  });

  it("サーバーエラーを未対応年度として握りつぶさない", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 500 })));

    await expect(listCatalogCourses("failed-catalog-test", 2023)).rejects.toThrow(
      "授業カタログの取得に失敗しました。",
    );
  });
});
