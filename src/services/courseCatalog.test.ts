import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { resolveCourseId } from "../features/graduationCheck/osaka/resolveCourseId";
import type { CourseCatalogFile } from "../types/courseCatalog";

const catalogPath = resolve(process.cwd(), "public/data/courses/osaka.json");

describe("osaka course catalog", () => {
  it("osaka.json contains courses for catalog lookup", () => {
    const payload = JSON.parse(readFileSync(catalogPath, "utf8")) as CourseCatalogFile;
    expect(payload.university).toBe("osaka");
    expect(payload.courses.length).toBeGreaterThan(50);
    expect(payload.courses.every((c) => c.course_number && c.course_name)).toBe(true);
  });

  it("resolveCourseId matches 学問への扉 from catalog", () => {
    const payload = JSON.parse(readFileSync(catalogPath, "utf8")) as CourseCatalogFile;
    const code = resolveCourseId(payload.courses, "学問への扉");
    expect(code).toBeTruthy();
  });
});
