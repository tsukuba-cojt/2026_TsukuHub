import { describe, expect, test } from "vitest";
import { creditCapForecast } from "../creditCap";
import { course } from "./helpers";

describe("creditCapForecast", () => {
  test("対応外の学類は unsupported", () => {
    const forecast = creditCapForecast(
      [course("GC00001", "専門", 2, "A", 2026)],
      "人文学類"
    );
    expect(forecast.state).toBe("unsupported");
    expect(forecast.rule).toBeNull();
  });

  test("情報メディア創成: 前年度40単位かつ申請単位の60%がA+/Aなら locked", () => {
    const earned = Array.from({ length: 20 }, (_, index) =>
      course(`GC5${String(index).padStart(4, "0")}`, `科目${index}`, 2, "A", 2026)
    );
    const forecast = creditCapForecast(earned, "情報メディア創成学類");
    expect(forecast.state).toBe("locked");
    expect(forecast.targetYear).toBe(2026);
    expect(forecast.rule?.releasedCap).toBe(55);
  });

  test("見込みで40単位に届かない場合は unmet と不足単位", () => {
    const courses = [
      ...Array.from({ length: 10 }, (_, index) =>
        course(`GC5${String(index).padStart(4, "0")}`, `科目${index}`, 2, "A", 2026)
      ),
      course("GC59999", "履修中", 2, "履修中", 2026),
    ];
    const forecast = creditCapForecast(courses, "情報メディア創成学類");
    expect(forecast.state).toBe("unmet");
    expect(forecast.minCreditsShort).toBe(18);
  });

  test("履修中をA+/Aにすれば届く場合は inReach", () => {
    const earned = Array.from({ length: 10 }, (_, index) =>
      course(`GC5${String(index).padStart(4, "0")}`, `A科目${index}`, 2, "A", 2026)
    );
    const bees = Array.from({ length: 8 }, (_, index) =>
      course(`GC2${String(index).padStart(4, "0")}`, `B科目${index}`, 2, "B", 2026)
    );
    const taking = [
      course("GC59990", "履修中1", 2, "履修中", 2026),
      course("GC59991", "履修中2", 2, "履修中", 2026),
    ];
    // 確定: A 20 + B 16 = 36。申請分母40、分子20 → 50%。修得36 < 40。
    // 履修中4をAにすると分子24/40=60%、見込み40単位。
    const forecast = creditCapForecast(
      [...earned, ...bees, ...taking],
      "情報メディア創成学類"
    );
    expect(forecast.state).toBe("inReach");
    expect(forecast.aNeededCourses).toBe(2);
  });

  test("教職科目は分母から外す", () => {
    const earned = Array.from({ length: 20 }, (_, index) =>
      course(`GC5${String(index).padStart(4, "0")}`, `科目${index}`, 2, "A", 2026)
    );
    const teaching = course("9100001", "教職科目", 20, "C", 2026);
    const forecast = creditCapForecast(
      [...earned, teaching],
      "情報メディア創成学類"
    );
    expect(forecast.state).toBe("locked");
  });

  test("認は対象年度の集計から除外する", () => {
    const forecast = creditCapForecast(
      [course("", "検定", 10, "認", 2026)],
      "情報メディア創成学類"
    );
    expect(forecast.state).toBe("unknown");
  });
});
