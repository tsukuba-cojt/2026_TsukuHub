import { describe, expect, test } from "vitest";
import { getTermUi, osakaTermMatchesModuleRange } from "./termUi";

describe("term UI by university", () => {
  test("Tsukuba keeps ABC modules", () => {
    const ui = getTermUi("tsukuba");
    expect(ui.classModuleFieldLabel).toBe("モジュール");
    expect(ui.classModuleMax).toBe(6);
    expect(ui.timetableLabels.springA).toBe("春A");
    expect(ui.timetableOrder).toContain("springC");
  });

  test("Osaka uses spring/summer/fall/winter labels", () => {
    const ui = getTermUi("osaka");
    expect(ui.classModuleFieldLabel).toBe("開講期");
    expect(ui.classModuleMax).toBe(4);
    expect(ui.classModuleMarks).toEqual({
      1: "春",
      2: "夏",
      3: "秋",
      4: "冬",
    });
    expect(ui.timetableLabels.springA).toBe("春");
    expect(ui.timetableLabels.springB).toBe("夏");
    expect(ui.timetableLabels.fallA).toBe("秋");
    expect(ui.timetableLabels.fallB).toBe("冬");
    expect(ui.timetableOrder).toEqual([
      "springA",
      "springB",
      "fallA",
      "fallB",
      "other",
    ]);
  });
});

describe("osakaTermMatchesModuleRange", () => {
  test("maps Osaka semesters onto 春夏秋冬 range", () => {
    expect(osakaTermMatchesModuleRange("春～夏学期", 1, 2)).toBe(true);
    expect(osakaTermMatchesModuleRange("春～夏学期", 3, 4)).toBe(false);
    expect(osakaTermMatchesModuleRange("秋～冬学期", 3, 4)).toBe(true);
    expect(osakaTermMatchesModuleRange("春学期", 1, 1)).toBe(true);
    expect(osakaTermMatchesModuleRange("夏学期", 1, 1)).toBe(false);
    expect(osakaTermMatchesModuleRange("通年", 1, 4)).toBe(true);
    expect(osakaTermMatchesModuleRange("通年", 1, 2)).toBe(false);
    expect(osakaTermMatchesModuleRange("集中", 3, 4)).toBe(true);
  });
});
