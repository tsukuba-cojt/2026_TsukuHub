import { describe, expect, test } from "vitest";
import { checkGraduation } from "../checkGraduation";
import { gradRequirementData } from "../data/gradRequirementData";
import { resolveRequirementId } from "../data/supportedDepartments";
import { course } from "./helpers";

describe("医療科学類の卒業要件", () => {
  test("専門選択表が変わった2024〜2026年度を別ルール版へ割り当てる", () => {
    expect(resolveRequirementId("medical-science", "medical-science", 2023)).toBe(
      "medical-science-22",
    );
    expect(resolveRequirementId("medical-science", "medical-science", 2024)).toBe(
      "medical-science-24",
    );
    expect(resolveRequirementId("medical-science", "medical-science", 2026)).toBe(
      "medical-science-26",
    );
    expect(
      resolveRequirementId("medical-science", "international-medical-science", 2024),
    ).toBe("international-medical-science-24");
  });

  test("年度別の専門選択科目差を混在させない", () => {
    const oldRule = gradRequirementData["medical-science-22"].courses.select[0][6];
    const rule2024 = gradRequirementData["medical-science-24"].courses.select[0][6];
    const modernRule = gradRequirementData["medical-science-25"].courses.select[0][6];
    const rule2026 = gradRequirementData["medical-science-26"].courses.select[0][6];

    expect(oldRule?.includeCourseNames).not.toContain(
      "自己免疫疾患・アレルギー疾患の病態と臨床",
    );
    expect(rule2024?.includeCourseNames).toContain("多職種連携医療学概論");
    expect(rule2024?.includeCourseNames).not.toContain("ケア・コロキウム");
    expect(modernRule?.includeCourseNames).toContain("ケア・コロキウム");
    expect(modernRule?.includeCourseNames).toContain("法医学概論");
    expect(modernRule?.includeCourseNames).not.toContain("多職種連携医療学概論");
    expect(modernRule?.includeCourseNames).not.toContain("発生工学と再生医療");
    expect(rule2026?.includeCourseNames).toContain("発生工学と再生医療");
  });

  test("医療科学主専攻の専門70・専門基礎25単位の必修行を省略しない", () => {
    const requirement = gradRequirementData["medical-science-22"];

    expect(requirement.courses.compulsorySumUnit).toBe(109);
    expect(requirement.courses.compulsory).toEqual(
      expect.arrayContaining([
        "細胞検査学",
        "病原微生物学実習II",
        "画像検査学",
        "医学検査学フロンティア",
        "臨床実習",
        "人体構造学実習",
        "微生物学実習",
        "医科学英語論文講読の基礎",
        "科学実験の基礎",
        "医療科学キャリアセミナー",
      ]),
    );
    expect(requirement.courses.compulsory).not.toContain("臨床病理学実習I");
    expect(requirement.courses.compulsory).not.toContain("病棟実習");
    expect(requirement.courses.compulsory).not.toContain("国語::1");
  });

  test("医療科学主専攻の選択は公式表の指定科目名だけを数える", () => {
    const report = checkGraduation(
      [
        course("HE36211", "検査医学とスポーツ医学の密接な接点", 1, "A", 2026),
        course("HE99999", "公式表にないHE科目", 5, "A", 2026),
        course("HE22031", "実践英語(TOEFL対策)", 1, "A", 2026),
        course("FA99999", "公式表にないFA科目", 4, "A", 2026),
      ],
      "medical-science-25",
    );

    expect(
      report.details.requirementItems.find(
        (item) => item.label === "公式表で指定された専門選択科目",
      ),
    ).toMatchObject({ earnedUnits: 1, isSatisfied: false });
    expect(
      report.details.requirementItems.find(
        (item) => item.label === "公式表で指定された専門基礎選択科目",
      ),
    ).toMatchObject({ earnedUnits: 1, isSatisfied: false });
  });

  test("関連科目はE・F・G・H系3単位とそれ以外3単位を別々に要求する", () => {
    const report = checkGraduation(
      [
        course("A999991", "A系の他学群科目", 3, "A", 2026),
        course("E999991", "E系の他学群科目", 3, "A", 2026),
      ],
      "medical-science-22",
    );
    const related = report.details.requirementItems.filter(
      (item) => item.category === "related",
    );

    expect(related.map((item) => item.earnedUnits)).toEqual([3, 3]);
    expect(related.map((item) => item.isSatisfied)).toEqual([true, true]);
  });

  test("国際医療科学主専攻の旧誤記を公式表の必修名へ修正する", () => {
    const compulsory =
      gradRequirementData["international-medical-science-22"].courses.compulsory;

    expect(compulsory).toEqual(
      expect.arrayContaining([
        "健幸医科学グループワーク",
        "医科学演習",
        "医科学英語論文講読の基礎",
        "医療科学キャリアセミナー",
      ]),
    );
    expect(compulsory).not.toContain("健康科学グループワーク");
    expect(compulsory).not.toContain("臨床病理学演習");
    expect(compulsory).not.toContain("医療科学演習I");
    expect(compulsory).not.toContain("先端医科学英語演習基礎");
  });

  test("国際医療科学の専門選択へ必修科目を二重計上しない", () => {
    const report = checkGraduation(
      [
        course("HE40102", "医科学演習", 1, "A", 2026),
        course("HE30001", "臨床病態学", 2, "A", 2026),
      ],
      "international-medical-science-22",
    );
    const specialized = report.details.requirementItems.find(
      (item) => item.label === "国際医療科学主専攻の専門選択科目",
    );

    expect(specialized?.courses.map((item) => item.name)).toEqual(["臨床病態学"]);
  });
});
