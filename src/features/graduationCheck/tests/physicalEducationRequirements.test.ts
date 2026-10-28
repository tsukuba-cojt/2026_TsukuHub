import { describe, expect, test } from "vitest";
import { checkGraduation } from "../checkGraduation";
import { gradRequirementData } from "../data/gradRequirementData";
import { resolveRequirementId } from "../data/supportedDepartments";
import { course } from "./helpers";

describe("体育専門学群の卒業要件", () => {
  test("2026年度の必修変更を別ルール版へ分離する", () => {
    expect(
      resolveRequirementId("physical-education", "physical-education", 2025),
    ).toBe("physical-education-22");
    expect(
      resolveRequirementId("physical-education", "physical-education", 2026),
    ).toBe("physical-education-26");

    const oldRequired = gradRequirementData["physical-education-22"].courses.compulsory;
    const newRequired = gradRequirementData["physical-education-26"].courses.compulsory;
    expect(oldRequired).toEqual(
      expect.arrayContaining([
        "スポーツキャリア形成I",
        "スポーツキャリア形成II",
        "スポーツキャリア形成III",
        "臨海実習",
      ]),
    );
    expect(newRequired).toEqual(
      expect.arrayContaining([
        "スポーツキャリア形成A",
        "スポーツキャリア形成B",
        "体育実技H群::2",
      ]),
    );
    expect(newRequired).not.toContain("スポーツキャリア形成III");
  });

  test("専門科目はW15・W16・W18の個別最低単位を要求する", () => {
    const report = checkGraduation(
      [
        course("W150001", "分野別", 9, "A", 2025),
        course("W160001", "キャリア", 8, "A", 2025),
        course("W180001", "卒業研究領域", 6, "A", 2025),
        course("W190001", "その他専門", 5, "A", 2025),
      ],
      "physical-education-22",
    );

    expect(
      report.details.requirementItems.find(
        (item) => item.label === "体育専門学群の専門科目",
      ),
    ).toMatchObject({ earnedUnits: 28, isSatisfied: true });
    expect(
      report.details.requirementItems.find(
        (item) => item.label === "分野別専門科目",
      ),
    ).toMatchObject({ earnedUnits: 9, isSatisfied: false });
    expect(
      report.categories.find((category) => category.category === "specialized"),
    ).toMatchObject({ isSatisfied: false });
  });

  test("W88と実技A〜G群を他の専門基礎単位で代替できない", () => {
    const report = checkGraduation(
      [
        course("W870001", "体育・スポーツ学", 10, "A", 2025),
        course("W890001", "健康体力学", 10, "A", 2025),
        course("W900001", "W88の代替にならない科目", 4, "A", 2025),
        course("W910001", "A群", 1, "A", 2025),
        course("W920001", "B群", 1, "A", 2025),
        course("W930001", "C群", 1, "A", 2025),
        course("W940001", "D群", 1, "A", 2025),
        course("W950001", "E群", 1, "A", 2025),
        course("W960001", "F群", 1, "A", 2025),
        course("W980001", "G群の代替にならないH群", 1, "A", 2025),
      ],
      "physical-education-22",
    );

    expect(
      report.details.requirementItems.find(
        (item) => item.label === "体育専門学群の専門基礎科目",
      ),
    ).toMatchObject({ earnedUnits: 31, isSatisfied: true });
    expect(
      report.details.requirementItems.find(
        (item) => item.label === "コーチング学領域科目",
      ),
    ).toMatchObject({ earnedUnits: 0, isSatisfied: false });
    expect(
      report.details.requirementItems.find(
        (item) => item.label === "実技理論・実習G群",
      ),
    ).toMatchObject({ earnedUnits: 0, isSatisfied: false });
    expect(
      report.categories.find(
        (category) => category.category === "specializedFoundation",
      ),
    ).toMatchObject({ isSatisfied: false });
  });
});
