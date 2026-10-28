import { describe, expect, test } from "vitest";
import { checkGraduation } from "../checkGraduation";
import { course } from "./helpers";

const requirementItem = (
  report: ReturnType<typeof checkGraduation>,
  label: string,
) => report.details.requirementItems.find((item) => item.label === label);

describe("社会学類の卒業要件", () => {
  test("社会学主専攻は実習・演習12単位のうち社会学演習6単位を要求する", () => {
    const satisfied = checkGraduation(
      [
        course("BB16132", "社会学演習Ia", 6),
        course("BB19133", "社会調査実習Ia", 6),
      ],
      "social-sociology-23",
    );

    expect(requirementItem(satisfied, "社会調査実習・社会学演習（内数）")).toMatchObject({
      earnedUnits: 12,
      minimumUnits: 12,
      isSatisfied: true,
    });
    expect(requirementItem(satisfied, "社会学演習（内数）")).toMatchObject({
      earnedUnits: 6,
      minimumUnits: 6,
      isSatisfied: true,
    });

    const practicalOnly = checkGraduation(
      [course("BB19133", "社会調査実習Ia", 12)],
      "social-sociology-23",
    );
    expect(requirementItem(practicalOnly, "社会学演習（内数）")).toMatchObject({
      earnedUnits: 0,
      isSatisfied: false,
    });
  });

  test("法学主専攻は指定4科目4単位とBB2演習6単位を別々に要求する", () => {
    const report = checkGraduation(
      [
        course("BB22001", "憲法I", 2),
        course("BB22031", "憲法II", 2),
        course("BB29002", "憲法演習I", 2),
        course("BB29112", "刑法演習I", 2),
        course("BB29362", "民法演習III", 2),
      ],
      "social-law-23",
    );

    expect(requirementItem(report, "憲法I・II、民法総則、刑法総論（内数）")).toMatchObject({
      earnedUnits: 4,
      isSatisfied: true,
    });
    expect(requirementItem(report, "BB2の演習科目（内数）")).toMatchObject({
      earnedUnits: 6,
      isSatisfied: true,
    });
    expect(requirementItem(report, "指定された他学類科目")).toMatchObject({
      minimumUnits: 0,
      maximumUnits: 10,
    });
  });

  test("他主専攻の概論科目は専門ではなく専門基礎へ分類する", () => {
    const report = checkGraduation(
      [course("BB11011", "社会学基礎論", 2)],
      "social-law-23",
    );

    expect(requirementItem(report, "他主専攻の概論・基礎論（6科目）")).toMatchObject({
      earnedUnits: 2,
    });
    expect(requirementItem(report, "他主専攻科目")).toMatchObject({
      earnedUnits: 0,
    });
  });

  test("経済学主専攻は指定されたBC・FHだけを専門科目に含める", () => {
    const report = checkGraduation(
      [
        course("BC11861", "ミクロ経済学", 2),
        course("BC99999", "無関係な他学類科目", 2),
      ],
      "social-economics-23",
    );

    expect(requirementItem(report, "経済学主専攻科目等（BC・FHは別途指定科目のみ）")).toMatchObject({
      earnedUnits: 2,
    });
    expect(requirementItem(report, "A・BC・C・H・W・Y・V・8・99で始まる関連科目")).toMatchObject({
      earnedUnits: 2,
    });
  });

  test("経済学主専攻は指定3科目4単位と演習8単位を要求する", () => {
    const report = checkGraduation(
      [
        course("BB41131", "ミクロ経済学", 2),
        course("BB41141", "マクロ経済学", 2),
        course("BB45382", "経済学演習III-2春", 4),
        course("BB45782", "経済学演習VII-2春", 4),
      ],
      "social-economics-23",
    );

    expect(requirementItem(report, "ミクロ・マクロ経済学、経済統計論（内数）")).toMatchObject({
      earnedUnits: 4,
      isSatisfied: true,
    });
    expect(requirementItem(report, "経済学演習（内数）")).toMatchObject({
      earnedUnits: 8,
      isSatisfied: true,
    });
  });

  test("専門基礎の3区分とBA・BE関連科目枠を独立して表示する", () => {
    const report = checkGraduation([], "social-politics-23");
    const labels = report.details.requirementItems.map((item) => item.label);

    expect(labels).toEqual(expect.arrayContaining([
      "他主専攻の概論・基礎論（6科目）",
      "社会学類4主専攻の最前線科目",
      "社会学類4主専攻の最前線チュートリアル",
      "社会学類の専門基礎指定を除くBA・BE科目",
    ]));
  });
});
