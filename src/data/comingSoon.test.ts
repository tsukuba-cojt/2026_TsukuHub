import { describe, expect, it } from "vitest";
import type { UniversityFeatureKey } from "../types/university";
import {
  isKnownAppPath,
  isUniversityComingSoon,
  shouldBlockInternalNavigation,
} from "./comingSoon";

const featureCheck = (enabled: UniversityFeatureKey[]) =>
  (feature: UniversityFeatureKey) => enabled.includes(feature);

describe("isUniversityComingSoon", () => {
  it("固定の未実装項目は大学に関係なく準備中にする", () => {
    expect(isUniversityComingSoon("/circles", featureCheck([]))).toBe(true);
  });

  it("大学側で停止している機能を準備中にする", () => {
    expect(isUniversityComingSoon("/graduation-checker", featureCheck(["courses"]))).toBe(true);
  });

  it("大学側で公開中の機能は操作可能にする", () => {
    expect(isUniversityComingSoon("/graduation-checker", featureCheck(["graduation_checker"]))).toBe(false);
  });

  it("複合メニューは対象機能が1つでも公開中なら操作可能にする", () => {
    expect(isUniversityComingSoon("/class/top", featureCheck(["courses"]))).toBe(false);
    expect(isUniversityComingSoon("/class/top", featureCheck([]))).toBe(true);
  });
});

describe("footer legal paths", () => {
  it("お問い合わせと利用規約は既知のページとして遷移できる", () => {
    expect(isKnownAppPath("/contact")).toBe(true);
    expect(isKnownAppPath("/terms")).toBe(true);
    expect(isKnownAppPath("/privacy")).toBe(true);
    expect(shouldBlockInternalNavigation("/contact")).toBe(false);
    expect(shouldBlockInternalNavigation("/terms")).toBe(false);
    expect(shouldBlockInternalNavigation("/privacy")).toBe(false);
  });
});
