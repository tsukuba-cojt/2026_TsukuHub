import { expect, test } from "vitest";
import { collectCategoryCourses } from "../categoryCourses";
import { checkGraduation } from "../checkGraduation";
import { resolveRequirementId } from "../data/supportedDepartments";
import { course } from "./helpers";

const majors = ["esys-ies", "esys-eme"];
test("2主専攻・4年度の125単位と専門小区分を保持し、2024からの英語番号制限を分ける", () => {
  for (const major of majors) for (const year of [2023, 2024, 2025, 2026]) {
    const id = resolveRequirementId("esys", major, year)!;
    expect(id).toBe(`${major}-${year === 2023 ? 23 : 24}`);
    const report = checkGraduation([], id);
    expect(report.categories.map((c) => c.requiredUnits)).toEqual([69, 40, 0, 1, 6]);
    expect(report.summary.requiredUnits).toBe(125);
    expect(report.details.selectResults.slice(0, 4).map((r) => r.minimum)).toEqual(major === "esys-ies" ? [6, 1, 1, 16] : [1, 1, 1, 23]);
  }
});

test("FJ指定一覧とエネメカ建築士対象一覧の欠損を広いprefixで充足扱いにせず未分類へ残す", () => {
  for (const major of majors) {
    const input = [course("FJ20004", "指定確認前のFJ", 2), course("FH60001", "社会工学", 2),
      course("YA10001", "芸術基礎", 2), course("YBA0001", "芸術専門", 2)];
    const report = checkGraduation(input, resolveRequirementId("esys", major, 2026)!);
    expect(collectCategoryCourses(report).specialized).toEqual([]);
    expect(report.details.uncountedCourses).toEqual(major === "esys-eme" ? input : input.slice(0, 1));
    if (major === "esys-ies") expect(collectCategoryCourses(report).related).toEqual(input.slice(1));
  }
});

test("卒研をFGに限定し、専門英語の2023と2024以降の番号差を保持する", () => {
  const other = course("GC48708", "卒業研究A", 3);
  const own = course("FG19208", "卒業研究A", 4);
  const report = checkGraduation([other, own], resolveRequirementId("esys", "esys-ies", 2026)!);
  expect(collectCategoryCourses(report).compulsory).toEqual([own]);
  for (const [major, oldCode, modernCode] of [["esys-ies", "FG30222", "FG20222"], ["esys-eme", "FG50222", "FG40222"]]) {
    const old = course(oldCode, "専門英語B", 1);
    expect(collectCategoryCourses(checkGraduation([old], resolveRequirementId("esys", major, 2023)!)).compulsory).toEqual([old]);
    expect(collectCategoryCourses(checkGraduation([old], resolveRequirementId("esys", major, 2024)!)).compulsory).toEqual([]);
    const modern = course(modernCode, "専門英語B", 1);
    expect(collectCategoryCourses(checkGraduation([modern], resolveRequirementId("esys", major, 2024)!)).compulsory).toEqual([modern]);
  }
});

test("特設8の未記載例外を他学群最低6へ混入させず、詳細不足を5分類へ混ぜない", () => {
  const id = resolveRequirementId("esys", "esys-ies", 2025)!;
  const special = course("8049911", "特設自由科目", 6);
  const report = checkGraduation([special], id);
  expect(report.categories[4].isSatisfied).toBe(false);
  expect(report.details.selectResults.find((r) => r.message === "資格・特設自由科目")?.courses).toEqual([special]);
  expect(checkGraduation([special], id, undefined, "five-category").categories[4])
    .toMatchObject({ earnedUnits: 6, isSatisfied: true });
  expect(checkGraduation([special, course("BA20001", "他学群", 6)], id).categories[4].isSatisfied).toBe(true);
  expect(checkGraduation([course("FBA1461", "注9除外", 6)], id).details.uncountedCourses).toHaveLength(1);
  expect(collectCategoryCourses(checkGraduation([course("FG16051", "工学システム概論", 1)], id)).related).toHaveLength(1);
});

test("必修69の履修例と専門49・共通10・関連15上限、各小区分の1単位不足を確認する", () => {
  for (const major of majors) {
    const id = resolveRequirementId("esys", major, 2026)!;
    const ies = major === "esys-ies";
    const minima = ies ? [6, 1, 1, 16] : [1, 1, 1, 23];
    const input = [course("FG11001", "設計", minima[0]), course("FG12001", "材料", minima[1]),
      course("FG13001", "実務", minima[2]), course("FG17001", "主専攻", minima[3]),
      course("FG99001", "その他専門", 40 - minima.reduce((a, b) => a + b, 0))];
    expect(checkGraduation(input, id).categories[1].isSatisfied).toBe(true);
    const shortage = [{ ...input[0], unit: input[0].unit - 1 }, ...input.slice(1), course("FG99002", "追加その他", 1)];
    expect(checkGraduation(shortage, id).categories[1].isSatisfied).toBe(false);
    expect(checkGraduation(shortage, id, undefined, "five-category").categories[1].isSatisfied).toBe(true);
    const excess = checkGraduation([course("FG99001", "専門", 70), course("1200011", "学士基盤", 20), course("BA20001", "他学群", 30)], id, undefined, "five-category");
    expect(excess.categories.slice(1).map((c) => c.earnedUnits)).toEqual([49, 0, 10, 15]);
  }
  const oneUnit = ["数学リテラシー1", "数学リテラシー2", "線形代数1", "線形代数2", "線形代数3", "微積分1", "微積分2", "微積分3",
    "力学1", "力学2", "力学3", "電磁気学1", "電磁気学2", "電磁気学3", "工学システム原論", "線形代数総論A", "解析学総論",
    "力学総論", "電磁気学総論", "材料力学基礎", "熱力学基礎", "流体力学基礎", "プログラミング序論B"];
  const required = [...oneUnit.map((name, i) => course(`FA00${i}`, name, 1)),
    ...["線形代数総論B", "常微分方程式", "複素解析", "プログラミング序論A"].map((name, i) => course(`FG00${i}`, name, 2)),
    course("FG20174", "プログラミング序論C", 2), course("FG20164", "プログラミング序論D", 1),
    course("FG19103", "工学システム基礎実験A", 2), course("FG19113", "工学システム基礎実験B", 2), course("FG29213", "知的・機能工学システム実験", 6),
    course("FG19208", "卒業研究A", 4), course("FG19218", "卒業研究B", 4), course("FG18001", "工学者のための倫理", 1),
    course("FG18102", "専門英語A", 1), course("FG20222", "専門英語B", 1), course("FG20232", "専門英語演習", 1),
    course("1100011", "ファーストイヤーセミナー", 1), course("1100021", "学問への誘い", 1), course("2100011", "体育", 3),
    course("31H0011", "英語", 4), course("6100011", "情報", 4)];
  const report = checkGraduation([...required, course("FG99001", "専門", 49), course("1200011", "学士基盤", 1), course("BA20001", "他学群", 6)],
    resolveRequirementId("esys", "esys-ies", 2026)!, undefined, "five-category");
  expect(report.categories.map((c) => c.earnedUnits)).toEqual([69, 49, 0, 1, 6]);
  expect(report.summary).toMatchObject({ earnedUnits: 125, shortageUnits: 0, isSatisfied: true });
});
