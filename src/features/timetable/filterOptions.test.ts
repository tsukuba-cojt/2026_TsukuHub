import { describe, expect, it } from "vitest";
import {
  timetableFilterOptions,
  timetableMajorLabels,
} from "./filterOptions";

describe("timetableFilterOptions", () => {
  it("学類は実データがなくても全件選べる", () => {
    const options = timetableFilterOptions();
    expect(options.departments).toContain("情報メディア創成学類");
    expect(options.departments).toContain("情報科学類");
    expect(options.departments).toContain("人文学類");
    expect(options.departments.length).toBeGreaterThan(10);
  });

  it("学年は1〜6年次を常に出せる", () => {
    expect(timetableFilterOptions().studentYears).toEqual([
      "1年次",
      "2年次",
      "3年次",
      "4年次",
      "5年次",
      "6年次",
    ]);
  });

  it("学類を選ぶとその学類の専攻だけになる", () => {
    expect(timetableMajorLabels("情報科学類")).toEqual([
      "ソフトウェアサイエンス主専攻",
      "情報システム主専攻",
      "知能情報メディア主専攻",
    ]);
  });

  it("学類未選択なら全専攻を出せる", () => {
    const majors = timetableMajorLabels();
    expect(majors).toContain("情報メディア創成主専攻");
    expect(majors).toContain("哲学主専攻");
    expect(majors.length).toBeGreaterThan(20);
  });
});
