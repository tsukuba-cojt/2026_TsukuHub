import { describe, expect, it } from "vitest";
import { canAccessUniversitySite } from "./universityAccess";

const tsukuba = "00000000-0000-4000-8000-000000000001";
const osaka = "00000000-0000-4000-8000-000000000002";

describe("canAccessUniversitySite", () => {
  it("所属大学なら学生でも入れる", () => {
    expect(
      canAccessUniversitySite({
        isAdmin: false,
        profileUniversityId: tsukuba,
        universityId: tsukuba,
      }),
    ).toBe(true);
  });

  it("別大学なら学生は入れない", () => {
    expect(
      canAccessUniversitySite({
        isAdmin: false,
        profileUniversityId: tsukuba,
        universityId: osaka,
      }),
    ).toBe(false);
  });

  it("全体管理者は所属に関係なく全大学を見られる", () => {
    expect(
      canAccessUniversitySite({
        isAdmin: true,
        profileUniversityId: tsukuba,
        universityId: osaka,
      }),
    ).toBe(true);
    expect(
      canAccessUniversitySite({
        isAdmin: true,
        profileUniversityId: null,
        universityId: osaka,
      }),
    ).toBe(true);
  });
});
