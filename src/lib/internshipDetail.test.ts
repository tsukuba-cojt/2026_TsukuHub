import { describe, expect, it } from "vitest";
import { splitSelectionSteps } from "./internshipDetail";

describe("splitSelectionSteps", () => {
  it("矢印で区切った選考ステップを並べる", () => {
    expect(splitSelectionSteps("書類確認 → 面談 → 最終面談")).toEqual([
      "書類確認",
      "面談",
      "最終面談",
    ]);
  });

  it("空文字は空配列にする", () => {
    expect(splitSelectionSteps("  ")).toEqual([]);
  });
});
