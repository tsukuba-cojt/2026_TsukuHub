import { describe, expect, it } from "vitest";
import { resolveTenantPath } from "./tenantNavigation";

describe("resolveTenantPath", () => {
  it("大学トップを大学内のホームとして扱う", () => {
    expect(resolveTenantPath("/tsukuba", "tsukuba")).toEqual({
      isTenantPath: true,
      relativePath: "/",
    });
  });

  it("末尾スラッシュ付きの大学トップもホームとして扱う", () => {
    expect(resolveTenantPath("/osaka/", "osaka")).toEqual({
      isTenantPath: true,
      relativePath: "/",
    });
  });

  it("大学内ページから大学部分だけを取り除く", () => {
    expect(resolveTenantPath("/tsukuba/career", "tsukuba")).toEqual({
      isTenantPath: true,
      relativePath: "/career",
    });
  });

  it("似た名前の別パスを大学内ページと誤判定しない", () => {
    expect(resolveTenantPath("/tsukuba-extra", "tsukuba")).toEqual({
      isTenantPath: false,
      relativePath: "/tsukuba-extra",
    });
  });
});
