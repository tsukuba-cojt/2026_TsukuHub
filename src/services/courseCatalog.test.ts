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
});
