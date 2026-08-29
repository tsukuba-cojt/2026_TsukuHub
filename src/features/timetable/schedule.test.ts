import { describe, expect, test } from "vitest";
import {
  detectSpecialSchedule,
  parseTimetableModules,
  parseTimetableSlots,
} from "./schedule";

describe("timetable schedule parser", () => {
  test("semester strings are mapped to Tsukuba modules", () => {
    expect(parseTimetableModules("春A 春B")).toEqual(["springA", "springB"]);
    expect(parseTimetableModules("秋Ｃ")).toEqual(["fallC"]);
    expect(parseTimetableModules("春AB")).toEqual(["springA", "springB"]);
    expect(parseTimetableModules("春BC")).toEqual(["springB", "springC"]);
    expect(parseTimetableModules("春ABC")).toEqual(["springA", "springB", "springC"]);
    expect(parseTimetableModules("秋AB")).toEqual(["fallA", "fallB"]);
    expect(parseTimetableModules("秋ABC")).toEqual(["fallA", "fallB", "fallC"]);
    expect(parseTimetableModules("春学期")).toEqual(["springA"]);
    expect(parseTimetableModules("夏学期")).toEqual(["springB"]);
    expect(parseTimetableModules("秋学期")).toEqual(["fallA"]);
    expect(parseTimetableModules("冬学期")).toEqual(["fallB"]);
    expect(parseTimetableModules("春学期前半")).toEqual([
      "springA",
      "springB",
      "springC",
    ]);
    expect(parseTimetableModules("春～夏")).toEqual([
      "springA",
      "springB",
      "springC",
    ]);
    expect(parseTimetableModules("秋～冬")).toEqual(["fallA", "fallB", "fallC"]);
    expect(parseTimetableModules("春-夏")).toEqual([
      "springA",
      "springB",
      "springC",
    ]);
    expect(parseTimetableModules("春")).toEqual(["springA"]);
    expect(parseTimetableModules("夏")).toEqual(["springB"]);
    expect(parseTimetableModules("秋")).toEqual(["fallA"]);
    expect(parseTimetableModules("冬")).toEqual(["fallB"]);
    expect(parseTimetableModules("集中講義")).toEqual(["other"]);
  });

  test("Japanese day and period expressions are parsed", () => {
    expect(parseTimetableSlots("月1,2 / 水3")).toEqual([
      { day: "月", period: 1 },
      { day: "月", period: 2 },
      { day: "水", period: 3 },
    ]);
    expect(parseTimetableSlots("木2-4")).toEqual([
      { day: "木", period: 2 },
      { day: "木", period: 3 },
      { day: "木", period: 4 },
    ]);
    expect(parseTimetableSlots("月・木1,2")).toEqual([
      { day: "月", period: 1 },
      { day: "月", period: 2 },
      { day: "木", period: 1 },
      { day: "木", period: 2 },
    ]);
  });

  test("special schedule types are detected separately", () => {
    expect(detectSpecialSchedule("集中講義")).toBe("intensive");
    expect(detectSpecialSchedule("応談")).toBe("consultation");
    expect(detectSpecialSchedule("随時")).toBe("anytime");
    expect(detectSpecialSchedule("NT")).toBe("nt");
  });
});
