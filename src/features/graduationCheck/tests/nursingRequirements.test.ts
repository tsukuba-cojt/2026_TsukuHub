import { describe, expect, test } from "vitest";
import { checkGraduation } from "../checkGraduation";
import { gradRequirementData } from "../data/gradRequirementData";
import { resolveRequirementId } from "../data/supportedDepartments";
import { course } from "./helpers";

describe("看護学類の卒業要件", () => {
  test("関連科目の改訂と2026年度の科目名変更を別ルール版にする", () => {
    expect(resolveRequirementId("nursing", "nursing", 2024)).toBe("nursing-22");
    expect(resolveRequirementId("nursing", "nursing", 2025)).toBe("nursing-25");
    expect(resolveRequirementId("nursing", "nursing", 2026)).toBe("nursing-26");
    expect(resolveRequirementId("nursing", "public-health-nursing", 2026)).toBe(
      "public-health-nursing-26",
    );
  });

  test("公式表の専門・専門基礎必修を省略せず保持する", () => {
    const compulsory = gradRequirementData["nursing-25"].courses.compulsory;

    expect(compulsory).toEqual(
      expect.arrayContaining([
        "看護技術実習",
        "臨床看護学実習(クリティカルケア)",
        "地域・在宅看護論実習",
        "精神看護学実習",
        "看護学探究演習",
        "保健医療福祉行政論II",
        "医療・生命科学とテクノロジー",
      ]),
    );
  });

  test("保健師課程は看護学探究演習に代えて保健師科目15単位を要求する", () => {
    const nursing = gradRequirementData["nursing-25"].courses.compulsory;
    const publicHealth =
      gradRequirementData["public-health-nursing-25"].courses.compulsory;

    expect(nursing).toContain("看護学探究演習");
    expect(publicHealth).not.toContain("看護学探究演習");
    expect(publicHealth).toEqual(
      expect.arrayContaining([
        "公衆衛生看護活動論",
        "公衆衛生看護活動方法論",
        "公衆衛生看護学応用論",
        "公衆衛生看護管理論",
        "公衆衛生看護学実習",
      ]),
    );
  });

  test("専門基礎選択は指定科目名だけを数える", () => {
    const report = checkGraduation(
      [
        course("HC22101", "医療経済学", 1, "A", 2025),
        course("HE99999", "指定外の医療系科目", 2, "A", 2025),
      ],
      "nursing-25",
    );
    const foundation = report.details.requirementItems.find(
      (item) => item.label === "看護学類が指定する専門基礎科目",
    );

    expect(foundation).toMatchObject({ earnedUnits: 1, isSatisfied: true });
    expect(foundation?.courses.map((item) => item.name)).toEqual(["医療経済学"]);
  });

  test("2022〜2024年度の限定関連科目と2025年度以降の他学類科目を区別する", () => {
    const unrelated = course("HC99999", "看護学類の選択科目", 4, "A", 2025);
    const otherDepartment = course("HE99999", "医療科学類の科目", 4, "A", 2025);
    const oldSpecified = course("CC99999", "心理学類の科目", 4, "A", 2024);

    const oldReport = checkGraduation([oldSpecified], "nursing-22");
    const modernReport = checkGraduation(
      [unrelated, otherDepartment],
      "nursing-25",
    );

    expect(
      oldReport.details.requirementItems.find(
        (item) => item.label === "指定された他学類等の関連科目",
      ),
    ).toMatchObject({ earnedUnits: 4, isSatisfied: true });
    expect(
      modernReport.details.requirementItems.find(
        (item) => item.label === "他学類が開設する関連科目",
      ),
    ).toMatchObject({ earnedUnits: 4, isSatisfied: true, courses: [otherDepartment] });
  });

  test("2026年度だけ子どもの発達支援実習の半角括弧表記を使用する", () => {
    expect(gradRequirementData["nursing-25"].courses.compulsory).toContain(
      "子どもの発達支援実習（病院実習）",
    );
    expect(gradRequirementData["nursing-26"].courses.compulsory).toContain(
      "子どもの発達支援実習(病院実習)",
    );
  });
});
