import type {
  TimetableModuleKey,
  TimetableSlot,
  TimetableSpecialType,
} from "../../types/timetable";

const moduleBySeasonAndLetter: Record<
  "春" | "秋",
  Record<"A" | "B" | "C", TimetableModuleKey>
> = {
  春: { A: "springA", B: "springB", C: "springC" },
  秋: { A: "fallA", B: "fallB", C: "fallC" },
};

const dayAliases: Record<string, TimetableSlot["day"]> = {
  月: "月",
  mon: "月",
  monday: "月",
  火: "火",
  tue: "火",
  tuesday: "火",
  水: "水",
  wed: "水",
  wednesday: "水",
  木: "木",
  thu: "木",
  thursday: "木",
  金: "金",
  fri: "金",
  friday: "金",
};

const normalizeModuleText = (semester: string) =>
  semester
    .replace(/[ＡＢＣ]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - 0xfee0)
    )
    .replace(/\s+/g, "")
    .toUpperCase();

export const parseTimetableModules = (semester: string): TimetableModuleKey[] => {
  const normalized = normalizeModuleText(semester);
  const modules = new Set<TimetableModuleKey>();

  for (const match of normalized.matchAll(/([春秋])([ABC]+)/g)) {
    const season = match[1] as "春" | "秋";
    const letters = [...match[2]].filter(
      (letter): letter is "A" | "B" | "C" =>
        letter === "A" || letter === "B" || letter === "C"
    );
    letters.forEach((letter) => modules.add(moduleBySeasonAndLetter[season][letter]));
  }

  if (modules.size > 0) return [...modules];
  if (/^春学期$/.test(normalized) || /^春$/.test(normalized)) return ["springA"];
  if (/^夏学期$/.test(normalized) || /^夏$/.test(normalized)) return ["springB"];
  if (/^秋学期$/.test(normalized) || /^秋$/.test(normalized)) return ["fallA"];
  if (/^冬学期$/.test(normalized) || /^冬$/.test(normalized)) return ["fallB"];
  // 大阪大学: 春～夏 / 秋～冬（全角・半角の波線・ハイフンを許容）
  if (/春[～〜\-－–—]夏/.test(normalized)) {
    return ["springA", "springB", "springC"];
  }
  if (/秋[～〜\-－–—]冬/.test(normalized)) {
    return ["fallA", "fallB", "fallC"];
  }
  if (/通年|春学期|春学期前半|春学期後半/.test(normalized)) {
    return ["springA", "springB", "springC"];
  }
  if (/秋学期|秋学期前半|秋学期後半/.test(normalized)) {
    return ["fallA", "fallB", "fallC"];
  }
  return ["other"];
};

export const detectSpecialSchedule = (
  schedule: string
): TimetableSpecialType | undefined => {
  if (/集中|集中講義/.test(schedule)) return "intensive";
  if (/応談|応相談|応談可/.test(schedule)) return "consultation";
  if (/随時/.test(schedule)) return "anytime";
  if (/\bNT\b|ＮＴ/.test(schedule)) return "nt";
  return undefined;
};

const normalizeSchedule = (schedule: string) =>
  schedule
    .replace(/[（）]/g, " ")
    .replace(/[()]/g, " ")
    .replace(/[，、／/]/g, ",")
    .replace(/[－–—〜~]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

const expandPeriodExpression = (text: string): number[] => {
  const result = new Set<number>();
  const rangeMatch = text.match(/([1-6])\s*-\s*([1-6])/);
  if (rangeMatch) {
    const start = Number(rangeMatch[1]);
    const end = Number(rangeMatch[2]);
    for (let period = Math.min(start, end); period <= Math.max(start, end); period += 1) {
      result.add(period);
    }
  }

  const singleMatches = text.match(/[1-6]/g) ?? [];
  singleMatches.forEach((value) => result.add(Number(value)));
  return [...result].sort((a, b) => a - b);
};

export const parseTimetableSlots = (schedule: string): TimetableSlot[] => {
  const normalized = normalizeSchedule(schedule);
  const slots = new Map<string, TimetableSlot>();

  const jpPattern = /([月火水木金](?:[・,][月火水木金])*)\s*([1-6](?:\s*[-,]\s*[1-6])*)/g;
  for (const match of normalized.matchAll(jpPattern)) {
    const days = match[1]
      .split(/[・,]/)
      .filter((day): day is TimetableSlot["day"] =>
        day === "月" || day === "火" || day === "水" || day === "木" || day === "金"
      );
    for (const day of days) {
      for (const period of expandPeriodExpression(match[2])) {
        slots.set(`${day}${period}`, { day, period });
      }
    }
  }

  const enPattern =
    /\b(mon|monday|tue|tuesday|wed|wednesday|thu|thursday|fri|friday)\b\.?\s*([1-6](?:\s*[-,]\s*[1-6])*)/gi;
  for (const match of normalized.matchAll(enPattern)) {
    const day = dayAliases[match[1].toLowerCase()];
    if (!day) continue;
    for (const period of expandPeriodExpression(match[2])) {
      slots.set(`${day}${period}`, { day, period });
    }
  }

  return [...slots.values()].sort((a, b) => {
    const dayOrder = ["月", "火", "水", "木", "金"];
    return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day) || a.period - b.period;
  });
};
