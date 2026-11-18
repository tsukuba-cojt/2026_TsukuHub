import { describe, expect, it } from "vitest";
import {
  canNavigateBackInApp,
  fallbackNavBasePath,
  isNavBasePath,
} from "./pageBack";

describe("isNavBasePath", () => {
  it("グロナビの6つの入口だけをベースページにする", () => {
    expect(isNavBasePath("/")).toBe(true);
    expect(isNavBasePath("/career")).toBe(true);
    expect(isNavBasePath("/class/top")).toBe(true);
    expect(isNavBasePath("/circles")).toBe(true);
    expect(isNavBasePath("/lifestyle")).toBe(true);
    expect(isNavBasePath("/global")).toBe(true);
  });

  it("ベースから進んだページは対象外にする", () => {
    expect(isNavBasePath("/class")).toBe(false);
    expect(isNavBasePath("/career/internships")).toBe(false);
    expect(isNavBasePath("/news")).toBe(false);
  });
});

describe("fallbackNavBasePath", () => {
  it("講義系は講義トップへ戻す", () => {
    expect(fallbackNavBasePath("/class")).toBe("/class/top");
    expect(fallbackNavBasePath("/class/GC51234")).toBe("/class/top");
    expect(fallbackNavBasePath("/graduation-checker")).toBe("/class/top");
    expect(fallbackNavBasePath("/timetable")).toBe("/class/top");
  });

  it("キャリア配下はキャリアトップへ戻す", () => {
    expect(fallbackNavBasePath("/career/internships/abc")).toBe("/career");
  });

  it("それ以外はホームへ戻す", () => {
    expect(fallbackNavBasePath("/news")).toBe("/");
    expect(fallbackNavBasePath("/contact")).toBe("/");
    expect(fallbackNavBasePath("/mypage/applications")).toBe("/");
  });
});

describe("canNavigateBackInApp", () => {
  it("React Router の履歴インデックスがあるときだけ戻れる", () => {
    expect(canNavigateBackInApp({ idx: 2 })).toBe(true);
    expect(canNavigateBackInApp({ idx: 0 })).toBe(false);
  });
});
