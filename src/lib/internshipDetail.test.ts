import { describe, expect, it } from "vitest";
import { companyLocation, companyProfileSections, splitSelectionSteps } from "./internshipDetail";

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

describe("companyProfileSections", () => {
  it("ミッション・事業内容・学生に一言だけを返す", () => {
    expect(
      companyProfileSections({
        company_mission: "課題を技術で解決する",
        company_business: "学習支援プロダクトを開発する",
        company_message_to_students: "一緒に改善したいです",
        company_description: "使わない旧テキスト",
      }),
    ).toEqual([
      ["ミッション", "課題を技術で解決する"],
      ["事業内容", "学習支援プロダクトを開発する"],
      ["学生に一言", "一緒に改善したいです"],
    ]);
  });

  it("新項目が空なら旧企業紹介を事業内容に出す", () => {
    expect(
      companyProfileSections({
        company_mission: "",
        company_business: "",
        company_message_to_students: "",
        company_description: "教育領域のサンプル企業です。",
      }),
    ).toEqual([["事業内容", "教育領域のサンプル企業です。"]]);
  });
});

describe("companyLocation", () => {
  it("住所から Google マップ検索URLと埋め込みURLを作る", () => {
    expect(
      companyLocation({
        company_address: "茨城県つくば市天王台1丁目1-1",
        company_map_url: "",
      }),
    ).toEqual({
      address: "茨城県つくば市天王台1丁目1-1",
      mapUrl:
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent("茨城県つくば市天王台1丁目1-1"),
      embedUrl:
        "https://maps.google.com/maps?q=" +
        encodeURIComponent("茨城県つくば市天王台1丁目1-1") +
        "&hl=ja&z=16&output=embed",
    });
  });

  it("明示したマップURLを優先する", () => {
    expect(
      companyLocation({
        company_address: "茨城県つくば市天王台1丁目1-1",
        company_map_url: "https://maps.app.goo.gl/example",
      }).mapUrl,
    ).toBe("https://maps.app.goo.gl/example");
  });

  it("埋め込み用URLはそのまま使う", () => {
    const embed =
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1";
    expect(
      companyLocation({
        company_address: "",
        company_map_url: embed,
      }).embedUrl,
    ).toBe(embed);
  });
});
