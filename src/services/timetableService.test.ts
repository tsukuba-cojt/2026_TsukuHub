import { beforeEach, describe, expect, test, vi } from "vitest";
import { checkGraduation } from "../features/graduationCheck/checkGraduation";
import type { TimetableHistory } from "../types/timetable";

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  getCatalogCoursesByCodes: vi.fn(),
}));

vi.mock("../lib/supabase", () => ({
  supabase: { from: mocks.from },
}));
vi.mock("./courseCatalog", () => ({
  getCatalogCoursesByCodes: mocks.getCatalogCoursesByCodes,
}));

import {
  buildTimetableHistoriesFromGraduationReport,
  saveTimetableHistories,
} from "./timetableService";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getCatalogCoursesByCodes.mockResolvedValue(new Map());
});

describe("graduation check timetable persistence", () => {
  test("成績CSVの開講年度ごとに時間割履歴を生成する", async () => {
    const report = checkGraduation(
      [
        { id: "TEST023", name: "2023年度科目", unit: 1, grade: "A", year: 2023 },
        { id: "TEST026", name: "2026年度科目", unit: 2, grade: "B", year: 2026 },
      ],
      "coins-ss-26",
    );

    const histories = await buildTimetableHistoriesFromGraduationReport({
      report,
      department: "情報科学類",
      major: "ソフトウェアサイエンス主専攻",
      admissionYear: 2023,
      sharePublic: false,
      ownerId: "user-1",
      universityId: "university-1",
    });

    expect(mocks.getCatalogCoursesByCodes).toHaveBeenCalledWith(
      "university-1",
      ["TEST023"],
      2023,
    );
    expect(mocks.getCatalogCoursesByCodes).toHaveBeenCalledWith(
      "university-1",
      ["TEST026"],
      2026,
    );
    expect(histories.map((history) => history.academicYear)).toEqual([
      2026, 2023,
    ]);
  });

  test("判定後の年度別履歴と科目を既存のSupabaseテーブルへ保存する", async () => {
    const upsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: "history-1" },
          error: null,
        }),
      }),
    });
    const deleteRows = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    const insert = vi.fn().mockResolvedValue({ error: null });
    mocks.from.mockImplementation((table: string) =>
      table === "timetable_histories"
        ? { upsert }
        : { delete: deleteRows, insert },
    );
    const history: TimetableHistory = {
      id: "local-1",
      ownerId: "user-1",
      displayName: "ソフトウェアサイエンス 1年次",
      department: "情報科学類",
      major: "ソフトウェアサイエンス主専攻",
      admissionYear: 2023,
      academicYear: 2023,
      studentYearLabel: "1年次",
      trackLabel: "ソフトウェアサイエンス主専攻",
      earnedUnits: 2,
      sharePublic: false,
      courses: [
        {
          id: "course-1",
          courseCode: "TEST023",
          courseName: "年度確認科目",
          credits: 2,
          grade: "A",
          academicYear: 2023,
          semester: "春A",
          schedule: "月1",
          category: "related",
          modules: ["springA"],
          slots: [{ day: "月", period: 1 }],
        },
      ],
    };

    await expect(
      saveTimetableHistories([history], "user-1", "university-1"),
    ).resolves.toEqual(["history-1"]);
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        admission_year: 2023,
        academic_year: 2023,
      }),
      expect.any(Object),
    );
    expect(insert).toHaveBeenCalledWith([
      expect.objectContaining({
        history_id: "history-1",
        course_code: "TEST023",
        academic_year: 2023,
      }),
    ]);
  });
});
