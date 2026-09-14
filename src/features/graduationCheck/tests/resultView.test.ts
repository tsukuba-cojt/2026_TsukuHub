import { describe, expect, test } from "vitest";
import { checkGraduation } from "../checkGraduation";
import {
  categoryChildItems,
  categoryMapItems,
  compulsoryCheckItems,
  compulsoryGroupItems,
  prospectiveMessage,
  remainingCompulsoryItems,
  remainingCreditItems,
  selectSubgroups,
  visibleSelectSubgroups,
} from "../resultView";
import { course } from "./helpers";

describe("resultView (mast-22)", () => {
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

  test("不足の選択区分だけをのこっているものに出す", () => {
    const remaining = remainingCreditItems(report);
    expect(remaining.map((item) => item.label)).toEqual([
      "選択科目（専門）",
      "選択科目（専門基礎）",
      "選択科目（関連）",
    ]);
    expect(remaining[0]).toMatchObject({
      shortageUnits: 18,
      projected: false,
    });
  });

  test("必修チェックは確定合格と履修中・未履修を分ける", () => {
    const items = compulsoryCheckItems(report);
    expect(items.find((item) => item.name === "卒業研究A")?.status).toBe(
      "passed"
    );
    expect(items.find((item) => item.name === "卒業研究B")?.status).toBe(
      "notTaken"
    );
    expect(items.find((item) => item.name === "確率と統計")?.status).toBe(
      "failed"
    );
    expect(items.find((item) => item.name === "情報")?.status).toBe("passed");
  });

  test("未充足の必修だけを残りリストに出す", () => {
    const remaining = remainingCompulsoryItems(report);
    expect(remaining.some((item) => item.name === "卒業研究A")).toBe(false);
    expect(remaining.some((item) => item.name === "卒業研究B")).toBe(true);
    expect(remaining.find((item) => item.name === "確率と統計")?.status).toBe(
      "failed"
    );
  });

  test("区分マップの状態", () => {
    const map = Object.fromEntries(
      categoryMapItems(report).map((item) => [item.category, item.status])
    );
    expect(map.compulsory).toBe("unmet");
    expect(map.common).toBe("fulfilled");
    expect(map.specialized).toBe("unmet");
  });

  test("見込み残りがあるときの文言", () => {
    expect(prospectiveMessage(report)).toBe(
      "いま履修中の科目をすべて修得しても、あと104単位が必要です。"
    );
  });

  test("共通区分の小グループを selectResults から出す", () => {
    const groups = selectSubgroups(report, "common");
    expect(groups.some((group) => group.label === "学士基盤科目")).toBe(true);
    const foundation = groups.find((group) => group.label === "学士基盤科目");
    expect(foundation).toMatchObject({
      minimum: 1,
      earnedUnits: 1,
      capped: false,
    });
  });

  test("必修の単位グループだけをバー用に出す", () => {
    const groups = compulsoryGroupItems(report);
    expect(groups.map((item) => item.label)).toEqual([
      "情報",
      "体育",
      "必修英語",
    ]);
    expect(groups[0]).toMatchObject({
      label: "情報",
      earnedUnits: 4,
      requiredUnits: 4,
      percent: 100,
    });
    expect(groups[1]).toMatchObject({
      label: "体育",
      earnedUnits: 0,
      requiredUnits: 2,
      percent: 0,
    });
  });

  test("親と同じ min/max の選択1件は子バーに出さない", () => {
    expect(visibleSelectSubgroups(report, "specialized")).toEqual([]);
    expect(visibleSelectSubgroups(report, "specializedFoundation")).toEqual([]);
    const common = visibleSelectSubgroups(report, "common");
    expect(common.map((item) => item.label)).toEqual([
      "学士基盤科目",
      "体育",
      "外国語",
      "国語",
      "芸術",
    ]);
    expect(common[0]).toMatchObject({
      earnedUnits: 1,
      requiredUnits: 1,
      percent: 100,
    });
    expect(common.find((item) => item.label === "体育")).toMatchObject({
      earnedUnits: 0,
      requiredUnits: 2,
      percent: 100,
    });
  });

  test("区分ごとの子バー", () => {
    expect(categoryChildItems(report, "compulsory").map((item) => item.label)).toEqual(
      ["情報", "体育", "必修英語"]
    );
    expect(categoryChildItems(report, "specialized")).toEqual([]);
  });
});

describe("resultView (coins-ss-22)", () => {
  const report = checkGraduation([], "coins-ss-22");

  test("親と min/max が違う小区分が複数ある専門は子バーに出す", () => {
    expect(
      visibleSelectSubgroups(report, "specialized").map((item) => item.label)
    ).toEqual([
      "ソフトウェアサイエンス主専攻科目",
      "情報科学類専門科目・特別演習",
    ]);
    expect(visibleSelectSubgroups(report, "specializedFoundation")).toHaveLength(
      4
    );
  });
});
