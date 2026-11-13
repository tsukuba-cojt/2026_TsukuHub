import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  insert: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("../lib/supabase", () => ({
  supabase: { from: mocks.from, rpc: mocks.rpc },
}));

import {
  getCourseClassificationSuggestions,
  saveCourseClassificationResponse,
} from "./courseClassificationResponseService";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.insert.mockResolvedValue({ error: null });
  mocks.from.mockReturnValue({ insert: mocks.insert });
  mocks.rpc.mockResolvedValue({ data: [], error: null });
});

describe("course classification response", () => {
  test("年度・要件・個人を含めず匿名の分類回答を追加する", async () => {
    await saveCourseClassificationResponse(
      {
        courseCode: " ba20021 ",
        courseName: " 関連科目候補 ",
        respondentDepartment: " 情報科学類 ",
        respondentMajor: "ソフトウェアサイエンス主専攻",
        classification: "related",
      },
      "university-1",
    );

    expect(mocks.from).toHaveBeenCalledWith(
      "course_classification_responses",
    );
    expect(mocks.insert).toHaveBeenCalledWith({
      university_id: "university-1",
      course_code: "BA20021",
      course_name: "関連科目候補",
      respondent_department: "情報科学類",
      respondent_major: "ソフトウェアサイエンス主専攻",
      classification: "related",
    });
  });

  test("科目名または回答者学類が空なら送信しない", async () => {
    await expect(
      saveCourseClassificationResponse(
        {
          courseCode: "TEST001",
          courseName: " ",
          respondentDepartment: "情報科学類",
          classification: "specialized",
        },
        "university-1",
      ),
    ).rejects.toThrow("科目名と回答者学類は必須です。");
    expect(mocks.from).not.toHaveBeenCalled();
  });

  test("複数科目の候補を1回で取得し、各科目の最上位候補を採用する", async () => {
    mocks.rpc.mockResolvedValue({
      data: [
        {
          course_key: "course-1",
          classification: "related",
          response_count: "5",
          weighted_score: "11",
        },
        {
          course_key: "course-1",
          classification: "common",
          response_count: "2",
          weighted_score: "4",
        },
        {
          course_key: "course-2",
          classification: "specialized",
          response_count: 3,
          weighted_score: 7,
        },
      ],
      error: null,
    });

    const suggestions = await getCourseClassificationSuggestions(
      [
        {
          key: "course-1",
          courseCode: "ba20021",
          courseName: "関連科目候補",
        },
        {
          key: "course-2",
          courseCode: "GB10001",
          courseName: "専門科目候補",
        },
      ],
      "university-1",
      "情報科学類",
      "ソフトウェアサイエンス主専攻",
    );

    expect(mocks.rpc).toHaveBeenCalledOnce();
    expect(mocks.rpc).toHaveBeenCalledWith(
      "get_course_classification_suggestions",
      {
        target_university_id: "university-1",
        target_courses: [
          {
            course_key: "course-1",
            course_code: "BA20021",
            course_name: "関連科目候補",
          },
          {
            course_key: "course-2",
            course_code: "GB10001",
            course_name: "専門科目候補",
          },
        ],
        target_department: "情報科学類",
        target_major: "ソフトウェアサイエンス主専攻",
      },
    );
    expect(suggestions.get("course-1")).toEqual({
      courseKey: "course-1",
      classification: "related",
      responseCount: 5,
      weightedScore: 11,
    });
    expect(suggestions.get("course-2")?.classification).toBe(
      "specialized",
    );
  });
});
