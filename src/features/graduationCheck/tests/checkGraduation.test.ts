import { describe, expect, test } from "vitest";
import { checkGraduation, resolveRequirementIds } from "../tsukuba";
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

  test("情報科学類は入学年度に対応する3主専攻を返す", () => {
    expect(resolveRequirementIds("情報科学類", 2025).sort()).toEqual([
      "coins-im-22",
      "coins-is-22",
      "coins-ss-22",
    ]);
    expect(resolveRequirementIds("情報科学類", 2026).sort()).toEqual([
      "coins-im-26",
      "coins-is-26",
      "coins-ss-26",
    ]);
  });

  test("工学システム学類は2022〜2026年度の2主専攻を返す", () => {
    expect(resolveRequirementIds("工学システム学類", 2022).sort()).toEqual([
      "esys-eme-22",
      "esys-ies-22",
    ]);
    expect(resolveRequirementIds("工学システム学類", 2026).sort()).toEqual([
      "esys-eme-22",
      "esys-ies-22",
    ]);
  });

  test("数学類は2022〜2026年度の要件を返す", () => {
    expect(resolveRequirementIds("数学類", 2022)).toEqual(["math-22"]);
    expect(resolveRequirementIds("数学類", 2026)).toEqual(["math-22"]);
  });

  test("物理学類は2025年度の要件変更を反映する", () => {
    expect(resolveRequirementIds("物理学類", 2024)).toEqual(["physics-22"]);
    expect(resolveRequirementIds("物理学類", 2025)).toEqual(["physics-25"]);
  });

  test("要件データがない学類・年度は空配列", () => {
    expect(resolveRequirementIds("情報科学類", 2021)).toEqual([]);
    expect(resolveRequirementIds("情報メディア創成学類", 2019)).toEqual([]);
    expect(resolveRequirementIds("知識情報・図書館学類", 2025)).toEqual([]);
  });
});

describe("checkGraduation (physics)", () => {
  test("公式表の必修33・選択91・合計124単位を返す", () => {
    for (const id of ["physics-22", "physics-25"] as const) {
      const report = checkGraduation([], id);
      expect(report.categories.map((category) => category.requiredUnits)).toEqual([
        33,
        35,
        25,
        1,
        6,
      ]);
      expect(report.summary.requiredUnits).toBe(124);
    }
  });

  test("2025年度から量子力学群とFCC群の範囲を変更する", () => {
    const before = checkGraduation([], "physics-22").details.selectResults;
    const after = checkGraduation([], "physics-25").details.selectResults;
    const getRule = (results: typeof before, message: string) =>
      results.find((result) => result.message === message);

    expect(getRule(before, "量子力学")).toMatchObject({ minimum: 5, maximum: 11 });
    expect(getRule(after, "量子力学")).toMatchObject({ minimum: 6, maximum: 10 });
    expect(getRule(before, "FCC2〜FCC4")).toMatchObject({ minimum: 23, maximum: 47 });
    expect(getRule(after, "FCC2〜FCC4")).toMatchObject({ minimum: 22, maximum: 48 });
  });

  test("専門4小区分の最低単位をそれぞれ満たして集計する", () => {
    const report = checkGraduation(
      [
        course("X1", "量子力学序論", 6),
        course("X2", "熱物理学", 5),
        course("X3", "専門電磁気学I", 2),
        course("FCC2001", "FCC専門科目", 22),
      ],
      "physics-25"
    );
    const specialized = report.categories.find(
      (category) => category.category === "specialized"
    );

    expect(specialized?.earnedUnits).toBe(35);
  });
});

describe("checkGraduation (math-22)", () => {
  test("公式表の必修32・選択92・合計124単位を返す", () => {
    const report = checkGraduation([], "math-22");

    expect(report.requirement).toMatchObject({
      department: "数学類",
      major: "数学",
      enrollYear: "2022~2026",
    });
    expect(report.categories.map((category) => category.requiredUnits)).toEqual([
      32,
      46,
      15,
      1,
      6,
    ]);
    expect(report.summary.requiredUnits).toBe(124);
  });

  test("微積分・線形代数は指定科目群から各2単位で必修を満たす", () => {
    const report = checkGraduation(
      [
        course("FA00001", "微分積分A", 2),
        course("FA00002", "線形代数1", 1),
        course("FA00003", "線形代数2", 1),
      ],
      "math-22"
    );

    const calculus = report.details.compulsoryResults.find(
      (result) => result.name === "微積分系"
    );
    const linearAlgebra = report.details.compulsoryResults.find(
      (result) => result.name === "線形代数系"
    );
    expect(calculus).toMatchObject({ passed: true, minimumUnit: 2 });
    expect(linearAlgebra).toMatchObject({ passed: true, minimumUnit: 2 });
  });

  test("区分最低単位だけでは合計124単位を満たした扱いにしない", () => {
    const report = checkGraduation(
      [
        course("FB12001", "数学専門", 46),
        course("FBA0001", "数学専門基礎", 15),
        course("1200001", "学士基盤", 1),
        course("GC00001", "関連", 6),
      ],
      "math-22"
    );

    expect(report.summary.earnedUnits).toBe(68);
    expect(report.summary.shortageUnits).toBe(56);
  });
});

describe("checkGraduation (esys-ies-22)", () => {
  test("公式表の必修69・選択56・合計125単位を5区分に展開する", () => {
    const report = checkGraduation([], "esys-ies-22");

    expect(report.requirement).toMatchObject({
      department: "工学システム学類",
      major: "知的・機能工学システム",
      enrollYear: "2022~2026",
    });
    expect(report.categories.map((category) => category.requiredUnits)).toEqual([
      69,
      40,
      0,
      1,
      6,
    ]);
    expect(report.summary.requiredUnits).toBe(125);
  });

  test("専門の小区分最低単位を満たし、概論は関連科目へ分離する", () => {
    const report = checkGraduation(
      [
        course("FG11001", "設計・システム科目", 6),
        course("FG12001", "材料・バイオ科目", 1),
        course("FG13001", "実務系科目", 1),
        course("FG17001", "主専攻科目", 16),
        course("FG99001", "専門選択科目", 16),
        course("FG00001", "工学システム概論", 1),
        course("1200001", "学士基盤科目", 1),
        course("GC10001", "他学類科目", 6),
      ],
      "esys-ies-22"
    );

    const [, specialized, foundation, common, related] = report.categories;
    expect(specialized.earnedUnits).toBe(40);
    expect(foundation.earnedUnits).toBe(0);
    expect(common.earnedUnits).toBe(1);
    expect(related.earnedUnits).toBe(7);

    const introResult = report.details.selectResults.find(
      (result) => result.message === "工学システム概論"
    );
    expect(introResult?.courses.map((item) => item.name)).toEqual([
      "工学システム概論",
    ]);
  });

  test("その他の専門科目だけでは4つの必須小区分を代替できない", () => {
    const report = checkGraduation(
      [course("FG99001", "その他の専門科目", 40)],
      "esys-ies-22"
    );
    const specialized = report.categories.find(
      (category) => category.category === "specialized"
    );

    expect(specialized?.earnedUnits).toBe(16);
  });
});

describe("checkGraduation (coins-ss-22)", () => {
  test("公式表の必修54・選択71・合計125単位を5区分に展開する", () => {
    const report = checkGraduation([], "coins-ss-22");

    expect(report.requirement).toMatchObject({
      department: "情報科学類",
      major: "ソフトウェアサイエンス",
      enrollYear: "2022~2025",
    });
    expect(report.categories.map((category) => category.requiredUnits)).toEqual([
      54,
      34,
      26,
      1,
      6,
    ]);
    expect(report.summary.requiredUnits).toBe(125);
  });

  test("主専攻・専門基礎・共通・関連の科目番号を二重計上せず分類する", () => {
    const report = checkGraduation(
      [
        course("GB20001", "ソフトウェア主専攻科目", 2),
        course("GB13312", "情報特別演習I", 2),
        course("GB11601", "確率論", 2),
        course("GB13614", "Computer Science in English A", 2),
        course("GB15001", "GB1選択", 2),
        course("GA10001", "GA1選択", 2),
        course("1226011", "学士基盤科目", 1),
        course("GC10001", "関連科目", 2),
        course("8000001", "その他の関連科目", 2),
      ],
      "coins-ss-22"
    );

    const [, specialized, foundation, common, related] = report.categories;
    expect(specialized.earnedUnits).toBe(4);
    expect(foundation.earnedUnits).toBe(8);
    expect(common.earnedUnits).toBe(1);
    // 上限4単位の小区分2単位は、必須小区分の最低6単位を代替しない。
    expect(related.earnedUnits).toBe(2);

    const countedIds = report.details.selectResults.flatMap((result) =>
      result.courses.map((item) => item.id)
    );
    expect(new Set(countedIds).size).toBe(countedIds.length);
  });

  test("主専攻外の専門科目は18単位の上限を超えて主専攻16単位を代替できない", () => {
    const courses = Array.from({ length: 20 }, (_, index) =>
      course(`GB3${String(index).padStart(4, "0")}`, `他主専攻${index}`, 2)
    );
    const report = checkGraduation(courses, "coins-ss-22");
    const specialized = report.categories.find(
      (category) => category.category === "specialized"
    );

    expect(specialized?.earnedUnits).toBe(18);
  });

  test("専門基礎はGA1の過剰単位で他の必須小区分を代替できない", () => {
    const courses = Array.from({ length: 13 }, (_, index) =>
      course(`GA1${String(index).padStart(4, "0")}`, `GA1科目${index}`, 2)
    );
    const report = checkGraduation(courses, "coins-ss-22");
    const foundation = report.categories.find(
      (category) => category.category === "specializedFoundation"
    );

    // GA1必須8単位 + 小区分間の自由分4単位までが進捗になる。
    expect(foundation?.earnedUnits).toBe(12);
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
