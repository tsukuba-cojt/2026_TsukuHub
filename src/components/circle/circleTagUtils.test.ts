import { describe, expect, it } from "vitest";
import { addCircleTags } from "./circleTagUtils";

describe("サークルの自由入力タグ", () => {
  it("ハッシュ記号・空白・カンマで区切った日本語タグを重複なく追加する", () => {
    expect(addCircleTags(["初心者歓迎"], "#初心者歓迎 ＃アットホーム,学年不問、兼サー可能").tags)
      .toEqual(["初心者歓迎", "アットホーム", "学年不問", "兼サー可能"]);
  });

  it("上限超過時に既存のタグを失わず、追加分も一部だけ保存しない", () => {
    const current = Array.from({ length: 9 }, (_, i) => `タグ${i}`);
    const result = addCircleTags(current, "新規1 新規2");
    expect(result.error).toBeDefined();
    expect(result.tags).toEqual(current);
    expect(addCircleTags(current, "新規1").error).toBeUndefined();
  });

  it("文字数を検証し、絵文字を1文字として数える", () => {
    expect(addCircleTags([], "楽".repeat(31)).error).toBeDefined();
    expect(addCircleTags([], "😊".repeat(30)).error).toBeUndefined();
  });

  it("空の入力でタグを追加せず、上限到達後も同じタグを追加できる", () => {
    const current = Array.from({ length: 10 }, (_, i) => `タグ${i}`);
    expect(addCircleTags(current, " # ＃ ").tags).toEqual(current);
    expect(addCircleTags(current, "#タグ0").error).toBeUndefined();
  });
});
