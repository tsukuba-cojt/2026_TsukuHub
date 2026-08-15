import { describe, expect, it } from "vitest";
import { getCatalogCourse, listCatalogCourses } from "./courseCatalog";

describe("courseCatalog", () => {
  it("大学スラッグが無いときは空のカタログを返す", async () => {
    await expect(listCatalogCourses("")).resolves.toEqual([]);
    await expect(listCatalogCourses(null)).resolves.toEqual([]);
    await expect(getCatalogCourse(undefined, "GC51234")).resolves.toBeNull();
  });
});
