import { beforeEach, describe, expect, test, vi } from "vitest";
import type { ClassificationReportSelection } from "../features/graduationCheck/classificationReport";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), from: vi.fn(), insert: vi.fn() }));
vi.mock("../lib/supabase", () => ({
  supabase: { auth: { getUser: mocks.getUser }, from: mocks.from },
}));
import { formatClassMiscategorizedReportError, saveClassMiscategorizedReports } from "./classMiscategorizedReportService";

const selection: ClassificationReportSelection = {
  courseCode: "",
  courseName: "認定科目",
  originalClassification: "unclassified",
  correctedClassification: "specializedFoundation",
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getUser.mockResolvedValue({ data: { user: { email: "student@example.com" } }, error: null });
  mocks.from.mockReturnValue({ insert: mocks.insert });
  mocks.insert.mockResolvedValue({ error: null });
});

describe("誤分類報告の保存", () => {
  test("登録済みメールを使い、5列を一括保存し、空の科目番号を保持する", async () => {
    await saveClassMiscategorizedReports([
      selection,
      { ...selection, courseCode: "GA12345", originalClassification: "specializedFoundation", correctedClassification: "common" },
    ]);
    expect(mocks.from).toHaveBeenCalledWith("class_miscategorized_report");
    expect(mocks.insert).toHaveBeenCalledTimes(1);
    expect(mocks.insert).toHaveBeenCalledWith([
      { mail: "student@example.com", classname: "認定科目", classnumber: "", miscategorize: "unclassified", suggestedcategorize: "specialized_foundation" },
      { mail: "student@example.com", classname: "認定科目", classnumber: "GA12345", miscategorize: "specialized_foundation", suggestedcategorize: "common" },
    ]);
  });

  test.each([null, { email: undefined }])("未ログインやメール未登録の場合は保存しない", async (user) => {
    mocks.getUser.mockResolvedValue({ data: { user }, error: null });
    await expect(saveClassMiscategorizedReports([selection])).rejects.toThrow("ログイン");
    expect(mocks.from).not.toHaveBeenCalled();
  });

  test("認証エラーがあれば保存しない", async () => {
    const error = new Error("authentication failed");
    mocks.getUser.mockResolvedValue({ data: { user: null }, error });
    await expect(saveClassMiscategorizedReports([selection])).rejects.toBe(error);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  test("不正な報告は保存しない", async () => {
    await expect(saveClassMiscategorizedReports([])).rejects.toThrow("選択");
    await expect(saveClassMiscategorizedReports([{ ...selection, courseName: "" }])).rejects.toThrow("科目名");
    expect(mocks.from).not.toHaveBeenCalled();
  });

  test("保存失敗を呼び出し元に返す", async () => {
    const error = new Error("insert failed");
    mocks.insert.mockResolvedValue({ error });
    await expect(saveClassMiscategorizedReports([selection])).rejects.toBe(error);
  });

  test.each(["42703", "PGRST204", "42P01", "PGRST205"])("列・テーブルの不一致%sを通信エラーと区別する", (code) => {
    const message = formatClassMiscategorizedReportError({ code, message: "private information" });
    expect(message).toContain("テーブル・列");
    expect(message).toContain(code);
    expect(message).not.toContain("private information");
  });

  test("権限不足と不明なエラーを扱う", () => {
    expect(formatClassMiscategorizedReportError({ code: "42501" })).toContain("保存権限");
    expect(formatClassMiscategorizedReportError(new Error("Failed to fetch"))).toContain("通信環境");
    expect(formatClassMiscategorizedReportError(null)).toContain("送信に失敗");
  });
});
