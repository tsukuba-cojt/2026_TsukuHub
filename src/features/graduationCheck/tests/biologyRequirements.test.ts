import { describe, expect, test } from "vitest";
import { checkGraduation } from "../checkGraduation";
import { classifyUncountedCourse } from "../manualClassification";
import { resolveRequirementId } from "../data/supportedDepartments";
import { gradRequirementData } from "../data/gradRequirementData";
import type { Course } from "../types";
import { course } from "./helpers";

const lab = (id: string, method: Course["catalogInstructionMethod"] = "experiment", grade: Course["grade"] = "A"): Course => ({
  ...course(id, "名称からは判定しない", 1, grade, 2026), catalogInstructionMethod: method,
});
const countItems = (courses: Course[]) => checkGraduation(courses, "biology-22")
  .details.requirementItems.filter((item) => item.courseCount);
const four = () => [lab("EB16073", "practicum"), lab("EB50146"), lab("EB50246"), lab("EB52026")];

describe("生物学類の科目数条件", () => {
  test("実習1を含む実験・実習4科目で充足する", () => {
    expect(countItems(four()).map((item) => item.courseCount)).toEqual([
      expect.objectContaining({ minimum: 4, earned: 4, status: "satisfied" }),
      expect.objectContaining({ minimum: 1, earned: 1, status: "satisfied" }),
    ]);
  });
  test("多くの単位を取得しても3科目では不足する", () => {
    const items = countItems(four().slice(0, 3).map((item) => ({ ...item, unit: 20 })));
    expect(items[0]?.courseCount).toMatchObject({ earned: 3, status: "unsatisfied" });
    expect(checkGraduation(four().slice(0, 3).map((item) => ({ ...item, unit: 20 })), "biology-22")
      .categories.find((item) => item.category === "specialized")?.isSatisfied).toBe(false);
  });
  test("実験4科目だけでは実習1科目の条件を満たさない", () => {
    expect(countItems(four().map((item) => ({ ...item, catalogInstructionMethod: "experiment" })))[1]?.courseCount)
      .toMatchObject({ earned: 0, status: "unsatisfied" });
  });
  test("年度をまたぐ再履修・同一授業は1科目に数える", () => {
    const courses = four().slice(0, 3);
    courses.push({ ...courses[1], year: 2025 }, { ...lab("EB50266"), equivalentCourseIds: ["EB50246"] });
    expect(countItems(courses)[0]?.courseCount).toMatchObject({ earned: 3, status: "unsatisfied" });
  });
  test("同一授業の関係が推移しても重複しない", () => {
    const courses = [lab("EB16073", "practicum"),
      { ...lab("EB50146"), equivalentCourseIds: ["EB50156"] },
      { ...lab("EB50156"), equivalentCourseIds: ["EB50246"] }, lab("EB50246")];
    expect(countItems(courses)[0]?.courseCount?.earned).toBe(2);
  });
  test("属性不明科目で条件が変わり得る場合は確認不能になる", () => {
    const courses = four();
    delete courses[0].catalogInstructionMethod;
    expect(countItems(courses).map((item) => item.courseCount?.status)).toEqual(["unknown", "unknown"]);
    expect(countItems(courses).every((item) => !item.isSatisfied)).toBe(true);
  });
  test("不明科目があっても既知の4科目で充足できる", () => {
    expect(countItems([...four(), course("EB99999", "不明", 1)])[0]?.courseCount?.status).toBe("satisfied");
  });
  test("不明科目を足しても4に届かなければ不足と判定する", () => {
    expect(countItems([lab("EB16073", "practicum"), course("EB99999", "不明", 1)])[0]?.courseCount?.status).toBe("unsatisfied");
  });
  test("不合格は除外し、履修中は見込み科目数だけへ加える", () => {
    const courses = four();
    courses[3].grade = "履修中";
    expect(countItems(courses)[0]?.courseCount).toMatchObject({ earned: 3, prospective: 4, status: "unsatisfied", prospectiveStatus: "satisfied" });
    courses[3].grade = "D";
    expect(countItems(courses)[0]?.courseCount).toMatchObject({ earned: 3, prospective: 3 });
  });
  test("EB15より前の必修実験や、講義を4科目に含めない", () => {
    const items = countItems([lab("EB10013"), lab("EB00003"), lab("EB16073", "practicum"),
      lab("EB50146", "other"), lab("EB50246", "other"), lab("EB52026", "other")]);
    expect(items[0]?.courseCount?.earned).toBe(1);
  });
  test("公開臨海実習は1科目だけ単位・科目数に計上する", () => {
    const report = checkGraduation([lab("EB16913", "practicum"), lab("EB16933", "practicum"), lab("EB16953", "practicum")], "biology-22");
    expect(report.details.requirementItems.find((item) => item.courseCount)?.courseCount?.earned).toBe(1);
    expect(report.details.uncountedCourses).toHaveLength(2);
  });
  test("公開臨海実習はCSV行順によらず合格確定を優先する", () => {
    const courses = [lab("EB16913", "practicum", "履修中"),
      lab("EB16953", "practicum", "D"), lab("EB16933", "practicum")];
    for (const input of [courses, [...courses].reverse()]) {
      const report = checkGraduation(input, "biology-24");
      expect(report.details.selectResults[0].courses.map((item) => item.id)).toEqual(["EB16933"]);
      expect(report.details.requirementItems.find((item) => item.courseCount)?.courseCount?.earned).toBe(1);
    }
  });
  test("手動で専門へ移しても科目数条件を自動充足しない", () => {
    const report = checkGraduation([course("EB00001", "不明科目", 40)], "biology-22");
    const classified = classifyUncountedCourse(report, 0, "specialized");
    expect(classified.details.requirementItems.find((item) => item.courseCount)?.isSatisfied).toBe(false);
  });
  test("2022〜2023と2024以降の必修・選択単位差をルーティングする", () => {
    for (const year of [2023]) expect(resolveRequirementId("biology", "biology", year)).toBe("biology-22");
    for (const year of [2024, 2025, 2026]) expect(resolveRequirementId("biology", "biology", year)).toBe("biology-24");
    expect(checkGraduation([], "biology-22").categories[0].requiredUnits).toBe(44);
    expect(checkGraduation([], "biology-24").categories[0].requiredUnits).toBe(40);
  });
  test("124単位を満たしても科目数の不足・確認不能を卒業充足にしない", () => {
    const required = gradRequirementData["biology-24"].courses.compulsory.map((entry, index) => {
      if (entry.startsWith("基礎生物学実験::")) return course("EB10013", "基礎生物学実験I", 3);
      if (entry === "情報::4") return course("6000001", "情報", 4);
      const name = entry.split("//")[0];
      const units = name === "卒業研究" || name === "生物学研究法" ? 6 : name === "科学コミュニケーション" ? 2 : 1;
      return course(`REQ${index}`, name, units);
    });
    const selected = [...four(), lab("EB20001", "other"), course("1200011", "学士基盤", 1), course("XX00001", "関連", 43)];
    selected[4].unit = 36;
    const baseline = checkGraduation([...required, ...selected], "biology-24");
    expect(baseline.summary).toMatchObject({ earnedUnits: 124, isSatisfied: true });
    delete selected[0].catalogInstructionMethod;
    const unknown = checkGraduation([...required, ...selected], "biology-24");
    expect(unknown.summary).toMatchObject({ earnedUnits: 124, shortageUnits: 0, isSatisfied: false });
    expect(unknown.details.requirementItems.find((item) => item.courseCount)?.courseCount?.status).toBe("unknown");
    selected[0].catalogInstructionMethod = "other";
    const missing = checkGraduation([...required, ...selected], "biology-24");
    expect(missing.summary).toMatchObject({ earnedUnits: 124, shortageUnits: 0, isSatisfied: false });
  });
});
