import { describe, expect, test } from "vitest";
import { checkGraduation, resolveRequirementIds } from "../checkGraduation";
import { course } from "./helpers";

describe("resolveRequirementIds", () => {
  test("学類名と入学年度から要件データのキーを引く", () => {
    expect(resolveRequirementIds("情報メディア創成学類", 2021)).toEqual([
      "mast-21",
    ]);
    // 2022〜2024年度入学は同一要件
    expect(resolveRequirementIds("情報メディア創成学類", "2023")).toEqual([
      "mast-22",
    ]);
    expect(resolveRequirementIds("情報メディア創成学類", 2025)).toEqual([
      "mast-25",
    ]);
  });

  test("主専攻で要件が分かれる学類は候補を複数返す（表記ゆれも吸収）", () => {
    const ids = resolveRequirementIds("知識情報・図書館学類", 2022);
    expect(ids.sort()).toEqual(["klis-irm-22", "klis-kis-22", "klis-ksc-22"]);
  });

  test("要件データがない学類・年度は空配列", () => {
    expect(resolveRequirementIds("情報科学類", 2023)).toEqual([]);
    expect(resolveRequirementIds("情報メディア創成学類", 2019)).toEqual([]);
    expect(resolveRequirementIds("知識情報・図書館学類", 2025)).toEqual([]);
  });
});

describe("checkGraduation (mast-22 E2E)", () => {
  // 必修: 卒業研究A(3,A+) + 微分積分Aの代替(微積分1/2 各1) + 情報::4(6単位→4でキャップ)
  //       + 確率と統計(D→0単位) = 確定9単位
  // 選択: g0 専門 GC5=2確定+2履修中 / g1 専門基礎 GA1=2 / g2 共通 学士基盤=1
  //       / g3 関連 GB=2 + 除外要件(8始まり)=2
  const courses = [
    course("GC00001", "卒業研究A", 3, "A+"),
    course("Y1", "微積分1", 1, "A"),
    course("Y2", "微積分2", 1, "B"),
    course("6100101", "情報リテラシー", 2, "A"),
    course("6100202", "データサイエンス", 2, "B"),
    course("6100303", "プログラミング基礎", 2, "A"),
    course("GC00002", "確率と統計", 2, "D"),
    course("GC51234", "専門選択の科目", 2, "A"),
    course("GC59999", "履修中の専門科目", 2, "履修中"),
    course("GA12345", "専門基礎の科目", 2, "B"),
    course("1226011", "学士基盤の科目", 1, "C"),
    course("GB12345", "関連の科目", 2, "A"),
    course("8001234", "自由科目", 2, "A"),
  ];
  const report = checkGraduation(courses, "mast-22");

  test("要件データの情報を返す", () => {
    expect(report.requirement).toMatchObject({
      id: "mast-22",
      department: "情報メディア創成学類",
      enrollYear: "2022~2024",
    });
  });

  test("5区分を必修→専門→専門基礎→共通→関連の順で返す", () => {
    expect(report.categories.map((c) => c.category)).toEqual([
      "compulsory",
      "specialized",
      "specializedFoundation",
      "common",
      "related",
    ]);
    expect(report.categories.map((c) => c.label)).toEqual([
      "必修科目",
      "選択科目（専門）",
      "選択科目（専門基礎）",
      "選択科目（共通）",
      "選択科目（関連）",
    ]);
  });

  test("区分別の必要・取得・割合（確定と見込み）", () => {
    const [compulsory, specialized, foundation, common, related] =
      report.categories;

    expect(compulsory).toMatchObject({ requiredUnits: 50, earnedUnits: 9 });
    expect(compulsory.percent).toBeCloseTo(18, 10);

    // 専門: 確定2 / 履修中込み4。必要20・上限35
    expect(specialized).toMatchObject({
      requiredUnits: 20,
      maxUnits: 35,
      earnedUnits: 2,
      prospectiveUnits: 4,
    });
    expect(specialized.percent).toBeCloseTo(10, 10);
    expect(specialized.prospectivePercent).toBeCloseTo(20, 10);

    expect(foundation).toMatchObject({ requiredUnits: 32, earnedUnits: 2 });

    // 共通: 必要1に対して1取得 → 100%（クランプ値も100）
    expect(common).toMatchObject({ requiredUnits: 1, earnedUnits: 1 });
    expect(common.percentClamped).toBe(100);

    // 関連: GB 2単位 + 除外要件マッチ 2単位 = 4
    expect(related).toMatchObject({ requiredUnits: 6, earnedUnits: 4 });
  });

  test("全体サマリー: 必要124・確定18・見込み20・不足単位", () => {
    expect(report.summary.requiredUnits).toBe(124); // 必修50 + 選択74
    expect(report.summary.earnedUnits).toBe(18);
    expect(report.summary.prospectiveUnits).toBe(20);
    expect(report.summary.shortageUnits).toBe(106);
    expect(report.summary.prospectiveShortageUnits).toBe(104);
    expect(report.summary.percent).toBeCloseTo((18 / 124) * 100, 10);
  });

  test("GPAとA率（D/F/P/認/履修中の扱い）", () => {
    // GPA対象: A+3 A11 B5 C1 D2 = 22単位, ポイント 73.9
    expect(report.gpa.targetUnits).toBe(22);
    expect(report.gpa.value).toBeCloseTo(73.9 / 22, 10);
    expect(report.gpa.max).toBe(4.3);
    // A率: (A+ 3 + A 11) / (A+ A B C = 20単位) = 70%
    expect(report.gpa.aRatePercent).toBeCloseTo(70, 10);
  });

  test("必修と選択で同じ科目を二重計上しない", () => {
    const countedIds = [
      ...report.details.compulsoryResults.flatMap((r) =>
        r.courses.map((c) => c.id)
      ),
      ...report.details.selectResults.flatMap((r) =>
        r.courses.map((c) => c.id)
      ),
      ...report.details.uncountedCourses.map((c) => c.id),
    ];
    expect(countedIds.sort()).toEqual(courses.map((c) => c.id).sort());
  });

  test("取得単位が上限を超えた区分は earnedUnits がキャップされ、実割合はUI側でクランプできる", () => {
    // 共通グループ(必要1・上限10)に 学士基盤4+外国語4+国語4=12単位分投入
    // → 上限10でキャップ、割合は1000%/クランプ100%
    const overflowReport = checkGraduation(
      [
        course("1226011", "学士基盤1", 1, "A"),
        course("1226012", "学士基盤2", 1, "A"),
        course("1226013", "学士基盤3", 1, "A"),
        course("1226014", "学士基盤4", 1, "A"),
        course("3100001", "外国語1", 2, "A"),
        course("3100002", "外国語2", 2, "A"),
        course("5100001", "国語1", 2, "A"),
        course("5100002", "国語2", 2, "A"),
      ],
      "mast-22"
    );
    const common = overflowReport.categories.find(
      (c) => c.category === "common"
    );
    expect(common?.earnedUnits).toBe(10); // グループ上限10でキャップ
    expect(common?.percent).toBeCloseTo(1000, 10);
    expect(common?.percentClamped).toBe(100);
  });
});
