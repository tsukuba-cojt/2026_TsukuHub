import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  insert: vi.fn(),
  select: vi.fn(),
  in: vi.fn(),
  eq: vi.fn(),
}));

vi.mock("../lib/supabase", () => ({
  supabase: { from: mocks.from },
}));

import {
  getClassCategorizeSuggestions,
  saveClassCategorize,
} from "./classCategorizeService";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.insert.mockResolvedValue({ error: null });
  mocks.eq.mockResolvedValue({ data: [], error: null });
  mocks.in.mockReturnValue({ eq: mocks.eq });
  mocks.select.mockReturnValue({ in: mocks.in });
  mocks.from.mockReturnValue({ insert: mocks.insert, select: mocks.select });
});

describe("class_categorizeからの分類候補取得", () => {
  test("同じ学類の回答だけを集計して最多分類を返す", async () => {
    mocks.eq.mockResolvedValue({
      data: [
        { classname: "認定科目", categorized: "common", major: "情報科学類" },
        { classname: "認定科目", categorized: "specialized", major: "他学類" },
        { classname: "認定科目", categorized: "specialized", major: "他学類" },
      ],
      error: null,
    });

    const suggestions = await getClassCategorizeSuggestions(
      ["認定科目"],
      "情報科学類",
    );

    expect(mocks.select).toHaveBeenCalledWith("classname,categorized,major");
    expect(mocks.in).toHaveBeenCalledWith("classname", ["認定科目"]);
    expect(mocks.eq).toHaveBeenCalledWith("major", "情報科学類");
    expect(suggestions.get("認定科目")).toBe("common");
  });

  test("同じ学類の回答がなければ、他学類の回答を候補にしない", async () => {
    mocks.eq.mockResolvedValue({
      data: [
        { classname: "認定科目", categorized: "related", major: "他学類" },
        { classname: "認定科目", categorized: "related", major: "別学類" },
        { classname: "認定科目", categorized: "common", major: "別学類" },
      ],
      error: null,
    });

    const suggestions = await getClassCategorizeSuggestions(
      ["認定科目"],
      "情報科学類",
    );

    expect(suggestions.has("認定科目")).toBe(false);
  });

  test("最多分類が同数なら自動入力しない", async () => {
    mocks.eq.mockResolvedValue({
      data: [
        { classname: "認定科目", categorized: "related", major: "情報科学類" },
        { classname: "認定科目", categorized: "common", major: "情報科学類" },
      ],
      error: null,
    });

    const suggestions = await getClassCategorizeSuggestions(
      ["認定科目"],
      "情報科学類",
    );

    expect(suggestions.has("認定科目")).toBe(false);
  });

  test("Supabaseの取得エラーを呼び出し元へ返す", async () => {
    const error = new Error("select failed");
    mocks.eq.mockResolvedValue({ data: null, error });

    await expect(
      getClassCategorizeSuggestions(["認定科目"], "情報科学類"),
    ).rejects.toBe(error);
  });
});

describe("class_categorizeへの分類保存", () => {
  test("授業名・分類先・入力者の学類を保存する", async () => {
    await saveClassCategorize({
      className: " 認定科目 ",
      categorized: "specializedFoundation",
      department: " 情報科学類 ",
    });

    expect(mocks.from).toHaveBeenCalledWith("class_categorize");
    expect(mocks.insert).toHaveBeenCalledWith({
      classname: "認定科目",
      categorized: "specialized_foundation",
      major: "情報科学類",
    });
  });

  test("授業名または学類が空なら保存しない", async () => {
    await expect(
      saveClassCategorize({
        className: " ",
        categorized: "related",
        department: "情報科学類",
      }),
    ).rejects.toThrow("授業名と入力した人の学類は必須です。");
    expect(mocks.from).not.toHaveBeenCalled();
  });

  test("Supabaseのエラーを呼び出し元へ返す", async () => {
    const error = new Error("insert failed");
    mocks.insert.mockResolvedValue({ error });

    await expect(
      saveClassCategorize({
        className: "認定科目",
        categorized: "common",
        department: "情報科学類",
      }),
    ).rejects.toBe(error);
  });
});
