import { describe, expect, it } from "vitest";
import { resolveUniversityLanding } from "./resolveUniversityLanding";

describe("resolveUniversityLanding", () => {
  it("未ログインなら大学別ログインへ進む", () => {
    expect(resolveUniversityLanding({
      universityStatus: "active",
      isAuthenticated: false,
      isActiveUniversity: false,
      canAccessUniversity: false,
    })).toBe("login");
  });

  it("対象大学でログイン済みなら大学ホームを表示する", () => {
    expect(resolveUniversityLanding({
      universityStatus: "active",
      isAuthenticated: true,
      isActiveUniversity: true,
      canAccessUniversity: true,
    })).toBe("home");
  });

  it("別大学のセッションなら再ログインさせる", () => {
    expect(resolveUniversityLanding({
      universityStatus: "active",
      isAuthenticated: true,
      isActiveUniversity: false,
      canAccessUniversity: true,
    })).toBe("login");
  });

  it("全体管理者は別大学のセッションでも大学ホームを表示する", () => {
    expect(resolveUniversityLanding({
      universityStatus: "active",
      isAuthenticated: true,
      isActiveUniversity: false,
      canAccessUniversity: true,
      isAdmin: true,
    })).toBe("home");
  });

  it("停止中の大学はログインへ進めない", () => {
    expect(resolveUniversityLanding({
      universityStatus: "suspended",
      isAuthenticated: true,
      isActiveUniversity: true,
      canAccessUniversity: true,
    })).toBe("suspended");
  });
});
