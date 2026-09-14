import { describe, expect, test } from "vitest";
import { applyCertifiedCredits, createCertifiedCredit } from "../certifiedCredits";
import { course } from "./helpers";

describe("applyCertifiedCredits", () => {
  test("名称と単位のある認定を認として末尾に足す", () => {
    const extra = createCertifiedCredit("外国語の認定単位", 2);
    const merged = applyCertifiedCredits(
      [course("GC00001", "専門", 2, "A")],
      [extra]
    );
    expect(merged).toHaveLength(2);
    expect(merged[1]).toMatchObject({
      id: "",
      name: "外国語の認定単位",
      unit: 2,
      grade: "認",
      year: 0,
    });
  });

  test("空の名称や0単位は無視する", () => {
    const merged = applyCertifiedCredits(
      [course("GC00001", "専門", 2, "A")],
      [
        { id: "a", name: "", unit: 2 },
        { id: "b", name: "検定", unit: 0 },
      ]
    );
    expect(merged).toHaveLength(1);
  });
});
