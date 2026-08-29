import { describe, expect, it } from "vitest";
import { parseGradesCsv, GRADE_TABLE_HEADER } from "./parseCsv";

const sampleRow = [
  "001",
  "12345678",
  "2025",
  "春学期",
  "1",
  "全学共通教育科目",
  "人文科学系科目",
  "学問への扉",
  "",
  "",
  "2",
  "2025",
  "春学期",
  "A",
  "合",
].map((v) => `"${v}"`).join(",");

const sampleCsv = `${GRADE_TABLE_HEADER}\n${sampleRow}`;

describe("osaka parseGradesCsv", () => {
  it("parses KOAN grade CSV rows", () => {
    const { courses, errors } = parseGradesCsv(sampleCsv);
    expect(errors).toHaveLength(0);
    expect(courses).toHaveLength(1);
    expect(courses[0]).toMatchObject({
      name: "学問への扉",
      unit: 2,
      grade: "A",
      year: 2025,
      subjectGenre: "全学共通教育科目",
      subjectSubGenre: "人文科学系科目",
    });
    expect(courses[0].id).toBe("全学共通教育科目::人文科学系科目");
  });

  it("maps S grade to A+", () => {
    const row = sampleRow.replace('"A"', '"S"');
    const { courses } = parseGradesCsv(`${GRADE_TABLE_HEADER}\n${row}`);
    expect(courses[0].grade).toBe("A+");
  });

  it("parses reading program and gymnastics columns", () => {
    const rowWithExtras = [
      "001",
      "12345678",
      "2025",
      "春学期",
      "1",
      "全学共通教育科目",
      "人文科学系科目",
      "学問への扉",
      "RP",
      "GYM",
      "2",
      "2025",
      "春学期",
      "A",
      "合",
    ]
      .map((value) => `"${value}"`)
      .join(",");
    const { courses } = parseGradesCsv(`${GRADE_TABLE_HEADER}\n${rowWithExtras}`);
    expect(courses[0].readingProgram).toBe("RP");
    expect(courses[0].gymnastics).toBe("GYM");
  });

  it("returns error when header is missing", () => {
    const { courses, errors } = parseGradesCsv("invalid,data");
    expect(courses).toHaveLength(0);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("parses other-department sub-genre rows", () => {
    const row = [
      "001",
      "12345678",
      "2025",
      "春学期",
      "1",
      "他学科・専攻・教免等科目",
      "他学科・専攻・教免等科目",
      "他学部履修科目",
      "",
      "",
      "2",
      "2025",
      "春学期",
      "A",
      "合",
    ]
      .map((value) => `"${value}"`)
      .join(",");
    const { courses, errors } = parseGradesCsv(`${GRADE_TABLE_HEADER}\n${row}`);
    expect(errors).toHaveLength(0);
    expect(courses[0].subjectSubGenre).toBe("他学科・専攻・教免等科目");
  });
});
